# Getting Started Guide

## Prerequisites

- Docker Engine
- Docker Compose

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/superior-agents.git
cd superior-agents
```

### 2. Build Agent Executor

```bash
docker build -f ./agent/docker/Dockerfile -t superioragents/agent-executor:latest ./agent/docker
# docker build -f ./agent/Dockerfile -t superioragents/agent-daemon ./agent
```

### 4. Start the Services

Launch all services using Docker Compose:

```bash
export TRADE_API_PORT=9009
export REST_API_PORT=9020
export FRONTEND_PORT=3000

docker compose up --force-recreate --build -d
```

### 5. Database Migration

Initialize the database schema:

> **Note**: Wait approximately 1 minute after starting services before running migrations to ensure MySQL is ready.

```bash
# Navigate to migrations directory
cd rest-api/migrations/

# Run database migration
docker compose exec -T mysql mysql -u superioragents -psuperioragents superioragents < 00001_init.sql
```

To verify migration success:

```bash
# Check if tables were created
docker compose exec mysql mysql -u superioragents -psuperioragents superioragents -e "SHOW TABLES;"
```

If you get a connection error, wait a few more seconds and try again - MySQL might still be initializing.

## Service URLs

- Frontend: http://localhost:3000
- Rest API: http://localhost:9020
- Meta Swap API: http://localhost:9009
- Agent Scheduler: http://localhost:4999

## Troubleshooting

If you encounter any issues:

1. Check service logs:

```bash
docker compose logs [service-name]
```

2. Verify all containers are running:

```bash
docker compose ps
```

3. Ensure all required ports are available:
   - 3000 (Frontend)
   - 9020 (Rest API)
   - 9009 (Meta Swap API)
   - 4999 (Agent Scheduler)
   - 3306 (MySQL)
   - 6379 (Redis)
