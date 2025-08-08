# Dev env setup targets
.PHONY: up-env restart-env down-env uv-commit

# Python venv setup
install:
    python -m pip install pip
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

# Alternative setup using uv
uv-install:
    uv venv
    source .venv/bin/activate
    uv sync

# Generate requirements.txt from pyproject.toml
uv-commit:
    uv pip compile pyproject.toml -o requirements.txt

launch-trading:
    python scripts/main_trader.py test
    
launch-marketing:
    python scripts/main_marketing.py test

# Docker environment management commands
up-env:
    docker compose -f docker/docker-compose.yml up -d --build

restart-env:
    docker compose -f docker/docker-compose.yml restart

down-env:
    docker compose -f docker/docker-compose.yml down
