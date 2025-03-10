FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY notification/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY notification/ .

# Make the install_cron script executable
RUN chmod +x install_cron.sh

# The port will be specified via environment variable
ARG PORT=8000
ENV PORT=$PORT
EXPOSE $PORT

# Start the FastAPI server using uvicorn
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port $PORT"]
