import uuid
import db.test        as db_tst
import interface.test as intf_tst

from fastapi     import APIRouter, Request
from utils.utils import X_API_KEY_DEPS
router = APIRouter()


@router.post("/api_v1/test/create")
def create_test(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_tst.TestParams
):
    """Create test record"""
    req_data = params.__dict__
    db_tst.insert_test_db(req_data)
    return {"status": "success", "msg": "test inserted"}


@router.post("/api_v1/test/update")
def update_test(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_tst.TestUpdateParams
):
    """Update test record"""
    db_tst.update_test_db(params.__dict__, {})
    return {"status": "success", "msg": "test updated"}


@router.post("/api_v1/test/get")
def get_test(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_tst.TestUpdateParams
):
    """Get test record"""
    count, results = db_tst.get_all_test_db(intf_tst.RESULT_COLS, params.__dict__, {})
    return {"status": "success", "data": results, "total_items": count}
