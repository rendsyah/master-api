.PHONY:	deploy
deploy:
	@echo "Pulling latest resources..."
	@git pull

	@echo "Updating resources..."
	@docker compose -p master-api -f docker-compose.yml up -d --build

	@echo "Cleaning up images..."
	@docker image prune -f

.PHONY:	restart
restart:
	@echo "Restarting resources..."
	@docker compose -p master-api -f docker-compose.yml up -d