#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force
fi

# El enlace vive en public/ (parte de la imagen), mientras que los archivos
# viven en el volumen persistente storage/. Se recrea en cada arranque para
# que un despliegue con una imagen nueva no deje inaccesibles los archivos.
php artisan storage:link --force

exec "$@"
