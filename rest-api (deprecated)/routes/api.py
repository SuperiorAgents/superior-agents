"""
Main API Router Configuration
This module serves as the central routing hub for the Superior CRUD API.

Imports:
    - FastAPI components for API functionality
    - Route modules for different API endpoints:
        * agent_sessions:   Session management for agents
        * agents:           Agent-related operations
        * chat_history:     Chat log management
        * strategies:       Trading strategy operations
        * user:             User management functions
        * wallet_snapshots: Wallet tracking
        * notification:     System notifications
        * test:             Testing endpoints
        * payments:         Payment processing and tracking

Router Setup:
    - Creates FastAPI instance
    - Includes all route modules
    - Configures logging

Logger Configuration:
    - Debug level logging
    - Outputs to stdout for monitoring
"""

from fastapi import (
    FastAPI,
    HTTPException,
    Request,
    Response,
    WebSocket,
    WebSocketDisconnect,
    status,
)

import logging, sys

import routes.test             as test
import routes.user             as user
import routes.agents           as agents
import routes.payments         as payments
import routes.strategies       as strategies
import routes.chat_history     as chat_history
import routes.notification     as notification
import routes.agent_sessions   as agent_sessions
import routes.wallet_snapshots as wallet_snapshots

app = FastAPI()

app.include_router(agent_sessions.router)
app.include_router(agents.router)
app.include_router(chat_history.router)
app.include_router(strategies.router)
app.include_router(user.router)
app.include_router(wallet_snapshots.router)
app.include_router(notification.router)
app.include_router(test.router)
app.include_router(payments.router)

logger = logging.getLogger(__name__)

logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler(sys.stdout))
