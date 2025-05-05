import uuid
import logging
import db.notification        as db_not
import interface.notification as intf_not

from fastapi import APIRouter, Request
from utils.utils import X_API_KEY_DEPS

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/api_v1/notification/create")
def create_notification(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_not.NotificationsParams
):
    """Create a new notification record with duplicate prevention."""
    try:
        req_data = params.__dict__
        req_data["notification_id"] = str(uuid.uuid4())
        # Insert notification with duplicate prevention
        err = db_not.insert_notifications_prevent_duplicate_db(req_data)
        if err == "success":
            return {
                "status": "success",
                "msg": "notification inserted",
                "data": {"notification_id": req_data["notification_id"]},
            }
        else:
            return {"status": "error", "msg": err}
    except Exception as e:
        return {"status": "error", "msg": str(e)}


@router.post("/api_v1/notification/create_batch")
def create_batch_notifications(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_not.NotificationsBatchParams,
):
    """Create multiple notification records in a single batch operation."""
    try:
        # Convert the batch params to a dictionary
        batch_data = {"notifications": []}
        notification_ids = []

        # Process each notification in the batch
        for notification in params.notifications:
            # Convert Pydantic model to dict
            notification_dict = notification.dict()
            # Add notification_id
            notification_id = str(uuid.uuid4())
            notification_dict["notification_id"] = notification_id
            # Add to batch data
            batch_data["notifications"].append(notification_dict)
            # Track IDs for response
            notification_ids.append(notification_id)

        # Process the batch
        err = db_not.insert_notifications_batch_prevent_duplicate_db(batch_data)
        if err == "success":
            return {
                "status": "success",
                "msg": "notifications inserted",
                "data": {"notification_ids": notification_ids},
            }
        else:
            return {"status": "error", "msg": err}
    except Exception as e:
        return {"status": "error", "msg": str(e)}


@router.post("/api_v1/notification/update")
def update_notification(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_not.NotificationsUpdateParams,
):
    """Update an existing notification record."""
    try:
        # Validate that notification_id is provided
        if not params.notification_id:
            return {"status": "error", "msg": "notification_id is required"}
        # Update notification in database using notification_id as filter
        err = db_not.update_notifications_db(
            params.__dict__, {"notification_id": params.notification_id}
        )
        if err == "success":
            return {"status": "success", "msg": "notification updated"}
        else:
            return {"status": "error", "msg": err}
    except Exception as e:
        return {"status": "error", "msg": str(e)}


@router.post("/api_v1/notification/get")
def get_notification(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_not.NotificationsUpdateParams,
):
    """Retrieve notification records based on provided parameters."""
    try:
        if params.notification_id:
            status, count, results = db_not.get_all_notifications_db(
                intf_not.RESULT_COLS, {"notification_id": params.notification_id}, {}
            )
            if status == "success" and count > 0:
                return {"status": "success", "data": results[0]}
            elif status == "success":
                return {"status": "error", "msg": "notification not found"}
            else:
                return {"status": "error", "msg": status}
        else:
            status, count, results = db_not.get_all_notifications_db(
                intf_not.RESULT_COLS, params.__dict__, {}
            )
            if status == "success":
                return {"status": "success", "data": results, "total_items": count}
            else:
                return {"status": "error", "msg": status}
    except Exception as e:
        return {"status": "error", "msg": str(e)}


@router.post("/api_v1/notification/get_v2")
def get_notification(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_not.NotificationsUpdateParamsv2,
):
    """Version 2 endpoint to retrieve notification records with additional filtering options."""
    if params.notification_id:
        count, results = db_not.get_all_notifications_old_db(
            intf_not.RESULT_COLS, {"notification_id": params.notification_id}, {}
        )
        return {"status": "success", "data": results[0]}
    else:
        # Map sources parameter to source for compatibility
        params.source = params.sources

        where_dict = params.__dict__
        a = where_dict["limit"]
        del where_dict["sources"]
        del where_dict["limit"]
        # Get filtered notifications with pagination
        count, results = db_not.get_all_notifications_db(
            intf_not.RESULT_COLS, params.__dict__, {"page_size": a}
        )
        return {"status": "success", "data": results, "total_items": count}


@router.post("/api_v1/notification/get_v3")
def get_notification(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_not.NotificationsUpdateParamsv3,
):
    """Version 3 endpoint to retrieve notification records using specialized query method."""
    # Uses alfath query 
    count, results = db_not.get_notifications_alfath(
        intf_not.RESULT_COLS, params.sources, params.limit
    )
    return {"status": "success", "data": results, "total_items": count}


@router.get("/api_v1/notification/debug")
def debug_logging(_x_api_key: X_API_KEY_DEPS):
    """Debug endpoint to test logging functionality."""
    print("Direct print statement - should appear in console")

    logger.debug("This is a DEBUG message")
    logger.info("This is an INFO message")
    logger.warning("This is a WARNING message")
    logger.error("This is an ERROR message")

    # Test dictionary printing
    test_dict = {"key1": "value1", "key2": 123, "nested": {"inner_key": "inner_value"}}
    print("Printing dictionary:", test_dict)
    logger.info(f"Logging dictionary: {test_dict}")

    return {
        "status": "success",
        "msg": "Debug logs generated. Check your console/logs.",
        "test_data": test_dict,
    }


@router.get("/api_v1/notification/sources")
def get_rss_topics(_x_api_key: X_API_KEY_DEPS):
    """Get all available source notification from database"""
    try:
        status, count, sources = db_not.get_notification_sources()
        if status == "success":
            return {"status": "success", "total": count, "data": sources}
        else:
            return {"status": "error", "msg": status}
    except Exception as e:
        return {"status": "error", "msg": str(e)}
