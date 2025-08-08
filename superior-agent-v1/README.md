# Superior Agents

## Table of Contents

* [Superior Agent](#superior-agent)
* [Features](#features)
* [Documentation Site](#documentation-site)
* [Installation](#installation)

  * [Requirements for Windows Platform](#requirements-for-windows-platform)
  * [Requirements](#requirements)
  * [Bootstrapper](#bootstrapper)
  * [Agent-side](#agent-side)

    * [Agent Configuration JSON Files](#agent-configuration-json-files)
    * [Environment Variable](#environment-variable)
* [Quick Start](#quick-start)

  * [Run Agent Docker Container](#run-agent-docker-container)
  * [Run the Agent (in a separate tab)](#run-the-agent-in-a-separate-tab)
* [Meta Swap API](#meta-swap-api)

  * [Meta Swap API Quickstart](#meta-swap-api-quickstart)
* [Notification Scraper (optional)](#notification-scraper-optional)

  * [Notification Quickstart](#notification-quickstart)
* [Contributing](#contributing)
* [License](#license)

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

## Documentation Site

For a comprehensive guide to the Superior Agent Framework, please visit our [Documentation Site](https://superioragents.github.io/superioragents-docs/).

## Folder Structure

Each folder in the repository represents a self-contained component of the system:

* [`agent`](./agent) — Contains the core trading and marketing agent logic.
* `db` — Serves as the storage directory for databases and RAG (Retrieval-Augmented Generation) files.
* [`meta-swap-api`](./meta-swap-api) — A NestJS-based API that facilitates token swaps using multiple aggregators.
* [`notification`](./notification) — Handles data collection from various sources to feed into the agent.
* [`rag`](./rag-api) — Hosts the RAG API for enhanced research and data retrieval capabilities.

# Installation

🎥 [Quickstart for Setting Up a Trading Agent](https://youtu.be/q6kTvTWc4p4) 

Here’s a revised version of that section with improved grammar and a more formal tone:

---

## Requirements for Windows Platform

Before proceeding, you must have **WSL (Windows Subsystem for Linux)** installed on your system.
Please follow the instructions in [WINDOWS\_WSL.md](WINDOWS_WSL.md) to set up WSL properly.


## Requirements

- Python 3.12 or higher.
- [Docker](https://docs.docker.com/engine/install/ubuntu/)
- Install pyenv requirements

```
sudo apt install -y build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
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

## Bootstrapper

On Windows (under WSL) or on Mac/Linux, the fastest way to get started is to use the `bootstrap.sh` script

```
chmod +x bootstrap.sh
./bootstrap.sh
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

## Environment Variable

Make sure to include these variables to .env file in agent's directory

```env
# Research tools
TWITTER_API_KEY=
TWITTER_API_KEY_SECRET=
TWITTER_BEARER_TOKEN=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=

COINGECKO_API_KEY=
INFURA_PROJECT_ID=
ETHERSCAN_API_KEY=
ONEINCH_API_KEY=

# Ether address for testing
ETHER_ADDRESS=

# LLM Keys
OPENROUTER_API_KEY=
DEEPSEEK_DEEPSEEK_API_KEY=
ANTHROPIC_API_KEY=

# Our services
TXN_SERVICE_URL="http://localhost:9009"
RAG_SERVICE_URL="http://localhost:8080"
```

# Quick Start

## Run Agent Docker Container

```bash
# Navigate to docker configuration
cd agent/docker

# Create and start the container locally
docker compose up -d
```


## Run the agent (in a seperate tab)

To run the trading/marketing bot

```bash
# Navigate into root folder
cd ../..

# Activate virtual environment
source agent-venv/bin/activate

# Example running command
python -m scripts.starter
```

# Meta Swap API

NestJS-based API service supporting multiple aggregators for optimal swap execution. The documentation can be found in the [/meta-swap-api](/meta-swap-api)

## Meta Swap API Quickstart 
1. Navigate to the `meta-swap-api` directory:

```bash
cd meta-swap-api
```

2. Start the `meta-swap-api`:

```bash
docker compose up --build
```

# Notification Scraper (optional)

Notification service that aggregates data from multiple sources to be saved on the database. It will be used to feed the data to agents. The documentation can be found in the [/notification](/notification)

## Notification Quickstart 
1. Navigate to the notification directory:

```bash
cd notification
```

2. Start the notification worker:

```bash
docker compose up --build
```

# Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

# License

This project is licensed under the [Apache License 2.0](LICENSE).
