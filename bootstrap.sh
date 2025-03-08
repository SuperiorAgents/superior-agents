#!/bin/bash
set -e

# Bootstrap Script for Superior Agent Setup

check_python_version() {
	required="3.12"
	current=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
	if [[ $(echo "$current < $required" | bc -l) -eq 1 ]]; then
		echo "Error: Python $required+ required (found $current)" >&2
		exit 1
	fi
}

setup_agent() {
	echo "🐍 Setting up Agent virtual environment..."
	python3 -m venv agent-venv
	source agent-venv/bin/activate
	cd agent
	pip install -e . >/dev/null 2>&1
	cp .env.example .env
	cd ..
	deactivate
}

setup_api() {
	echo "🚀 Setting up API/DB virtual environment..."
	python3 -m venv api-db-venv
	source api-db-venv/bin/activate
	cd api_db
	pip install -r requirements.txt >/dev/null 2>&1
	cp .env.example .env
	python init_db.py
	cd ..
	deactivate
}

main() {
	# Verify system requirements
	check_python_version
	command -v docker >/dev/null 2>&1 || {
		echo >&2 "Error: Docker required but not found"
		exit 1
	}
	command -v docker compose >/dev/null 2>&1 || {
		echo >&2 "Error: Docker Compose required but not found"
		exit 1
	}

	# Create virtual environments
	setup_agent
	setup_api

	echo -e "\n✅ Setup complete!\n"
	echo "Usage Instructions:"
	echo "1. Edit environment files:"
	echo "   - Agent: agent/.env"
	echo "   - API:   api_db/.env"
	echo "2. Start Docker containers:"
	echo "   cd agent/docker && docker compose up -d"
	echo "3. Start API server:"
	echo "   source api-db-venv/bin/activate && cd api_db && uvicorn routes.api:app --port 9020"
	echo "4. Run agents in separate terminal:"
	echo "   source agent-venv/bin/activate && python -m scripts.main [trading|marketing] [agent_id]"
}

main
