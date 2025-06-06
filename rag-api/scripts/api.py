import os
from datetime import datetime
from typing import Generic, List, TypeVar

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from loguru import logger

from src.fetch import get_data_raw, get_data_raw_v3, get_data_raw_v4
from src.store import save_result as save_result, save_result_v4


class SaveResultParams(BaseModel):
	agent_id: str
	session_id: str
	strategy: str
	strategy_data: str
	reference_id: str
	created_at: str = datetime.now().isoformat()


class SaveResultParamsV4(BaseModel):
	notification_key: str
	strategy_data: str
	reference_id: str
	agent_id: str
	session_id: str
	created_at: str = datetime.now().isoformat()


logger.info("App is starting")

app = FastAPI(
	# docs_url=None,
	# redoc_url=None,
)


@app.get("/health")
async def health_check():
	return {"status": "healthy"}


def now():
	return datetime.now().isoformat()


T = TypeVar("T")


class TypicalResponse(BaseModel, Generic[T]):
	status: str
	message: str
	data: T


class GetRelevantStrategyRawParams(BaseModel):
	query: str
	agent_id: str
	session_id: str
	top_k: int = 5
	threshold: float = 0.7
	created_at: str = datetime.now().isoformat()


class RelevantStrategyData(BaseModel):
	class RelevantStrategyMetadata(BaseModel):
		reference_id: str
		strategy_data: str
		created_at: str

	page_content: str
	metadata: RelevantStrategyMetadata


@app.post("/relevant_strategy_raw")
async def get_relevant_document_raw(
	request: Request, params: GetRelevantStrategyRawParams
) -> TypicalResponse[List[RelevantStrategyData]]:
	try:
		query = params.query
		agent_id = params.agent_id
		session_id = params.session_id
		top_k = params.top_k
		threshold = params.threshold

		data = get_data_raw(
			query=query,
			agent_id=agent_id,
			session_id=session_id,
			top_k=top_k,
			threshold=threshold,
		)

		message = "Relevant strategy found"

		if len(data) == 0:
			message = "No relevant strategy found"

		return TypicalResponse[List[RelevantStrategyData]](
			status="success",
			data=[
				RelevantStrategyData(
					page_content=doc["page_content"],
					metadata=RelevantStrategyData.RelevantStrategyMetadata(
						reference_id=doc["metadata"]["reference_id"],
						strategy_data=doc["metadata"]["strategy_data"],
						created_at=doc["metadata"]["created_at"],
					),
				)
				for doc in data
			],
			message=message,
		)
	except Exception as e:
		logger.error(
			"Error on `/relevant_strategy_raw`, \n"  #
			f"`params`: \n{params}\n"
			f"`e`: \n{e}",
		)
		raise HTTPException(
			detail={
				"status": "error",
				"message":  #
				"Error on `/relevant_strategy_raw`, \n"  #
				f"`params`: \n{params}\n"
				f"`e`: \n{e}",
			},
			status_code=500,
		)


class GetRelevantStrategyRawParamsV2(BaseModel):
	query: str
	agent_id: str
	session_id: str
	top_k: int = 1


class RelevantStrategyDataV2(BaseModel):
	class RelevantStrategyMetadata(BaseModel):
		reference_id: str
		strategy_data: str
		created_at: str
		similarity: float

	page_content: str
	metadata: RelevantStrategyMetadata


@app.post("/relevant_strategy_raw_v2")
async def get_relevant_document_raw_v2(
	request: Request, params: GetRelevantStrategyRawParamsV2
) -> TypicalResponse[List[RelevantStrategyDataV2]]:
	try:
		query = params.query
		agent_id = params.agent_id
		_ = params.session_id
		top_k = params.top_k

		data = get_data_raw_v3(
			query=query,
			agent_id=agent_id,
			top_k=top_k,
		)

		message = "Relevant strategy found"

		if len(data) == 0:
			message = "No relevant strategy found"

		return TypicalResponse[List[RelevantStrategyDataV2]](
			status="success",
			data=[
				RelevantStrategyDataV2(
					page_content=doc.page_content,
					metadata=RelevantStrategyDataV2.RelevantStrategyMetadata(
						reference_id=doc.metadata["reference_id"],
						strategy_data=doc.metadata["strategy_data"],
						created_at=doc.metadata["created_at"],
						similarity=distance,
					),
				)
				for doc, distance in data
			],
			message=message,
		)
	except Exception as e:
		logger.error(
			"Error on `/relevant_strategy_raw_v2`, \n"  #
			f"`params`: \n{params}\n"
			f"`e`: \n{e}",
		)
		raise HTTPException(
			detail={
				"status": "error",
				"message":  #
				"Error on `/relevant_strategy_raw_v2`, \n"  #
				f"`params`: \n{params}\n"
				f"`e`: \n{e}",
			},
			status_code=500,
		)


class GetRelevantStrategyRawParamsV4(BaseModel):
	query: str
	agent_id: str
	session_id: str
	top_k: int = 1


