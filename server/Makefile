.PHONY: up-env restart-env down-env uv-commit

install:
	npm install

up:
	npx ts-node server.ts
	
redis: 
	docker run -d -p 6380:6379 redis 