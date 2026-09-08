#!/bin/sh
set -eu
mkdir -p /app/uploads
chown -R nextjs:nodejs /app/uploads
exec su-exec nextjs:nodejs "$@"
