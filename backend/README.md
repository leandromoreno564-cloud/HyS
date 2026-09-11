# HyS — Backend

API REST construida con **Laravel 12** (PHP 8.2+).

## Requisitos
- PHP 8.2+
- Composer

## Instalación
```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

## Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/user` | Usuario autenticado (requiere Sanctum) |

## Variables de entorno clave
| Variable | Descripción |
|---|---|
| `APP_URL` | URL del backend (ej: `http://localhost:8000`) |
| `FRONTEND_URL` | URL del frontend para CORS (ej: `http://localhost:5173`) |
| `DB_CONNECTION` | Driver de base de datos (`sqlite` por defecto) |

## Estructura relevante
```
backend/
├── app/Http/Controllers/   → Controladores API
├── routes/
│   ├── api.php             → Rutas API (/api/*)
│   └── web.php             → Rutas web (mínimas)
├── database/migrations/    → Migraciones
└── config/                 → Configuración (cors, auth, etc.)
```
