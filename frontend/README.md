# HyS — Frontend

SPA construida con **Vite** y **Tailwind CSS v4**.

## Requisitos
- Node.js 18+

## Instalación
```bash
cp .env.example .env
npm install
```

## Scripts
| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (puerto 5173) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Preview del build de producción |

## Variables de entorno
| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | URL base del backend Laravel |

## Estructura
```
frontend/
├── index.html          → Entry point HTML
├── vite.config.js      → Configuración Vite (proxy /api → backend)
├── src/
│   ├── css/app.css     → Tailwind CSS
│   └── js/
│       ├── app.js      → Entry point JS
│       └── bootstrap.js→ Axios config
└── dist/               → Build de producción (generado)
```
