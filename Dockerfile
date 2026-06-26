# Среда разработки Forge-приложения kit_teamlead.
# Node 20 + Forge CLI — всё, что нужно для deploy / tunnel / lint.

FROM node:20-alpine

RUN apk add --no-cache git

RUN npm install -g @forge/cli

WORKDIR /app

# Сначала только package.json — Docker кэширует этот слой при пересборке.
COPY package.json package-lock.json* ./
COPY static/dashboard/package.json static/dashboard/package-lock.json* ./static/dashboard/

RUN npm install \
    && npm install --prefix static/dashboard --legacy-peer-deps

# Исходный код подключается через volume в docker-compose (см. docker-compose.yml).
