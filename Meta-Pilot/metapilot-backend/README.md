<div align="center">

# 🚀 MetaPilot AI Engine v2.0

<img src="https://via.placeholder.com/200x200?text=MetaPilot" width="200" height="200" alt="MetaPilot Logo">

*Autonomous AI-powered Web3 operations and intelligence*

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95.0%2B-009688)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.0.267%2B-yellow)](https://langchain.com/)
[![GROQ](https://img.shields.io/badge/GROQ-API-purple)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

## 🌟 Overview

MetaPilot v2.0 is an autonomous multi-agent AI platform engineered specifically for Web3 operations, empowering users with intelligent automation and decision-making capabilities in the decentralized ecosystem. Built on a modular architecture with specialized agents, vector memory, and reinforcement learning, MetaPilot serves as your autonomous partner in the complex and rapidly evolving blockchain landscape.

The platform leverages GROQ's powerful AI models to analyze blockchain events, governance proposals, NFT markets, and token prices, autonomously executing optimal strategies based on market conditions. With advanced reinforcement learning and vector memory capabilities, MetaPilot can understand complex patterns, generate insights, learn from past experiences, and make intelligent decisions—transforming raw blockchain data into profitable actions.

## ✨ Key Features

### 🧠 Autonomous Multi-Agent Architecture
- **Agent Orchestrator**: Coordinates specialized agents, manages task delegation, and handles autonomous operations
- **Governor Agent**: Meta-orchestrator for task decomposition, delegation, and conflict resolution
- **DeFi Agent**: Specialized for decentralized finance operations, liquidity analysis, and yield optimization
- **NFT Agent**: NFT market analysis, collection valuation, and trading strategy execution
- **DAO Agent**: Governance proposal analysis, voting strategy, and treasury management

### 🧠 Advanced AI Capabilities
- **GROQ-Powered Intelligence**: High-performance AI models for text generation, reasoning, and analysis
- **Vector Embeddings**: Semantic understanding and similarity search for complex data
- **Chain of Thought Reasoning**: Step-by-step logical reasoning for complex decision making
- **Structured Output Generation**: Consistent, well-formatted data for system integration

### 💾 Vector Memory System
- **Long-Term Memory**: Persistent storage of agent experiences and knowledge
- **Semantic Search**: Find relevant past experiences based on meaning, not just keywords
- **Memory Consolidation**: Automatic organization and prioritization of important information
- **Cross-Agent Knowledge Sharing**: Memory transfer between specialized agents

### 🔄 Reinforcement Learning
- **Q-Learning Implementation**: State-action value optimization for decision making
- **Experience-Based Learning**: Agents learn from past operations and outcomes
- **Strategy Optimization**: Continuous improvement of decision-making processes
- **Adaptive Risk Management**: Dynamic adjustment of risk tolerance based on market conditions

### 🔗 Blockchain Integration
- **Multi-Chain Support**: Data access and operations across multiple blockchain networks
- **Real-time Market Data**: Token prices, liquidity pools, and trading volumes
- **Protocol-Specific APIs**: Integration with DeFi, NFT, and DAO platforms
- **On-Chain Analytics**: Transaction pattern analysis and trend identification

### 🔐 Enhanced Security
- **Multi-Signature Execution**: Secure transaction execution with multi-sig support
- **Contract Verification**: Automated smart contract safety verification
- **Risk Scoring**: Comprehensive risk assessment for all operations
- **Simulation Testing**: Pre-execution simulation of complex strategies

## 🛠️ Architecture

MetaPilot follows a modular, service-oriented architecture designed for scalability and extensibility:

```
metapilot/
├── api/                  # API endpoints and FastAPI application
├── core/                 # Core business logic and components
│   ├── agents/           # Specialized agent implementations
│   ├── learning/         # Reinforcement learning components
│   ├── memory/           # Vector memory system
│   └── orchestration/    # Agent orchestration and coordination
├── models/               # Data models and schema definitions
├── services/             # Service implementations
│   ├── ai_service.py     # GROQ-powered AI capabilities
│   └── blockchain_service.py  # Blockchain data and operations
├── utils/                # Utility functions and helpers
└── tests/                # Comprehensive test suite
    ├── unit/             # Unit tests for components
    └── integration/      # Integration tests for system
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9 or higher
- Redis (for vector memory storage)
- GROQ API key (for AI capabilities)
- Ethereum/Web3 provider (for blockchain operations)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/metapilot.git
   cd metapilot
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   Required environment variables:
   - `GROQ_API_KEY`: Your GROQ API key for AI capabilities
   - `VECTOR_DB_URI`: Redis connection URI for vector memory storage
   - `ETHEREUM_RPC_URL`: Ethereum JSON-RPC endpoint
   - `WEB3_PROVIDER_URI`: Web3 provider URI
   - `AGENT_LEARNING_RATE`: Learning rate for reinforcement learning (default: 0.1)
   - `AGENT_DISCOUNT_FACTOR`: Discount factor for future rewards (default: 0.9)

5. **Start Redis for vector memory**
   ```bash
   # Install Redis if not already installed
   # macOS: brew install redis
   # Ubuntu: sudo apt install redis-server
   
   # Start Redis server
   redis-server
   ```

### Usage

#### Running the API Server

```bash
# Start the FastAPI server
uvicorn metapilot.api.main:app --reload

# Access the API documentation at http://localhost:8000/docs
```

#### Using the Agent Orchestrator

```python
from metapilot.core.orchestration import AgentOrchestrator
import asyncio

async def run_autonomous_operation():
    # Initialize the orchestrator
    orchestrator = AgentOrchestrator()
    
    # Define operation parameters
    operation_type = "defi_yield_optimization"
    parameters = {
        "wallet_address": "0x...",
        "risk_tolerance": "medium",
        "time_horizon": "long_term"
    }
    
    # Run autonomous operation
    result = await orchestrator.autonomous_operation(
        operation_type=operation_type,
        parameters=parameters,
        risk_tolerance=0.7
    )
    
    print(f"Operation status: {result['status']}")
    print(f"Results: {result['results']}")

# Run the async function
asyncio.run(run_autonomous_operation())
```

#### Using Individual Agents

```python
from metapilot.core.agents import DeFiAgent
import asyncio

async def analyze_defi_opportunity():
    # Initialize DeFi agent
    defi_agent = DeFiAgent()
    
    # Define task data
    task_data = {
        "type": "analyze_pool",
        "parameters": {
            "protocol": "uniswap_v3",
            "pool_address": "0x...",
            "time_period": "7d"
        }
    }
    
    # Process task
    result = await defi_agent.process_task(task_data)
    
    if result.success:
        print(f"Analysis complete: {result.output}")
    else:
        print(f"Analysis failed: {result.error}")

# Run the async function
asyncio.run(analyze_defi_opportunity())
```
   5. **Run the application**
   ```bash
   python run.py
   ```

### Docker Deployment

For containerized deployment:

```bash
# Build the Docker image
docker build -t metapilot .

# Run the container
docker run -p 8000:8000 --env-file .env metapilot
```

## 🧪 Testing

MetaPilot includes a comprehensive test suite using pytest:

```bash
# Run all tests
pytest

# Run tests with coverage report
pytest --cov=metapilot tests/

# Run specific test modules
pytest tests/test_api.py
```

## 🔧 Configuration

The application is configured through environment variables in the `.env` file:

```ini
# API Configuration
API_KEY="your-secure-api-key-here"
PORT=8000
DEBUG=True

# Database Configuration
MONGODB_URI="mongodb://localhost:27017"
MONGODB_DB_NAME="metapilot"

# Gaia Agent Configuration
# Default endpoint for local development
GAIA_AGENT_ENDPOINT="http://localhost:3000/api/sign"
# Production endpoints (uncomment and use one of these for production)
# GAIA_AGENT_ENDPOINT="https://llama8b.gaia.domains/v1"
# GAIA_AGENT_API_KEY="your-gaia-api-key"
```

## 📚 API Documentation

Once the application is running, API documentation is available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check and status |
| `/users` | POST | Create a new user |
| `/users/{user_id}/rules` | POST | Create a rule for a user |
| `/users/{user_id}/run` | POST | Run MetaPilot for a user |
| `/events` | GET | Get recent events |
| `/gaia/completion` | POST | Get completion from Gaia Agent |
| `/gaia/stream` | POST | Stream completion from Gaia Agent |

## 🔮 Gaia Agent Integration

### Using GROQ API

MetaPilot v2.0 leverages GROQ's powerful API for all AI capabilities. The AIService provides a simple interface to interact with GROQ models:

```python
from metapilot.services.ai_service import AIService

async def example():
    ai_service = AIService()
    response = await ai_service.generate_text(
        prompt="What are the benefits of decentralized finance?",
        temperature=0.7
    )
    print(response)
    
    # Generate embeddings for semantic search
    embeddings = await ai_service.generate_embeddings(
        texts=["DeFi protocol analysis", "Yield optimization strategy"]
    )
    
    # Chain of thought reasoning
    reasoning = await ai_service.chain_of_thought(
        question="What factors should be considered when evaluating a new DeFi protocol?"
    )
    print(reasoning)
```

## 📊 Usage Examples

MetaPilot includes example scripts to demonstrate common use cases:

```python
# Create a user and rule
from metapilot.examples.usage_example import create_user_example, create_rule_example

async def setup():
    user = await create_user_example()
    rule = await create_rule_example(user["user_id"])
```

## 🛡️ Security Considerations

- Always use a strong, unique API key in production
- Restrict CORS origins to trusted domains
- Consider using HTTPS in production environments
- Implement rate limiting for public-facing APIs
- Regularly audit and rotate API keys

## 🔄 Continuous Integration

MetaPilot uses GitHub Actions for CI/CD. The workflow includes:

- Automated testing
- Code quality checks
- Security scanning
- Docker image building

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📬 Contact

Project Link: [https://github.com/yourusername/metapilot](https://github.com/yourusername/metapilot)

---

<div align="center">

**MetaPilot** — *Your Intelligent Companion in the Web3 Universe*

</div>

## API Endpoints

### Health Check
- `GET /`: API health check and status

### User Management
- `POST /users`: Create a new user
- `POST /users/{user_id}/rules`: Create a new rule for a user
- `POST /users/{user_id}/run`: Run MetaPilot for a user

### Event Monitoring
- `GET /events`: Get recent events

### AI Service
- `POST /ai/generate`: Generate text using GROQ API
- `POST /ai/embeddings`: Generate embeddings for text

### Multi-Agent System
- `POST /agents/execute`: Execute a task using the multi-agent system
- `POST /agents/autonomous`: Start an autonomous operation
- `GET /agents/operation/{operation_id}`: Get operation status

### Blockchain Integration
- `GET /blockchain/token/{token_address}`: Get token information
- `GET /blockchain/nft/{collection_address}`: Get NFT collection data
- `GET /blockchain/dao/{dao_id}`: Get DAO governance information

## Environment Configuration

Configure the following environment variables in your `.env` file:

```
# API Configuration
API_KEY="your-secure-api-key-here"
PORT=8000
DEBUG=True

# Vector Database Configuration
VECTOR_DB_URI="redis://localhost:6379"

# AI Service Configuration
GROQ_API_KEY="your-groq-api-key"

# Blockchain Configuration
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/your-infura-key"
WEB3_PROVIDER_URI="https://mainnet.infura.io/v3/your-infura-key"

# Agent Learning Configuration
AGENT_LEARNING_RATE=0.1
AGENT_DISCOUNT_FACTOR=0.9

# Security Configuration
CORS_ALLOWED_ORIGINS="http://localhost:3000,https://your-frontend-domain.com"
```

## Development

### Running in Development Mode

```bash
uvicorn metapilot.api.app:app --reload --port 8000
```

### Testing the API

You can test the API using curl or any API client like Postman:

```bash
# Health check
curl http://localhost:8000/health

# Create a user
curl -X POST http://localhost:8000/users \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "email": "test@example.com"}'

# AI text generation
curl -X POST http://localhost:8000/ai/generate \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain the benefits of DeFi", "temperature": 0.7}'

# Multi-agent task execution
curl -X POST http://localhost:8000/agents/execute \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"task_type": "defi_analysis", "parameters": {"protocol": "uniswap_v3", "action": "analyze_liquidity"}}'

# Blockchain data retrieval
curl -X GET http://localhost:8000/blockchain/token/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 \
  -H "X-API-Key: your-api-key"
```

### Environment Setup

Create a `.env` file in the project root with the following variables:

```
GROQ_API_KEY=your_groq_api_key
VECTOR_DB_URI=redis://localhost:6379
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_infura_key
WEB3_PROVIDER_URI=https://mainnet.infura.io/v3/your_infura_key
AGENT_LEARNING_RATE=0.1
AGENT_DISCOUNT_FACTOR=0.9
```

## License

MIT License

## Contact

For questions or support, please contact the MetaPilot team.
