FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl wget fuse gzip \
    software-properties-common debian-keyring debian-archive-keyring apt-transport-https \
    rclone \
    && rm -rf /var/lib/apt/lists/*

COPY . .

# RUN pip install --upgrade pip && pip install -r requirements.txt
RUN pip install -e .

EXPOSE 8080

HEALTHCHECK CMD curl --fail http://localhost:8080/health

ENTRYPOINT [ "python", "scripts/api.py" ]