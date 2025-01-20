#!/bin/bash

# Replace with your image and container names
IMAGE_NAME="master-api-app:latest"
CONTAINER_NAME="master-api-container"

# Check if the image exists
if [[ "$(docker images -q $IMAGE_NAME 2> /dev/null)" != "" ]]; then
    # Stop and remove containers, volumes, and images
    docker compose down -v
    docker rmi $IMAGE_NAME

    # Rebuild and start containers
    docker compose up -d

    # Follow container logs
    docker logs -f $CONTAINER_NAME
else
    # Only start containers if the image doesn't exist
    docker compose up -d

    # Follow container logs
    docker logs -f $CONTAINER_NAME
fi