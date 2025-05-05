from glob import glob
import os
from typing import List, Tuple

from dotenv import load_dotenv
from langchain_community.vectorstores.faiss import FAISS
from langchain_core.documents import Document
from loguru import logger

from src.store import get_embeddings

load_dotenv()

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


def get_context_from_kb(
	vectorstore: FAISS, query: str, num_chunks: int, threshold: float
):
	vector_retriever = vectorstore.as_retriever(
		search_type="similarity_score_threshold",
		search_kwargs={
			"k": num_chunks,
			"score_threshold": convert_threshold(threshold),
		},
	)
	result_docs = vector_retriever.invoke(query)

	return result_docs


def get_context_from_kb_with_top_k(vectorstore: FAISS, query: str, num_chunks: int):
	# Use similarity_search_with_score without a threshold
	# This will return the top k results regardless of their score
	results_with_scores = vectorstore.similarity_search_with_score(query, k=num_chunks)

	logger.info(f"`len(results_with_scores)`: {len(results_with_scores)}")

	return results_with_scores


def get_data_raw(
	query: str, agent_id: str, session_id: str, top_k: int, threshold: float
):
	kb_id = f"{agent_id}_{session_id}"
	if not os.path.exists(f"pkl/{kb_id}.pkl"):
		raise Exception(
			"No vector database has been made. Please run the agent at least one time"
		)

	vectorstore = FAISS.load_local(
		"pkl/",
		get_embeddings(),
		kb_id,
		allow_dangerous_deserialization=True,
		distance_strategy="COSINE",
	)
	documents = get_context_from_kb(vectorstore, query, top_k, threshold)

	format_docs = [
		{
			"page_content": doc.page_content,
			"metadata": doc.metadata,
		}
		for doc in documents
	]

	return format_docs


def get_data_raw_v2(
	query: str,
	agent_id: str,
	session_id: str,
	top_k: int,
) -> List[Tuple[Document, float]]:
	kb_id = f"{agent_id}_{session_id}"

	if not os.path.exists(f"pkl/{kb_id}.pkl"):
		raise Exception(
			"No vector database has been made. Please run the agent at least one time"
		)

	vectorstore = FAISS.load_local(
		"pkl/",
		get_embeddings(),
		kb_id,
		allow_dangerous_deserialization=True,
		distance_strategy="COSINE",
	)

	# Always get top_k results
	return get_context_from_kb_with_top_k(vectorstore, query, top_k)


def get_data_raw_v3(
	query: str,
	agent_id: str,
	top_k: int,
) -> List[Tuple[Document, float]]:
	"""
	Backward compatible KBs getter that let's us search multiple KBs based on only the `agent_id`.
	This should scan the `pkl/` folder and only get any KBs file that has that `agent_id`, not caring about the previously added `session_id`.
	"""
	pattern = f"pkl/{agent_id}*.pkl"
	matching_files = glob(pattern)

	if not matching_files:
		logger.error(
			"No vector database has exists for {agent_id} yet. Please insert atleast one strategy"
		)
		return []

	logger.info(f"`len(matching_files)` = {len(matching_files)}")

	base_name = os.path.basename(matching_files[0]).replace(".pkl", "")
	logger.info(f"Initializing vectorstore with `base_name` = {base_name}")

	vectorstore = FAISS.load_local(
		"pkl/",
		get_embeddings(),
		base_name,
		allow_dangerous_deserialization=True,
		distance_strategy="COSINE",
	)

	for file_path in matching_files[1:]:
		base_name = os.path.basename(file_path).replace(".pkl", "")
		logger.info(
			f"Merging the initialized vectorstore with `base_name` = {base_name}"
		)

		additional_index = FAISS.load_local(
			"pkl/",
			get_embeddings(),
			base_name,
			allow_dangerous_deserialization=True,
			distance_strategy="COSINE",
		)
		vectorstore.merge_from(additional_index)

	# Always get top_k results
	return get_context_from_kb_with_top_k(vectorstore, query, top_k)

def get_data_raw_v4(
	notification_query: str,
	agent_id: str,
	top_k: int,
) -> List[Tuple[Document, float]]:
	"""
	Backward compatible KBs getter that let's us search multiple KBs based on only the `agent_id`.
	This should scan the `pkl/` folder and only get any KBs file that has that `agent_id`, not caring about the previously added `session_id`.
	"""
	pattern = f"pkl/v4/{agent_id}*.pkl"
	matching_files = glob(pattern)

	if not matching_files:
		logger.error(
			f"No vector database has exists for {agent_id} yet. Please insert atleast one strategy"
		)
		return []

	base_name = os.path.basename(matching_files[0]).replace(".pkl", "")
	logger.info(f"Initializing vectorstore with `base_name` = {base_name}")

	vectorstore = FAISS.load_local(
		"pkl/v4/",
		get_embeddings(),
		base_name,
		allow_dangerous_deserialization=True,
		distance_strategy="COSINE",
	)

	for file_path in matching_files[1:]:
		base_name = os.path.basename(file_path).replace(".pkl", "")
		logger.info(
			f"Merging the initialized vectorstore with `base_name` = {base_name}"
		)

		additional_index = FAISS.load_local(
			"pkl/v4/",
			get_embeddings(),
			base_name,
			allow_dangerous_deserialization=True,
			distance_strategy="COSINE",
		)
		vectorstore.merge_from(additional_index)

	# Always get top_k results
	return get_context_from_kb_with_top_k(vectorstore, notification_query, top_k)
