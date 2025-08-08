# Superior Agents v2 - Architecture Documentation

This directory contains comprehensive architecture diagrams and documentation for Superior Agents v2.

## Documentation Contents

1. **[System Architecture](system-architecture.md)** - High-level system overview
2. **[Data Flow](data-flow.md)** - Data flow between components
3. **[Agent Lifecycle](agent-lifecycle.md)** - Agent state management and workflow
4. **[Trading Workflow](trading-workflow.md)** - Trading execution pipeline
5. **[Database Schema](database-schema.md)** - Convex database structure

## Diagram Format

All diagrams are created using Mermaid syntax for GitHub compatibility and can be viewed directly in GitHub's markdown renderer.

## Architecture Principles

- **Real-time First**: All data flows through Convex for real-time synchronization
- **Agent-Centric**: AI agents are the primary actors in the system
- **Workflow-Driven**: Trading operations are orchestrated through Convex workflows
- **Secure by Design**: Encrypted key management and secure authentication
- **Modular Components**: Clear separation between frontend, backend, and trading logic