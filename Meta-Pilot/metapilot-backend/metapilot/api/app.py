"""
FastAPI application for MetaPilot.
"""

import os
import asyncio
from typing import Set

import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from metapilot.api.routes import router
from metapilot.services.monitoring_service import MonitoringService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="MetaPilot AI Engine API",
    description="API for MetaPilot AI Engine - Web3 Automation Platform with Gaia Agent Integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

# Initialize monitoring service
monitoring_service = MonitoringService()

# Background task manager
background_tasks: Set = set()


@app.on_event("startup")
async def startup_event():
    """Run on startup."""
    
    # Start background monitoring task
    task = asyncio.create_task(monitoring_service.run_background_monitoring())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)


# Run the server
def start():
    """Start the FastAPI server."""
    uvicorn.run(
        "metapilot.api.app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )


if __name__ == "__main__":
    start()
