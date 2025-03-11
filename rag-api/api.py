import os, logging, sys, traceback
from datetime import datetime
from fastapi import FastAPI, Request, Response, status
from typing import Optional
from pydantic import BaseModel
from store import ingest_doc as save_result

from dotenv import load_dotenv

load_dotenv()

from fetch import get_data_raw

class GetRelevantDocumentParams(BaseModel):
    query: str
    agent_id: str
    session_id: str
    top_k: Optional[int] = 5
    threshold: Optional[float] = 0.7
    created_at: Optional[str] = None

class SaveExecutionResultParams(BaseModel):
    agent_id: str
    session_id: str
    strategy: str
    strategy_data: str
    reference_id: str
    created_at: Optional[str] = None 

app = FastAPI()

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.info('RAG API is starting up')

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
        
def now():
    return datetime.utcnow().isoformat()
    
@app.post('/relevant_strategy_raw')
async def get_relevant_document_raw(request: Request, params: GetRelevantDocumentParams):
    try:
        request_data = params.__dict__
        query = request_data['query']
        agent_id = request_data['agent_id']
        session_id = request_data['session_id']
        top_k = request_data['top_k']
        threshold = request_data['threshold']
        created_at = request_data['created_at']

        data = get_data_raw(query=query, agent_id=agent_id, session_id=session_id, top_k=top_k, threshold=threshold, created_at=created_at)
        msg = 'Relevant strategy found'
        if len(data) == 0:
            msg = 'No relevant strategy found'
        return {'status': 'success', 'data': data, "msg": msg}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

@app.post('/save_result')
async def store_execution_result(request: Request, params: SaveExecutionResultParams):
    try:
        request_data = params.__dict__
        agent_id = request_data['agent_id']
        session_id = request_data['session_id']
        strategy = request_data['strategy']
        strategy_data = request_data['strategy_data']
        reference_id = request_data['reference_id']
        created_at = request_data['created_at'] or now()

        output = save_result(strategy=strategy, reference_id=reference_id, strategy_data=strategy_data, agent_id=agent_id, session_id=session_id, created_at=created_at)
        return {'status': 'success', 'message': output}
    except Exception as e:
        return {'status': 'error', 'message': f'Error: {str(e)}'}

@app.post('/save_result_batch')
async def store_execution_result_batch(request: Request):
    try:
        data = await request.json()
        for item in data:
            created_at = item.get('created_at')
            if created_at is None:
                    created_at = now()

            agent_id = item['agent_id']
            session_id = item['session_id']
            strategy = item['strategy']
            strategy_data = item['strategy_data']
            reference_id = item['reference_id']
            created_at = created_at

            output = save_result(strategy=strategy, reference_id=reference_id, strategy_data=strategy_data, agent_id=agent_id, session_id=session_id, created_at=created_at)
        return {'status': 'success', 'message': output}
    except Exception as e:
        print(f"Error: {traceback.format_exc()}")
        return {'status': 'error', 'message': f'Error: {str(e)}'}
