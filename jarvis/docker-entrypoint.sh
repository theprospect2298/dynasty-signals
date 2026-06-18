#!/bin/sh
# Seed the persistent vault on first boot, then run the always-on process
# (scheduler + Telegram control bot + Mission Control).
set -e

mkdir -p /data/vault

if [ -z "$(ls -A /data/vault 2>/dev/null)" ]; then
  echo "[entrypoint] Empty volume — seeding vault from image…"
  cp -a /app/vault-seed/. /data/vault/
else
  echo "[entrypoint] Existing vault found on volume — keeping it."
fi

exec node /app/runner/src/index.js
