# Easypanel build context must be the repository root (/).
FROM node:22-alpine AS build
WORKDIR /app/Frontend

COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci
COPY Frontend/ ./
RUN mkdir -p /app/Backent/public && npm run build

FROM nginx:1.27-alpine
COPY Frontend/docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/Backent/public/build /usr/share/nginx/html/build
