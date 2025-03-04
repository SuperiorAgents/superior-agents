# Agent Uptime Monitor
A monitoring service that checks the health of AI trading agents and automatically restarts them if they become unresponsive.

## Overview
This service monitors AI trading agents by checking their log file sizes. If a log file stops growing for 5 consecutive minutes, the service assumes the agent is stuck and automatically restarts it.

## Features
- Continuous monitoring of multiple AI trading agents
- Automatic agent restart on detection of inactivity
- Telegram notifications for agent status updates
- Log file backup before restart
- Supervisor-based process management

## Prerequisites
- Python 3.11
- Docker (optional)
- Supervisor
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd single-agent-uptime-checker
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
   - Set up Telegram bot token in `trigger-restart.py`
   - Update agent URLs in `live_agents_input.py`

## Configuration

### Agent Settings
The service monitors two agents defined in `live_agents_input.py`:

1. AGENT_1:
   - Model: deepseek_or
   - Trading instruments: spot
   - Research tools: CoinGecko, DuckDuckGo, Twitter

2. AGENT_2:
   - Model: deepseek_v3
   - Trading instruments: spot
   - Research tools: CoinGecko, DuckDuckGo, Twitter

### Supervisor Configuration
Worker processes are managed through `worker/worker.conf`:
- Each agent has its own supervised process
- Automatic restart on failure
- Separate log files for each agent

## Deployment


### Fly.io Deployment
The service is configured for deployment on Fly.io:
- Primary region: Singapore (sin)
- Memory allocation: 2GB
- Configuration in `fly.toml`

```bash
fly deploy
```

## Monitoring

### Health Checks
- Endpoint: Port 9030
- HTTP health check available
- Automated checks through Fly.io

### Log Monitoring
The service:
1. Checks file sizes every minute
2. Triggers restart after 5 minutes of inactivity
3. Backs up logs before restart
4. Sends Telegram notifications for:
   - Agent failures
   - Restart attempts
   - Successful restarts

## Architecture

```
├── trigger-restart.py     # Main monitoring logic
├── single_agent_creation.py   # Agent management
├── live_agents_input.py   # Agent configuration
├── worker/
│   └── worker.conf       # Supervisor config
└── Dockerfile            # Container configuration
```

## Logs

Log files are stored in:
- Agent 1: `/app/agent_1.log`
- Agent 2: `/app/agent_2.log`
- Error logs: `/app/agent_*.err.log`