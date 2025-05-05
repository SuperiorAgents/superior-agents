import uuid
import db.agents                as db_a
import db.agent_sessions        as db_as
import interface.agents         as intf_a
import interface.agent_sessions as intf_as

from utils.utils import X_API_KEY_DEPS
from fastapi     import APIRouter, Request, HTTPException

router = APIRouter()


@router.post("/api_v1/agent_sessions/create")
def create_agent_sessions(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_as.AgentSessionsParams
):
    """Creates a new agent session."""
    # Check if agent exists first
    count, results = db_a.get_all_agents_db(
        intf_a.RESULT_COLS, {"agent_id": params.agent_id}, {}
    )
    # If no agent found with given agent_id, return 404 error
    if count == 0:
        raise HTTPException(
            status_code=404,
            detail=f"Agent with ID {params.agent_id} does not exist. Please create agent first.",
        )

    # Continue with session creation if agent exists
    req_data = params.__dict__
    if not params.session_id:
        req_data["session_id"] = str(uuid.uuid4())

    db_as.insert_agent_sessions_db(req_data)
    return {
        "status": "success",
        "msg": "agent session inserted",
        "data": {"session_id": req_data["session_id"]},
    }


@router.post("/api_v1/agent_sessions/update")
def update_agent_sessions(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_as.AgentSessionsUpdateParams,
):
    """Updates an existing agent session."""
    where_dict = {"session_id": params.session_id}
    if params.agent_id:
        where_dict["agent_id"] = params.agent_id
    db_as.update_agent_sessions_db(params.__dict__, where_dict)
    return {"status": "success", "msg": "agent session updated"}


@router.post("/api_v1/agent_sessions/get")
def get_agent_sessions(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_as.AgentSessionsUpdateParams,
):
    """
    Retrieves agent session(s) based on provided parameters.
    - If session_id is provided, returns a single session.
    - Else, return all sessions matching the provided parameters.
    """
    # If session_id is provided, get single session
    if params.session_id:
        count, results = db_as.get_all_agent_sessions_db(
            intf_as.RESULT_COLS, {"session_id": params.session_id}, {}
        )
        return {"status": "success", "data": results[0]}
    else:
        count, results = db_as.get_all_agent_sessions_db(
            intf_as.RESULT_COLS, params.__dict__, {}
        )
        return {"status": "success", "data": results, "total_items": count}


@router.post("/api_v1/agent_sessions/get_v2")
def get_agent_sessions(
    _x_api_key: X_API_KEY_DEPS,
    request: Request,
    params: intf_as.AgentSessionsUpdateParams,
):
    """Alternative endpoint to retrieve agent sessions (v2)."""
    # Get all sessions matching parameters
    count, results = db_as.get_all_agent_sessions_db(
        intf_as.RESULT_COLS, params.__dict__, {}
    )
    return {"status": "success", "data": results, "total_items": count}
