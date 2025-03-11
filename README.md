# Superior Agents

## Table of Contents

- [Superior Agent](#superior-agent)
  - [Features](#features)
  - [Gitbook Documentation](#gitbook-documentation)
- [Installation](#installation)
  - [Requirements](#requirements)
  - [Agent-side](#agent-side)
    - [ABI](#abi)
    - [File Locations](#file-locations)
    - [Why These Files Are Important](#why-these-files-are-important)
    - [Agent Configuration JSON Files](#agent-configuration-json-files)
  - [Python server-side](#python-server-side)
  - [Environment Variable](#environment-variable)
- [Quick Start](#quick-start)
  - [Run Agent Docker Container](#run-agent-docker-container)
  - [Run Python Server](#run-python-server)
    - [Uvicorn](#uvicorn)
  - [Run the Agent](#run-the-agent)
- [Python Server API Documentation](#python-server-api-documentation)
- [Notification Scraper (optional)](#notification-scraper-optional)
- [Contributing](#contributing)
- [License](#license)

## Superior Agent

This project is a trading and marketing agent that interacts with various APIs to perform trading operations and manage marketing strategies. It utilizes FastAPI for the web server, Docker for container management, and various libraries for interacting with blockchain networks and social media platforms.

## Features

- Research – Analyze market trends, tokenomics, and narratives.
- Formulate strategies – Make intelligent, data-backed investment decisions.
- Execute trades – Buy and sell crypto assets autonomously.
- Market themselves – Promote their holdings and increase their AUM.
- Promote (or FUD) – Influence market sentiment to their advantage.
- Assess their own performance – Measure profitability and adapt.
- Self-improve daily – Learn from successes and failures, refining strategies over time.

## GitBook Documentation

For a comprehensive guide to the Superior Agent Framework, please visit our [GitBook Documentation](https://superioragents.gitbook.io/superior-agents-documents/).

# Installation

## Requirements

- Python 3.12 or higher.
- [Docker](https://docs.docker.com/engine/install/ubuntu/)
- Install pyenv requirements

```
sudo apt install -y build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev` (for gcc, basic build essentials)
```

- Install pyenv

```
curl https://pyenv.run | bash
```

- Add pyenv to bashrc

```
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init --path)"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
```

- Install docker

```
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
```

- Add user to docker

```
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

- Test your configuration

```
pyenv --version
python --version
docker --version
docker-compose --version
```

## Agent-side

```bash
# Create python virtual environment (recommended)
python -m venv agent-venv

# Activate virtual environment
source agent-venv/bin/activate

# Navigate to agent's directory
cd agent

# Install all required dependencies
pip install -e .

# Copy the example environment file and configure your settings:
cp .env.example .env
```

### ABI (optional)

> **Note**: These files can be ignored if you're only testing the application locally without trading functionality.

This project requires two essential ABI (Application Binary Interface) files for interacting with Ethereum smart contracts:

- ERC-20 ABI (`erc_20_abi.json`)

- Uniswap Router ABI (`uniswap_router_abi.json`)

### File Locations

Both files should be placed in the following directory structure:

```
superior-agents/
  ├── agent/
  │   ├── docker/
  │   │   ├── erc_20_abi.json
  │   │   └── uniswap_router_abi.json
  │   └── ...
  └── ...
```

### Why These Files Are Important

1. **Contract Interaction**: These ABI files are required for the Docker container to:

   - Decode smart contract functions and events
   - Format transaction data correctly
   - Interact with the Ethereum blockchain

2. **Trading Operations**: The agent uses these interfaces to:
   - Read token balances and information
   - Execute trades on Uniswap
   - Monitor transaction status
   - Manage liquidity positions

Make sure both files are present in the correct location before running the Docker container.

### Agent Configuration JSON Files

The `marketing.json` and `trading.json` files in the `agent/starter/` directory are crucial configuration files that define the default prompts and behavior for marketing and trading agents. These files allow you to customize:

- **Agent Identification**: Set a unique `agent_id` for tracking and management
- **Model Selection**: Choose the AI model (e.g., "claude") for generating strategies
- **Role Definition**: Define the agent's role and persona
- **Time Horizon**: Set the duration for strategy execution
- **Metric Goals**: Specify the key performance metric (e.g., "followers" or "wallet")
- **Research Tools**: List available APIs and research resources
- **Prompts**: Detailed, customizable prompt templates for:
  - System initialization
  - Strategy generation
  - Code implementation
  - Error handling and code regeneration

These JSON files provide a flexible configuration mechanism to control agent behavior without changing the core code.

## Python Server-side

```bash
# Deactivate your previous virtual env with `deactivate`

# Navigate into root folder
cd ..

# Create python virtual environment (recommended)
python -m venv rest-api-venv

# Activate virtual environment
source rest-api-venv/bin/activate

# Navigate to api_db's directory
cd rest-api

# Install all required dependencies
pip install -r requirements.txt

# Copy the example environment file and configure your settings:
cp .env.example .env

# Initialize the database
python init_db.py

# Deactivate current virtual env with `deactivate`

# Navigate into root folder
cd ..
```

## Environment Variable

Make sure to include these variables to .env file in agent's directory

```env
TWITTER_API_KEY =
TWITTER_API_SECRET =
TWITTER_BEARER_TOKEN =
TWITTER_ACCESS_TOKEN =
TWITTER_ACCESS_TOKEN_SECRET =
API_DB_BASE_URL=
API_DB_API_KEY=
ETHER_PRIVATE_KEY=
ETHER_ADDRESS=
INFURA_PROJECT_ID=
ETHERSCAN_KEY=
COINGECKO_KEY=
ONEINCH_API_KEY=
DEEPSEEK_OPENROUTER_API_KEY=
DEEPSEEK_DEEPSEEK_API_KEY=
DEEPSEEK_LOCAL_API_KEY=
ANTHROPIC_API_KEY=
DEEPSEEK_URL=
OAI_API_KEY=
```

# Quick Start

## Run Agent Docker Container

```bash
# Navigate to docker configuration
cd agent/docker

# Create and start the container locally
docker compose up -d
```

## Run Python server

### Uvicorn

Make sure all dependencies have been installed on [previous](#python-server-side) section

```bash
# Navigate into root folder
cd ../..

# Activate virtual environment
source api-db-venv/bin/activate

# Navigate to api_db's directory
cd api_db

# Start the python FastAPI backend
uvicorn routes.api:app --port 9020
```

## Run the agent (in a seperate tab)

To run the trading bot

```bash
# Navigate into root folder
cd ../..

# Activate virtual environment
source agent-venv/bin/activate

# Example running command
python -m scripts.main trading <agent_id>

python -m scripts.main trading agent_007
```

To run the marketing bot

```bash
# Example running command
python -m scripts.main marketing <agent_id>

python -m scripts.main marketing agent_007
```

# Python Server API Documentation

Detailed API documentation can be found in the [/api_db](/api_db) directory.

# Notification Scraper (optional)

Notification service that aggregates data from multiple sources to be saved on the database. It will be used to feed the data to agents. The documentation can be found in the [/notification](/notification)

# Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

# License

This project is licensed under the [Apache License 2.0](LICENSE).
