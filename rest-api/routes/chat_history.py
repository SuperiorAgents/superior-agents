from fastapi import APIRouter, Request
from utils.utils import X_API_KEY_DEPS
import interface.chat_history as intf_ch
import db.chat_history as db_as
import uuid

router = APIRouter()

@router.post('/api_v1/chat_history/create')
def create_chat_history(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_ch.ChatHistoryParams):
    req_data = params.__dict__
    req_data['history_id'] = str(uuid.uuid4())
    db_as.insert_chat_history_db(req_data)
    return {'status':"success","msg":"chat history inserted", "data":{'history_id':req_data['history_id']}}

@router.post('/api_v1/chat_history/update')
def update_chat_history(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_ch.ChatHistoryUpdateParams):
    db_as.update_chat_history_db(params.__dict__,{'history_id': params.history_id})
    return {'status':"success","msg":"chat history updated"}

@router.post('/api_v1/chat_history/get')
def get_chat_history(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_ch.ChatHistoryUpdateParams):
    if params.history_id:
        count, results = db_as.get_all_chat_history_db(intf_ch.RESULT_COLS,{"history_id":params.history_id},{})
        return {"status":"success", "data":results[0]}
    else:
        count, results = db_as.get_all_chat_history_db(intf_ch.RESULT_COLS,params.__dict__,{})
        return {"status":"success", "data":results, "total_items":count}
    