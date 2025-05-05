import uuid
import db.agents        as db_a
import interface.agents as intf_a

from fastapi     import APIRouter, Request
from utils.utils import X_API_KEY_DEPS

router = APIRouter()


@router.post("/api_v1/agent/create")
def create_agent_sessions(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_a.AgentParams
):
    """Create a new agent record."""
    # Convert Pydantic model to dictionary and generate a UUID for the agent
    req_data = params.__dict__
    req_data["agent_id"] = str(uuid.uuid4())
    db_a.insert_agents_db(req_data)
    return {
        "status": "success",
        "msg": "agent inserted",
        "data": {"agent_id": req_data["agent_id"]},
    }


@router.post("/api_v1/agent/update")
def update_agent_sessions(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_a.AgentUpdateParams
):
    """Update an existing agent record."""
    # Update agent in database based on agent_id
    db_a.update_agents_db(params.__dict__, {"agent_id": params.agent_id})
    return {"status": "success", "msg": "agent updated"}


@router.post("/api_v1/agent/get")
def get_agent_sessions(
    _x_api_key: X_API_KEY_DEPS, request: Request, params: intf_a.AgentUpdateParams
):
    """Retrieve agent records based on provided parameters."""
    # If specific agent_id is provided, return just that agent
    if params.agent_id:
        count, results = db_a.get_all_agents_db(
            intf_a.RESULT_COLS, {"agent_id": params.agent_id}, {}
        )
        return {"status": "success", "data": results[0]}
    else:
        count, results = db_a.get_all_agents_db(intf_a.RESULT_COLS, params.__dict__, {})
        return {"status": "success", "data": results, "total_items": count}
