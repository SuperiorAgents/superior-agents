# Dockerfile
FROM python:3.11-slim

# Fix GPG key issues
RUN apt-get update -y || true && \
    apt-get install -y gnupg2 ca-certificates && \
    apt-key update && \
    apt-get clean

# Install system dependencies and utilities
RUN apt-get update -y && apt-get install -y \
    build-essential \
    curl \
    wget \
    iputils-ping \
    net-tools \
    procps \
    vim \
    git \
    w3m \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt /requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r /requirements.txt
RUN pip install ddgr


# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV BROWSER=w3m

# Default command that keeps container running
CMD ["sleep", "infinity"]
