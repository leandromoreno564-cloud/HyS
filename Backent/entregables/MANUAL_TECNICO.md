# Manual Técnico de Instalación, Configuración y Mantenimiento
## Sistema de Gestión de Inspecciones de Higiene y Seguridad Laboral (HyS Control)

---

### 1. Información General del Sistema
- **Nombre**: HyS Control - Sistema Integral de Gestión de Inspecciones
- **Framework**: Laravel 12.x / MVC (Modelo-Vista-Controlador)
- **Lenguaje**: PHP 8.2+
- **Motor de Base de Datos**: MySQL 5.7+ / 8.0+ / SQLite 3
- **ORM**: Eloquent ORM
- **Frontend**: Blade Templating + Bootstrap 5.3 + AdminLTE 3 styling + FontAwesome 6 + Chart.js 4 + SweetAlert2
- **Motor de Reportes**: Barryvdh / DomPDF 3.x
- **Seguridad**: Hash de contraseñas Bcrypt, protección contra XSS, CSRF tokens obligatorios, RBAC (Role-Based Access Control), validación tipada MIME y prevención de SQL Injection mediante PDO Prepared Statements.

---

### 2. Requerimientos del Servidor / Entorno Local
- **PHP**: Versión >= 8.2 con las siguientes extensiones habilitadas en `php.ini`:
  - `pdo_mysql` / `pdo_sqlite`
  - `fileinfo`
  - `gd`
  - `mbstring`
  - `openssl`
  - `curl`
  - `zip`
  - `sodium`
- **Gestor de Paquetes**: Composer 2.x
- **Servidor Web**: Apache 2.4 o Nginx (o `php artisan serve` para desarrollo local)
- **Almacenamiento**: Mínimo 200 MB de espacio disponible para código y subida de evidencias fotográficas.

---

### 3. Procedimiento de Instalación Paso a Paso

#### Paso 1: Obtención del Código Fuente
Descomprimir el archivo del proyecto `sistema-inspecciones-hys.zip` o clonar el repositorio:
```bash
git clone <url-del-repositorio> sistema-inspecciones-hys
cd sistema-inspecciones-hys
```

#### Paso 2: Instalación de Dependencias con Composer
```bash
composer install --optimize-autoloader --no-dev
```

#### Paso 3: Configuración del Archivo de Entorno (`.env`)
Copiar el archivo de plantilla `.env.example` a `.env`:
```bash
cp .env.example .env
```
Configurar los parámetros de conexión a base de datos en `.env`:
```ini
APP_NAME="HyS Control"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Conexión MySQL:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hys_inspecciones
DB_USERNAME=root
DB_PASSWORD=

# O conexión rápida SQLite (cero configuración):
# DB_CONNECTION=sqlite
```

#### Paso 4: Generación de Clave de Cifrado
```bash
php artisan key:generate
```

#### Paso 5: Enlace Simbólico de Almacenamiento
Para permitir el acceso público seguro a las fotografías de inspección:
```bash
php artisan storage:link
```

#### Paso 6: Migración de Tablas y Carga de Datos de Prueba (Seeders)
```bash
php artisan migrate:fresh --seed
```
*Nota: También puede importar directamente el script `entregables/base_de_datos.sql` en phpMyAdmin o MySQL Workbench.*

#### Paso 7: Inicio del Servidor
```bash
php artisan serve
```
Acceder en el navegador a: `http://127.0.0.1:8000`

---

### 4. Credenciales de Acceso Predeterminadas (Datos de Prueba)

| Rol | Correo Electrónico | Contraseña | Perfil / Matrícula |
| :--- | :--- | :--- | :--- |
| **Administrador (Root)** | `admin@seguridad.local` | `password` | Ing. Alejandro Morales (MAT-NAC-00192) |
| **Licenciado (Inspector)** | `inspector@seguridad.local` | `password` | Lic. Carlos Rossi (LIC-HYS-8492) |
| **Licenciada (Inspectora)** | `maria@seguridad.local` | `password` | Lic. María Fernández (LIC-HYS-3120) |

---

### 5. Estructura de Directorios del Código Fuente
```
sistema-inspecciones-hys/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php              # Autenticación, sesión y perfil
│   │   │   ├── ChecklistController.php         # Evaluación y fotos de ítems
│   │   │   ├── CompanyController.php           # CRUD de empresas y asignaciones
│   │   │   ├── CorrectiveMeasureController.php # Seguimiento de medidas y vencimientos
│   │   │   ├── DashboardController.php         # Métricas Admin e Inspector
│   │   │   ├── InspectionController.php        # Flujo de inspecciones en campo
│   │   │   ├── NotificationController.php      # Centro de alertas
│   │   │   ├── ObservationController.php       # Hallazgos y fotos
│   │   │   ├── ReportController.php            # Motor PDF, Excel y QR
│   │   │   └── UserController.php              # Gestión de usuarios por Admin
│   │   └── Middleware/
│   │       ├── EnsureUserRole.php              # Control RBAC por roles
│   │       └── EnsureUserIsActive.php          # Verificación de cuentas activas
│   └── Models/
│       ├── AppNotification.php
│       ├── ChecklistCategory.php
│       ├── ChecklistItem.php
│       ├── Company.php
│       ├── CorrectiveMeasure.php
│       ├── Inspection.php
│       ├── InspectionChecklistItem.php
│       ├── Observation.php
│       └── User.php
├── database/
│   ├── migrations/                             # Estructura relacional completa
│   └── seeders/                                # Datos iniciales normativos y de prueba
├── entregables/
│   ├── base_de_datos.sql                       # Script SQL exportable
│   ├── MANUAL_TECNICO.md                       # Presente guía
│   ├── MANUAL_USUARIO.md                       # Manual de uso
│   └── PRESENTACION_Y_DEMO.md                  # Libreto de demostración
├── resources/
│   └── views/                                  # Plantillas Blade responsive
├── routes/
│   └── web.php                                 # 51 rutas web protegidas
└── tests/
    └── Feature/                                # Pruebas automatizadas PHPUnit
```

---

### 6. Ejecución de Pruebas Automatizadas
Para verificar la integridad del sistema y cumplimiento de requerimientos:
```bash
php artisan test
```
Resultados esperados: **9 tests pasados, 28 aserciones (100% éxito)**.
