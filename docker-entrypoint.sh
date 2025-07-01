#!/bin/sh
set -e

if [ "$API_SEED" = "1" ]; then
  node dist/seeds/index.js
fi

exec node dist/main