class RelevantStrategyDataV4(BaseModel):
	class RelevantStrategyMetadata(BaseModel):
		reference_id: str
		strategy_data: str
		created_at: str
		distance: float

	page_content: str
	metadata: RelevantStrategyMetadata


@app.post("/relevant_strategy_raw_v4")
async def get_relevant_document_raw_v4(
	request: Request, params: GetRelevantStrategyRawParamsV4
) -> TypicalResponse[List[RelevantStrategyDataV4]]:
	try:
		notification_query = params.query
		agent_id = params.agent_id
		_ = params.session_id
		top_k = params.top_k

		data = get_data_raw_v4(  # noqa: F821
			notification_query=notification_query,
			agent_id=agent_id,
			top_k=top_k,
		)

		message = "Relevant strategy found"

		if len(data) == 0:
			message = "No relevant strategy found"

		return TypicalResponse[List[RelevantStrategyDataV4]](
			status="success",
			data=[
				RelevantStrategyDataV4(
					page_content=doc.page_content,
					metadata=RelevantStrategyDataV4.RelevantStrategyMetadata(
						reference_id=doc.metadata["reference_id"],
						strategy_data=doc.metadata["strategy_data"],
						created_at=doc.metadata["created_at"],
						distance=distance,
					),
				)
				for doc, distance in data
			],
			message=message,
		)
	except Exception as e:
		logger.error(
			"Error on `/relevant_strategy_raw_v4`, \n"  #
			f"`params`: \n{params}\n"
			f"`e`: \n{e}",
		)
		raise HTTPException(
			detail={
				"status": "error",
				"message":  #
				"Error on `/relevant_strategy_raw_v4`, \n"  #
				f"`params`: \n{params}\n"
				f"`e`: \n{e}",
			},
			status_code=500,
		)


@app.post("/save_result")
async def store_execution_result(request: Request, params: SaveResultParams):
	try:
		agent_id = params.agent_id
		session_id = params.session_id
		strategy = params.strategy
		strategy_data = params.strategy_data
		reference_id = params.reference_id
		created_at = params.created_at

		output = save_result(
			strategy=strategy,
			reference_id=reference_id,
			strategy_data=strategy_data,
			agent_id=agent_id,
			session_id=session_id,
			created_at=created_at,
		)

		return TypicalResponse(
			status="success",
			message="Result saved",
			data={"output": output},
		)
	except Exception as e:
		return JSONResponse(
			{
				"status": "error",
				"message":  #
				"Error on `/save_result`, \n"  #
				f"`params`: \n{params}\n"
				f"`e`: \n{e}",
			},
			status_code=500,
		)


@app.post("/save_result_v4")
async def store_execution_result_v4(request: Request, params: SaveResultParamsV4):
	try:
		output = save_result_v4(
			notification_key=params.notification_key,
			strategy_id=params.reference_id,
			strategy_data=params.strategy_data,
			agent_id=params.agent_id,
			created_at=params.created_at,
		)

		return TypicalResponse(
			status="success",
			message="Result saved",
			data={"output": output},
		)
	except Exception as e:
		return JSONResponse(
			{
				"status": "error",
				"message":  #
				"Error on `/save_result`, \n"  #
				f"`params`: \n{params}\n"
				f"`e`: \n{e}",
			},
			status_code=500,
		)


@app.post("/save_result_batch")
async def store_execution_result_batch(params: List[SaveResultParams]):
	try:
		outputs = []
		for item in params:
			output = save_result(
				strategy=item.strategy,
				reference_id=item.reference_id,
				strategy_data=item.strategy_data,
				agent_id=item.agent_id,
				session_id=item.session_id,
				created_at=item.created_at,
			)
			outputs.append(output)

		return TypicalResponse(
			status="success",
			message="Result saved",
			data={"outputs": outputs},
		)
	except Exception as e:
		raise HTTPException(
			detail={
				"status": "error",
				"message":  #
				"Error on `/save_result_batch`, \n"  #
				f"`params`: \n{params}\n"
				f"`e`: \n{e}",
			},
			status_code=500,
		)


@app.post("/save_result_batch_v4")
async def store_execution_result_batch_v4(params: List[SaveResultParamsV4]):
	try:
		outputs = []
		for item in params:
			output = save_result_v4(
				notification_key=item.notification_key,
				strategy_id=item.reference_id,
				strategy_data=item.strategy_data,
				agent_id=item.agent_id,
				created_at=item.created_at,
			)
			outputs.append(output)

		return TypicalResponse(
			status="success",
			message="Result saved",
			data={"outputs": outputs},
		)
	except Exception as e:
		raise HTTPException(
			detail={
				"status": "error",
				"message":  #
				"Error on `/save_result_batch_v4`, \n"  #
				f"`params`: \n{params}\n"
				f"`e`: \n{e}",
			},
			status_code=500,
		)


if __name__ == "__main__":
	port = int(os.environ.get("PORT", "32771"))
	host = os.environ.get("HOST", "0.0.0.0")

	uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
	port = int(os.environ.get("PORT", "32771"))
	host = os.environ.get("HOST", "0.0.0.0")

	uvicorn.run(app, host=host, port=port)
