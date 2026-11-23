ARG NODE_IMAGE=node:22-alpine
FROM ${NODE_IMAGE}
USER root
ENTRYPOINT []
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts && npm rebuild better-sqlite3
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 BETTER_AUTH_TELEMETRY=0
ENV NEXT_PUBLIC_APP_URL=https://account.valhallishe.net
ENV NEXT_PUBLIC_PAGE_TITLE="Valhallishe Account"
ENV NEXT_PUBLIC_LOGIN_BUTTON_TEXT="Войти через Authentik"
RUN SKIP_ENV_VALIDATION=1 npm run build
ENV NODE_ENV=production PORT=80 DATABASE_PATH=/data/auth-db.sqlite
EXPOSE 80
CMD ["npm", "run", "start:docker"]
