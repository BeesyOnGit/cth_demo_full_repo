# One container: MongoDB + the Express API, which also serves the built front end from /app/public (STATIC_DIR).
# Config comes from the VPS .env (env_file in deploy/docker-compose.yml). Database files live in the /data/db volume.

# ─── Front end ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS web
WORKDIR /web
COPY front/package*.json ./
RUN npm ci
COPY front/ .
# VITE_API_BASE_URL is baked in from front/.env.production
RUN npm run build

# ─── API ─────────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS api
WORKDIR /app
COPY back/package*.json ./
RUN npm ci
COPY back/ .
# postbuild copies src/templates into dist/templates
RUN npm run build

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY back/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── Runtime: MongoDB image (mongod, mongosh, mongodump) + Node ──────────────
FROM mongo:7.0 AS runtime
COPY --from=deps /usr/local/bin/node /usr/local/bin/node
ENV NODE_ENV=production \
    STATIC_DIR=/app/public \
    MONGODB_URI=mongodb://127.0.0.1:27017/cth
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=api /app/package.json ./
COPY --from=api /app/dist ./dist
COPY --from=web /web/dist ./public
COPY container-start.sh /usr/local/bin/container-start.sh
# winston writes logs/*.log relative to the working directory
RUN chmod +x /usr/local/bin/container-start.sh && mkdir logs && chown mongodb:mongodb logs
USER mongodb
ENTRYPOINT ["container-start.sh"]
CMD []
