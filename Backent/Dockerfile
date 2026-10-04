# Easypanel build context must be the repository root (/) so this image can
# compile the React assets kept in the sibling Frontend directory.
FROM node:22-alpine AS frontend-build
WORKDIR /app/Frontend

COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci
COPY Frontend/ ./
RUN mkdir -p /app/Backent/public && npm run build

FROM composer:2 AS composer-dependencies
WORKDIR /var/www
COPY Backent/composer.json Backent/composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

FROM php:8.3-apache
WORKDIR /var/www

RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev libzip-dev \
    && docker-php-ext-install bcmath mbstring pdo_mysql zip \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY Backent/docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY --from=composer-dependencies /var/www/vendor ./vendor
COPY Backent/ ./
COPY --from=frontend-build /app/Backent/public/build ./public/build
COPY Backent/docker/backend-entrypoint.sh /usr/local/bin/backend-entrypoint

RUN rm -f bootstrap/cache/*.php \
    && php artisan package:discover --ansi \
    && chmod +x /usr/local/bin/backend-entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache

ENTRYPOINT ["backend-entrypoint"]
CMD ["apache2-foreground"]
