#!/bin/sh
set -e

if [ "$API_SEED" = "1" ]; then
  node dist/seed/index.js 
fi

exec node dist/main
