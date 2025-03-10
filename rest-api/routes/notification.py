from fastapi import APIRouter, Request
from utils.utils import X_API_KEY_DEPS
import interface.notification as intf_not
import db.notification as db_not
import uuid

router = APIRouter()

@router.post('/api_v1/notification/create')
def create_notification(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_not.NotificationsParams):
    req_data = params.__dict__
    req_data['notification_id'] = str(uuid.uuid4())
    db_not.insert_notifications_db(req_data)
    return {'status':"success","msg":"notification inserted", "data":{'notification_id':req_data['notification_id']}}

@router.post('/api_v1/notification/update')
def update_notification(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_not.NotificationsUpdateParams):
    db_not.update_notifications_db(params.__dict__,{'notification_id': params.notification_id})
    return {'status':"success","msg":"notification updated"}

@router.post('/api_v1/notification/get')
def get_notification(_x_api_key: X_API_KEY_DEPS, request: Request, params: intf_not.NotificationsUpdateParams):
    if params.notification_id:
        count, results = db_not.get_all_notifications_db(intf_not.RESULT_COLS,{"notification_id":params.notification_id},{})
        return {"status":"success", "data":results[0]}
    else:
        count, results = db_not.get_all_notifications_db(intf_not.RESULT_COLS,params.__dict__,{})
        return {"status":"success", "data":results, "total_items":count}
    