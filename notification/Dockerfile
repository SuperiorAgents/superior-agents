# Use Python 3.12 slim image as base
FROM python:3.12-slim

# Set working directory
WORKDIR /app/notification

# Install system dependencies
RUN apt-get update && apt-get install -y \
    cron \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy only notification service code
COPY . .

# Create necessary directories
RUN mkdir -p logs

# Make the cron worker script executable
RUN chmod +x cron_worker.py

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV SCRAPER=all

# Create entrypoint script
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"] 