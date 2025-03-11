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
	python3 -m venv rest-api-venv
	source rest-api-venv/bin/activate
	cd rest-api
	pip install -r requirements.txt >/dev/null 2>&1
	cp .env.example .env
	python init_db.py
	cd ..
	deactivate
}

setup_rag_api() {
	echo "📚 Setting up RAG API virtual environment..."
	python3 -m venv rag-api-venv
	source rag-api-venv/bin/activate
	cd rag-api
	pip install -r requirements.txt >/dev/null 2>&1
	cp .env.example .env
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
	setup_rag_api

	echo -e "\n✅ Setup complete!\n"
	echo "Usage Instructions:"
	echo "1. Edit environment files:"
	echo "   - Agent: agent/.env"
	echo "   - API:   rest-api/.env"
	echo "   - RAG:   rag-api/.env"
	echo "2. Start Docker containers:"
	echo "   cd agent/docker && docker compose up -d"
	echo "3. Start API server:"
	echo "   source rest-api-venv/bin/activate && cd rest-api && uvicorn routes.api:app --port 9020"
	echo "4. Start RAG API server:"
	echo "   source rag-api-venv/bin/activate && cd rag-api && uvicorn api:app --port 8080"
	echo "5. Start TXN Signer server:"
	echo "   source agent-venv/bin/activate && cd agent && uvicorn tee_txn_signer:app --port 9021"
	echo "6. Run agents in separate terminal:"
	echo "   source agent-venv/bin/activate && cd agent && python -m scripts.main [trading|marketing] [agent_id]"
}

main
