# ====================================================
# 🚀 PERFORMANCE TESTING WITH K6
# ====================================================

K6_RUN=k6 run
K6_DIR=scenarios

# Base URL for all tests (can be overridden when running)
BASE_URL?=http://localhost:8080

# ====================================================
# Targets for Login Performance Tests
# ====================================================

# Run login endpoint performance test
.PHONY: login-load
login-load:
	@echo 🧪 Running Login Load Test...
	$(K6_RUN) $(K6_DIR)/login/load.test.js --env API_BASE_URL=$(BASE_URL)

.PHONY: login-spike
login-spike:
	@echo 🧪 Running Login Spike Test...
	$(K6_RUN) $(K6_DIR)/login/spike.test.js --env API_BASE_URL=$(BASE_URL)

.PHONY: login-stress
login-stress:
	@echo 🧪 Running Login Stress Test...
	$(K6_RUN) $(K6_DIR)/login/stress.test.js --env API_BASE_URL=$(BASE_URL)