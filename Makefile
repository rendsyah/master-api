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

# ====================================================
# 🚀 PERFORMANCE TESTING WITH K6
# ====================================================

# Run login endpoint performance test
.PHONY: k6-login
k6-login:
	@echo "🧪 Running performance test: login"
	@k6 run k6/scenarios/login.test.js --env API_BASE_URL=$(API_BASE_URL)

# Run user endpoint performance test
.PHONY: k6-user
k6-user:
	@echo "🧪 Running performance test: user"
	@k6 run k6/scenarios/user.test.js --env API_BASE_URL=$(API_BASE_URL)
