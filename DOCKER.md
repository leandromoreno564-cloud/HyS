# Producción con Docker

La aplicación se publica por el servicio `frontend` en el puerto 8080. Nginx entrega los recursos React compilados (`/build`) y reenvía las rutas de la aplicación a Laravel. No se expone el backend ni MySQL al exterior.

## Preparación

1. Copiá `.env.docker.example` como `.env.docker`.
2. Generá una clave de Laravel y pegala en `APP_KEY`:

   ```powershell
   docker compose run --rm backend php artisan key:generate --show
   ```

3. Reemplazá las dos contraseñas de MySQL en `.env.docker` por valores seguros.

## Inicio

```powershell
docker compose up --build -d
```

Abrí `http://localhost:8080`. En el primer inicio el backend ejecuta las migraciones; se puede desactivar con `RUN_MIGRATIONS=false`.

Los datos de MySQL y los archivos que carga Laravel se preservan en los volúmenes `mysql_data` y `laravel_storage`.
