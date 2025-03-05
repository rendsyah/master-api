#!/bin/bash
set -e

# Replace with your image and container names
IMAGE_NAME="master-api-app:latest"
CONTAINER_NAME="master-api-container"

if [[ "$(docker ps -q -f name=$CONTAINER_NAME)" != "" ]]; then
    docker compose down
fi

# Rebuild image and start containers
docker compose up -d --build

# Follow container logs
docker logs -f $CONTAINER_NAME