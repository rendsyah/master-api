# ====================================================
# 🐳 DOCKER COMPOSE COMMANDS
# ====================================================

# Pull latest changes, build containers, and clean up unused images
.PHONY: deploy
deploy:
	@echo "📦 Pulling latest resources from git..."
	@git pull

	@echo "🔧 Building and starting container..."
	@COMPOSE_BAKE=true docker compose -f docker-compose.yml up -d --build

	@echo "🧹 Cleaning up unused Docker images..."
	@docker image prune -f

# Restart containers
.PHONY: restart
restart:
	@echo "🚀 Restarting container..."
	@COMPOSE_BAKE=true docker compose -f docker-compose.yml up -d