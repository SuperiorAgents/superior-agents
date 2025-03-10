from fastapi import APIRouter, Request
from utils.utils import X_API_KEY_DEPS
import interface.agent_sessions as intf_as
import db.agent_sessions as db_as
import uuid

router = APIRouter()

@router.post('/api_v1/agent_sessions/create')
def create_agent_sessions(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_as.AgentSessionsParams):
    req_data = params.__dict__
    if not params.session_id:
        req_data['session_id'] = str(uuid.uuid4())
    db_as.insert_agent_sessions_db(req_data)
    return {'status':"success","msg":"agent session inserted", "data":{'session_id':req_data['session_id']}}

@router.post('/api_v1/agent_sessions/update')
def update_agent_sessions(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_as.AgentSessionsUpdateParams):
    db_as.update_agent_sessions_db(params.__dict__,{'session_id': params.session_id})
    return {'status':"success","msg":"agent session updated"}

@router.post('/api_v1/agent_sessions/get')
def get_agent_sessions(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_as.AgentSessionsUpdateParams):
    if params.session_id:
        count, results = db_as.get_all_agent_sessions_db(intf_as.RESULT_COLS,{"session_id":params.session_id},{})
        return {"status":"success", "data":results[0]}
    else:
        count, results = db_as.get_all_agent_sessions_db(intf_as.RESULT_COLS,params.__dict__,{})
        return {"status":"success", "data":results, "total_items":count}
    