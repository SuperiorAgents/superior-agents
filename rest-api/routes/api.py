from fastapi import FastAPI, HTTPException, Request, Response, WebSocket, WebSocketDisconnect, status
import routes.agent_sessions as agent_sessions
import routes.agents as agents
import routes.chat_history as chat_history
import routes.strategies as strategies
import routes.user as user
import routes.wallet_snapshots as wallet_snapshots
import routes.notification as notification
import logging, sys

app = FastAPI(
    
)

app.include_router(agent_sessions.router)
app.include_router(agents.router)
app.include_router(chat_history.router)
app.include_router(strategies.router)
app.include_router(user.router)
app.include_router(wallet_snapshots.router)
app.include_router(notification.router)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler(sys.stdout))
