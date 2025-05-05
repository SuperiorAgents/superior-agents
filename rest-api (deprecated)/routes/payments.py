from fastapi import APIRouter, Request, HTTPException, Header
from utils.utils import X_API_KEY_DEPS
import db.agent_sessions as db_agent_sessions
import db.payments as db_payments
import interface.payments as intf_payments
import interface.agent_sessions as intf_as
import httpx
import logging
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import uuid

load_dotenv()
SESSION_API_URL = os.getenv("SESSION_API_URL")

router = APIRouter()
logger = logging.getLogger(__name__)


async def kill_session(session_id: str) -> bool:
    """
    Terminates a specific agent session via the session management service.

    Args:
        session_id (str): Unique identifier of the session to terminate

    Returns:
        bool: True if session was successfully terminated, False otherwise

    Raises:
        Logs errors but doesn't raise exceptions
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(f"{SESSION_API_URL}/sessions/{session_id}")
            return response.status_code == 200
    except Exception as e:
        logger.error(f"Error killing session: {str(e)}")
        return False


@router.post("/api_v1/payments/kill_session")
async def kill_agent_session(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_as.AgentSessionsParams
):
    """
    API endpoint to terminate an agent's active session.
    This Checks:
    - Session existence
    - Session running status
    - Payment time restrictions (will_end_at)

    Args:
        _x_api_key: API key for authentication
        request: FastAPI request object
        params: agent_id

    Returns:
        dict: Session termination status and details

    Raises:
        HTTPException:
            - 404: No active session found
            - 400: Session cannot be terminated yet
            - 500: Session termination failed
    """
    try:
        # Get sessions directly from database
        count, results = db_agent_sessions.get_all_agent_sessions_db(
            [
                "id",
                "session_id",
                "agent_id",
                "status",
                "started_at",
                "ended_at",
                "will_end_at",
            ],
            {"agent_id": params.agent_id, "status": "running"},
            {},
        )

        if count == 0:
            raise HTTPException(
                status_code=404, detail="No sessions found for this agent"
            )

        session = next((s for s in results if s.get("status") == "running"), None)

        if not session:
            raise HTTPException(
                status_code=404, detail="No running sessions found for this agent"
            )

        session_id = session["session_id"]
        will_end_at = session.get("will_end_at")

        # Check if session should be killed based on will_end_at
        current_time = datetime.now()
        if will_end_at and current_time < will_end_at:
            remaining_time = will_end_at - current_time
            raise HTTPException(
                status_code=400,
                detail=f"Session cannot be killed yet. {remaining_time.total_seconds() / 3600:.2f} hours remaining",
            )

        success = await kill_session(session_id)
        if success:
            db_agent_sessions.update_agent_sessions_db(
                {"status": "stopped", "ended_at": current_time},
                {"session_id": session_id},
            )
            return {
                "status": "success",
                "msg": "Session killed successfully",
                "data": {
                    "session_id": session_id,
                    "agent_id": params.agent_id,
                    "status": "stopped",
                    "ended_at": current_time,
                    "will_end_at": will_end_at,
                },
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to kill session")

    except Exception as e:
        logger.error(f"Error in kill_agent_session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api_v1/payments/topup")
def topup(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_payments.PaymentParams
):
    """
    Process payment and extend session duration.
    Features:
    - Validates active session
    - Calculates extension time (12 hours per dollar)
    - Records payment transaction
    - Updates session expiration time

    Args:
        _x_api_key: API key for authentication
        request: FastAPI request object
        params: Payment parameters (amount, agent_id)

    Returns:
        dict: Payment confirmation and updated session details

    Raises:
        HTTPException:
            - 404: No active session found
            - 500: Payment processing failed
    """
    try:
        # Get sessions directly from database
        count, results = db_agent_sessions.get_all_agent_sessions_db(
            [
                "id",
                "session_id",
                "agent_id",
                "status",
                "started_at",
                "ended_at",
                "will_end_at",
            ],
            {"agent_id": params.agent_id, "status": "running"},
            {},
        )

        if count == 0:
            raise HTTPException(
                status_code=404, detail="No active session found for this agent"
            )

        session = results[0]
        current_will_end_at = session.get("will_end_at")

        hours_per_dollar = 12
        extension_hours = hours_per_dollar * float(params.amount)

        if current_will_end_at:
            # If will_end_at exists, extend from that time
            new_will_end_at = current_will_end_at + timedelta(hours=extension_hours)

        # Insert payment record
        payment_data = params.__dict__
        if not payment_data.get("transaction_id"):
            payment_data["transaction_id"] = str(uuid.uuid4())
        payment_data["created_at"] = datetime.now()
        db_payments.insert_payments(payment_data)

        # Update agent session with new end time
        db_agent_sessions.update_agent_sessions_db(
            {"will_end_at": new_will_end_at}, {"session_id": session["session_id"]}
        )

        return {
            "status": "success",
            "msg": "Payment recorded and session extended",
            "data": {
                "transaction_id": payment_data["transaction_id"],
                "amount": params.amount,
                "hours_added": extension_hours,
                "will_end_at": new_will_end_at,
            },
        }

    except Exception as e:
        logger.error(f"Error in topup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
