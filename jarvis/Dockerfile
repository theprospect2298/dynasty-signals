# Jarvis — always-on cloud image (scheduler + Telegram bot + Mission Control)
# Build context must be the jarvis/ directory.
FROM node:22-slim

WORKDIR /app

# Install production dependencies first (better layer caching).
COPY runner/package*.json ./runner/
RUN cd runner && npm install --omit=dev

# App code, shared config, and the vault seed.
COPY runner ./runner
COPY config ./config
COPY vault ./vault-seed
COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# The vault + memory live on a persistent volume mounted at /data.
ENV VAULT_PATH=/data/vault \
    ENABLE_SCHEDULER=true \
    ENABLE_TELEGRAM_BOT=true \
    ENABLE_MISSION_CONTROL=true \
    NOTIFICATION_GATEWAY=telegram

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
