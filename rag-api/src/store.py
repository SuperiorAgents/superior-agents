import os
from datetime import datetime

from langchain_community.docstore.document import Document
from langchain_community.vectorstores.faiss import FAISS
from langchain_openai import OpenAIEmbeddings
from loguru import logger

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PKL_PATH = "pkl/"

os.makedirs("pkl/", exist_ok=True)
os.makedirs("pkl/v4", exist_ok=True)


def get_embeddings():
	return OpenAIEmbeddings(
		openai_api_key=OPENAI_API_KEY,  # type: ignore
		request_timeout=120,  # type: ignore
		model="text-embedding-3-small",
		dimensions=1536,
	)


def check_if_reference_id_exists_in_kb(
	kb_id: str, strategy_id: str, pkl_folder=PKL_PATH
):
	pkl_folder = pkl_folder.rstrip("/")
	pkl_path = f"{pkl_folder}/{kb_id}.pkl"

	if os.path.exists(pkl_path):
		vectorstore = FAISS.load_local(
			pkl_folder,
			get_embeddings(),
			kb_id,
			allow_dangerous_deserialization=True,
			distance_strategy="COSINE",
		)
		documents = vectorstore.index_to_docstore_id.values()

		for doc_id in documents:
			if doc_id == strategy_id:
				return True
	return False


def check_pkl_exists(kb_id: str, pkl_folder=PKL_PATH):
	pkl_folder = pkl_folder.rstrip("/")

	return os.path.exists(f"{pkl_folder}/{kb_id}.pkl")


def save_result(
	strategy: str,
	reference_id: str,
	agent_id: str,
	session_id: str,
	strategy_data: str,
	created_at: str = datetime.now().isoformat(),
) -> str:
	kb_id = f"{agent_id}_{session_id}"
	text = f"Strategy: {strategy}\n"

	is_exist = check_pkl_exists(kb_id)

	if check_if_reference_id_exists_in_kb(reference_id, kb_id) and is_exist:
		print("Document already exists")
		return "Document already exists"

	document = Document(
		page_content=text,
		metadata={
			"reference_id": reference_id,
			"strategy_data": strategy_data,
			"created_at": created_at,
		},
	)

	documents = [document]
	for doc in documents:
		doc.id = str(reference_id)

	embeddings = get_embeddings()

	if is_exist:
		vectorstore = FAISS.load_local(
			"pkl/",
			embeddings,
			kb_id,
			allow_dangerous_deserialization=True,
			distance_strategy="COSINE",
		)
		vectorstore.add_documents(documents)
	else:
		vectorstore = FAISS.from_documents(
			documents, embeddings, distance_strategy="COSINE"
		)

	vectorstore.save_local("pkl/", kb_id)

	print("Document ingested successfully")
	return "Document ingested successfully"


def save_result_v4(
	notification_key: str,
	strategy_data: str,
	strategy_id: str,
	agent_id: str,
	created_at: str = datetime.now().isoformat(),
) -> str:
	"""
	This function is for future made KBs so that it doesnt have to be bounded to the session_id
	"""

	kb_id = f"{agent_id}"
	text = f"Notification: {notification_key}"

	is_exist = check_pkl_exists(kb_id, pkl_folder="./pkl/v4")

	if (
		check_if_reference_id_exists_in_kb(
			kb_id=kb_id, strategy_id=strategy_id, pkl_folder="./pkl/v4"
		)
		and is_exist
	):
		logger.info(
			f"Strategy with the `strategy_id` of {strategy_id} has already been before ingested for `kb_id` of {kb_id}"
		)
		return f"Strategy with the `strategy_id` of {strategy_id} has already been before ingested for `kb_id` of {kb_id}"

	document = Document(
		page_content=text,
		metadata={
			"reference_id": strategy_id,
			"strategy_data": strategy_data,
			"created_at": created_at,
		},
	)
	document.id = str(strategy_id)

	embeddings = get_embeddings()

	if is_exist:
		vectorstore = FAISS.load_local(
			"pkl/v4/",
			embeddings,
			kb_id,
			allow_dangerous_deserialization=True,
			distance_strategy="COSINE",
		)
		vectorstore.add_documents([document])
	else:
		vectorstore = FAISS.from_documents(
			[document], embeddings, distance_strategy="COSINE"
		)

	vectorstore.save_local("pkl/v4/", kb_id)

	logger.info(
		f"Document ingested successfully for `agent_id`: {agent_id}, `strategy_id`: {strategy_id}"
	)
	return "Document ingested successfully"
