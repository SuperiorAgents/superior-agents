First time user quickstart

# Preprequisits

Docker and docker compose installation, after install, you can verify by runnign

```
docker version
docker compose version
```

# Steps to do a quick setup

1. Start the containers

CHANGE THE .env.quickstart file to your environment variables
```
OPENAI_API_KEY=your_openai_api_key
ETH_PRIVATE_KEY=your_eth_private_key
```

Then, run the command
```
docker compose -f docker-compose.quickstart.yml up --build
```


2. Going to agent container

Open another terminal and run the command

```
docker compose -f docker-compose.quickstart.yml exec -it agent sh
```

```
python scripts/main.py
```
