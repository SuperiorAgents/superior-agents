import uuid
import db.user         as db_u
import interface.users as intf_u

from fastapi     import APIRouter, Request
from utils.utils import X_API_KEY_DEPS

router = APIRouter()


@router.post("/api_v1/user/create")
def create_user(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_u.UserParams
):
    """Create User record"""
    req_data = params.__dict__
    _, users = db_u.get_all_users_db(
        intf_u.RESULT_COLS, {"wallet_address": params.wallet_address}, {}
    )
    if len(users) > 0:
        return {"status": "success", "data": users[0]}
    req_data["user_id"] = str(uuid.uuid4())
    db_u.insert_users_db(req_data)

    _, users = db_u.get_all_users_db(
        intf_u.RESULT_COLS, {"user_id": req_data["user_id"]}, {}
    )
    return {"status": "success", "msg": "user inserted", "data": users[0]}


@router.post("/api_v1/user/update")
def update_user(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_u.UserUpdateParams
):
    """Update User record"""
    db_u.update_users_db(params.__dict__, {"user_id": params.user_id})
    return {"status": "success", "msg": "user updated"}


@router.post("/api_v1/user/get")
def get_user(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_u.UserUpdateParams
):
    """Get User record"""
    if params.user_id:
        count, results = db_u.get_all_users_db(
            intf_u.RESULT_COLS, {"user_id": params.user_id}, {}
        )
        return {"status": "success", "data": results[0]}
    else:
        count, results = db_u.get_all_users_db(intf_u.RESULT_COLS, params.__dict__, {})
        return {"status": "success", "data": results, "total_items": count}

