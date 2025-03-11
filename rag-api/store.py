from datetime import datetime, timedelta
from uuid import uuid4
import json
import os
import pickle

from langchain_text_splitters.character import RecursiveCharacterTextSplitter
from langchain_community.docstore.document import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.faiss import FAISS

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PKL_PATH = "../pkl/"

os.makedirs(PKL_PATH, exist_ok=True)

def get_embeddings():
    return OpenAIEmbeddings(
        openai_api_key=OPENAI_API_KEY,
        request_timeout=120,
        model="text-embedding-3-small",
        dimensions=1536,
    )

def check_duplicate(reference_id: str, kb_id: str):
    if os.path.exists(f"{PKL_PATH}{kb_id}.pkl"):
        vectorstore = FAISS.load_local('pkl/', get_embeddings(), kb_id, allow_dangerous_deserialization=True, distance_strategy="COSINE")
        documents = vectorstore.index_to_docstore_id.values()
        for doc_id in documents:
            if doc_id == reference_id:
                return True
    return False


def check_pkl_exists(kb_id: str):
    return os.path.exists(f"{PKL_PATH}{kb_id}.pkl")

def ingest_doc(strategy: str, reference_id: str, agent_id: str, session_id: str, strategy_data: str, created_at: str = None) -> str:
    kb_id = f"{agent_id}_{session_id}"
    text = f"Strategy: {strategy}\n"

    is_exist = check_pkl_exists(kb_id)

    if check_duplicate(reference_id, kb_id) and is_exist:
        print("Document already exists")
        return "Document already exists"

    document = Document(
        page_content=text,
        metadata={"reference_id": reference_id, "strategy_data": strategy_data, "created_at": created_at},
    )

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=100,
    )

    documents = [document]

    documents_splitted = text_splitter.split_documents(documents)
    for doc in documents_splitted:
        doc.id = str(reference_id)

    embeddings = get_embeddings()

    if is_exist:
        vectorstore = FAISS.load_local(PKL_PATH, embeddings, kb_id, allow_dangerous_deserialization=True, distance_strategy="COSINE")
        vectorstore.add_documents(documents_splitted)
    else:
        vectorstore = FAISS.from_documents(documents_splitted, embeddings, distance_strategy="COSINE")
    
    vectorstore.save_local(PKL_PATH, kb_id)

    print("Document ingested successfully")
    return "Document ingested successfully"