#!/usr/bin/env python
"""
MetaPilot AI Engine - Setup Script
-----------------------------------------
This script installs the MetaPilot AI Engine package.
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="metapilot",
    version="2.0.0",
    author="MetaPilot Team",
    author_email="info@metapilot.ai",
    description="Autonomous agentic AI platform for Web3 operations",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/metapilot",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    python_requires=">=3.9",
    install_requires=[
        "fastapi>=0.95.0",
        "uvicorn>=0.21.0",
        "pydantic>=1.10.7",
        "python-dotenv>=1.0.0",
        "httpx>=0.24.0",
        "redis>=4.5.4",
        "motor>=3.1.1",
        "pymongo>=4.3.3",
        "web3>=6.0.0",
        "sentry-sdk>=1.25.0",
        "requests>=2.28.2",
        "aiohttp>=3.8.4",
        "ujson>=5.7.0",
        "asyncio>=3.4.3",
        "numpy>=1.24.2",
        "langchain>=0.0.267",
        "chroma-db>=0.4.15",
        "sentence-transformers>=2.2.2",
        "faiss-cpu>=1.7.4",
        "redis-om>=0.2.1",
        "tenacity>=8.2.2",
        "pytest>=7.3.1",
        "pytest-asyncio>=0.21.0",
        "pytest-cov>=4.1.0",
    ],
    extras_require={
        "dev": [
            "black",
            "isort",
            "mypy",
            "flake8",
        ],
        "web3-extra": [
            # Optional Rust-based dependencies
            # "ethers>=0.0.1a1",  # Requires Rust
        ],
    },
    entry_points={
        "console_scripts": [
            "metapilot=metapilot.api.app:start",
        ],
    },
)
