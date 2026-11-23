ARG NODE_IMAGE=node:22-alpine
ARG RUNTIME_IMAGE=alpine:3.24
FROM ${NODE_IMAGE} AS builder
USER root
ENTRYPOINT []
WORKDIR /app
ENV NODE_ENV=development
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts && npm rebuild better-sqlite3
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 BETTER_AUTH_TELEMETRY=0
ENV NEXT_PUBLIC_APP_URL=https://account.valhallishe.net
ENV NEXT_PUBLIC_PAGE_TITLE="Valhallishe Account"
ENV NEXT_PUBLIC_LOGIN_BUTTON_TEXT="Войти через Authentik"
RUN NODE_ENV=production SKIP_ENV_VALIDATION=1 npm run build

FROM ${RUNTIME_IMAGE} AS runtime
WORKDIR /app
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /usr/lib/libstdc++.so.6* /usr/lib/
COPY --from=builder /usr/lib/libgcc_s.so.1 /usr/lib/
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts/link-user.cjs ./scripts/link-user.cjs
ENV NODE_ENV=production PORT=80 HOSTNAME=0.0.0.0 DATABASE_PATH=/data/auth-db.sqlite
ENV NEXT_TELEMETRY_DISABLED=1 BETTER_AUTH_TELEMETRY=0
USER 1000:1000
EXPOSE 80
ENTRYPOINT ["node", "server.js"]
