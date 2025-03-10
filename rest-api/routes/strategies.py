from fastapi import APIRouter, Request
from utils.utils import X_API_KEY_DEPS
import interface.strategies as intf_st
import db.strategies as db_st
import uuid

router = APIRouter()

@router.post('/api_v1/strategies/create')
def create_strategies(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_st.StrategyParams):
    req_data = params.__dict__
    req_data['strategy_id'] = str(uuid.uuid4())
    db_st.insert_strategies_db(req_data)
    return {'status':"success","msg":"strategy inserted", "data":{'strategy_id':req_data['strategy_id']}}

@router.post('/api_v1/strategies/update')
def update_strategies(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_st.StrategyUpdateParams):
    db_st.update_strategies_db(params.__dict__,{'strategy_id': params.strategy_id})
    return {'status':"success","msg":"strategy updated"}

@router.post('/api_v1/strategies/get')
def get_strategies(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_st.StrategyUpdateParams):
    if params.strategy_id:
        count, results = db_st.get_all_strategies_db(intf_st.RESULT_COLS,{"strategy_id":params.strategy_id},{})
        return {"status":"success", "data":results[0]}
    else:
        count, results = db_st.get_all_strategies_db(intf_st.RESULT_COLS,params.__dict__,{})
        return {"status":"success", "data":results, "total_items":count}
    