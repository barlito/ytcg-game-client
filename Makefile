DOCKER_COMPOSE = docker compose

 up:
	 $(DOCKER_COMPOSE) up --build

 down:
	 $(DOCKER_COMPOSE) down

 rebuild:
	 $(DOCKER_COMPOSE) up --build --force-recreate

 bash:
	 $(DOCKER_COMPOSE) exec client bash

	 logs:
	 $(DOCKER_COMPOSE) logs -f client

 build:
	 docker-compose exec client npm run build

 lint:
	 docker-compose exec client npm run lint

 format:
	 docker-compose exec client npm run format
