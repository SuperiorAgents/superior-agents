import os

from langchain_community.vectorstores.faiss import FAISS

from store import get_embeddings

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
THRESHOLD = 0.7

def convert_threshold(threshold_0_to_1: float) -> float:
    """
    Convert threshold from 0-1 range to -1 to 1 range.
    
    Args:
        threshold_0_to_1 (float): Threshold value between 0 and 1
        
    Returns:
        float: Converted threshold value between -1 and 1
        
    Examples:
        >>> convert_threshold(0.5)  # Returns 0.0
        >>> convert_threshold(0.75) # Returns 0.5
        >>> convert_threshold(0.25) # Returns -0.5
    """
    if not 0 <= threshold_0_to_1 <= 1:
        raise ValueError("Threshold must be between 0 and 1")
    
    return (2 * threshold_0_to_1) - 1

def get_context_from_kb(vectorstore: FAISS, query, numChunks, threshold):
    vector_retriever = vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": numChunks, "score_threshold": convert_threshold(threshold)}
    )
    result_docs = vector_retriever.invoke(query)

    return result_docs

def get_data_raw(query, agent_id, session_id, top_k, threshold, created_at):
    kb_id = f"{agent_id}_{session_id}"
    if not os.path.exists(f"../pkl/{kb_id}.pkl"):
        raise Exception('No vector database has been made. Please run the agent at least one time')

    vectorstore = FAISS.load_local('../pkl/', get_embeddings(), kb_id, allow_dangerous_deserialization=True, distance_strategy="COSINE")
    documents = get_context_from_kb(vectorstore, query, top_k, threshold)
    
    format_docs = [
        {
            "page_content": doc.page_content,
            "metadata": doc.metadata,
        }
        for doc in documents
    ]

    return format_docs