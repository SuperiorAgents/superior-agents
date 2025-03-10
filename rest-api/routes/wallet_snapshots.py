import uuid
import db.wallet_snapshots        as db_ws
import interface.wallet_snapshots as intf_ws

from fastapi     import APIRouter, Request
from utils.utils import X_API_KEY_DEPS

router = APIRouter()


@router.post("/api_v1/wallet_snapshots/create")
def create_wallet_snapshots(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_ws.WalletSnapshotsParams
):
    """Create wallet snapshot record"""
    req_data = params.__dict__
    req_data["snapshot_id"] = str(uuid.uuid4())
    db_ws.insert_wallet_snapshots_db(req_data)
    return {
        "status": "success",
        "msg": "wallet snapshots inserted",
        "data": {"snapshot_id": req_data["snapshot_id"]},
    }


@router.post("/api_v1/wallet_snapshots/update")
def update_wallet_snapshots(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_ws.WalletSnapshotsUpdateParams,
):
    """Update wallet snapshot record"""
    db_ws.update_wallet_snapshots_db(
        params.__dict__, {"snapshot_id": params.snapshot_id}
    )
    return {"status": "success", "msg": "wallet snapshots updated"}


@router.post("/api_v1/wallet_snapshots/get")
def get_wallet_snapshots(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_ws.WalletSnapshotsUpdateParams,
):
    """Get wallet snapshot record"""
    if params.snapshot_id:
        count, results = db_ws.get_all_wallet_snapshots_db(
            intf_ws.RESULT_COLS, {"snapshot_id": params.snapshot_id}, {}
        )
        return {"status": "success", "data": results[0]}
    else:
        count, results = db_ws.get_all_wallet_snapshots_db(
            intf_ws.RESULT_COLS, params.__dict__, {}
        )
        return {"status": "success", "data": results, "total_items": count}

