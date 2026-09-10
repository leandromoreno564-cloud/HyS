# Plataforma Web de Gestión Integral de Inspecciones de Higiene y Seguridad Laboral (HyS Control)

[![Laravel 12](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React 19](https://img.shields.io/badge/React-19.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v2.0-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MySQL 8](https://img.shields.io/badge/MySQL-8.0-00758F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)

**Proyecto Educativo Institucional**  
**Institución:** Instituto de Educación Superior "Nuevo Horizonte"  
**Carrera Ejecutora:** Tecnicatura Superior en Desarrollo de Software (2.° y 3.° año)  
**Carrera Destinataria:** Tecnicatura Superior en Seguridad e Higiene Laboral  
**Espacios Curriculares:** Práctica Profesionalizante I y Práctica Profesionalizante II  
**Equipo Docente Tutor:** Prof. Aquino Carolina, Prof. Figueroa Franco, Prof. Huanca Elio  

---

## 📌 Descripción del Proyecto

En el ámbito profesional de la Seguridad y la Higiene Laboral, el relevamiento tradicional mediante formularios impresos en papel y planillas estáticas ocasiona pérdida de datos, retrasos significativos en la redacción de informes y dificultades para el seguimiento de medidas correctivas. 

**HyS Control** es una solución web de nivel empresarial y diseño responsive mobile-first que automatiza el ciclo integral de inspecciones:
1. **Control de Empresas y Establecimientos**: Padrón clasificado por sector industrial con asignación de inspectores matriculados y borrado lógico (*Soft Deletes*).
2. **Motor de Checklists Normativos**: Generación automática de listas de cotejo técnicas según la normativa vigente (Ley Nacional 19.587, Dec. 351/79 y Dec. 911/96) con cálculo dinámico de avance al 100%.
3. **Evidencias Fotográficas & Hallazgos**: Documentación gráfica con nivel de severidad (*Menor, Moderada, Mayor, Crítica*) y visor Lightbox interactivo.
4. **Matriz de Medidas Correctivas**: Planes de mitigación técnica con fechas límite, responsables asignados, estados y estimación de costos.
5. **Firma Digital Manuscrita en Pantalla (Fase II)**: Canvas interactivo táctil para firma del inspector y representante de la empresa en el celular o tablet.
6. **Geolocalización GPS y Mapas (Fase II)**: Captura satelital de coordenadas y trazado en OpenStreetMap interactivo con Leaflet.
7. **Informes Oficiales en PDF con Verificación QR (Fase II)**: Emisión instantánea con DomPDF y validación pública inalterable en `/verify/{token}`.

---

## 🚀 Tecnologías Utilizadas

- **Backend:** PHP 8.2+ / 8.4+, Laravel 12.x, Eloquent ORM, Bcrypt, Middleware RBAC (`role:admin`, `role:inspector`, `active`).
- **Frontend:** React 19, Inertia.js v2, Tailwind CSS v4, Lucide React Icons.
- **Herramientas de Compilación:** Vite 7.x, `@vitejs/plugin-react`, `@tailwindcss/vite`.
- **Base de Datos:** MySQL 8.0+ / 8.4+ (Base de datos: `hys_control`).
- **Reportes:** Barryvdh DomPDF 3.x y exportación tabular CSV UTF-8.

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd sistema-inspecciones-hys
```

### 2. Instalar dependencias de PHP y Node
```bash
composer install
npm install
```
*(En Windows PowerShell utilizar `npm.cmd install` si aplica la política de scripts).*

### 3. Configuración de Entorno (`.env`)
```bash
cp .env.example .env
php artisan key:generate
```
Asegúrese de configurar la base de datos en `.env`:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hys_control
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Enlace simbólico de almacenamiento
```bash
php artisan storage:link
```

### 5. Migraciones y Datos de Prueba (Seeders)
```bash
php artisan migrate:fresh --seed
```

### 6. Compilar activos de React
```bash
npm run build
```

### 7. Iniciar el servidor local
```bash
php artisan serve
```
O simplemente ejecutar el archivo `iniciar_sistema.bat`. Acceder en el navegador a **`http://127.0.0.1:8000`**.

---

## 🔑 Credenciales de Prueba (Demo)

| Rol | Correo Electrónico | Contraseña | Matrícula / Función |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@hys.com` *(o admin@seguridad.local)* | `admin123` *(o password)* | MAT-NAC-00192 (Gestión global) |
| **Inspector Técnico** | `inspector@hys.com` *(o inspector@seguridad.local)* | `inspector123` *(o password)* | LIC-HYS-8492 (Auditor en campo) |

*(En la pantalla de inicio de sesión se incluyen botones de acceso rápido de un clic para pruebas ágiles).*

---

## 🧪 Pruebas Automatizadas

Para ejecutar la batería de pruebas de backend con aserciones de Inertia:
```bash
php artisan test
```
**Resultado:** 9 pruebas pasadas (49 aserciones exitosas).

---

## 📚 Documentación y Entregables

En la carpeta [`entregables/`](./entregables) se encuentran los manuales y recursos completos del proyecto:
- [**MANUAL_TECNICO.md**](./entregables/MANUAL_TECNICO.md): Arquitectura detallada, requerimientos de servidor, modelo relacional y seguridad.
- [**MANUAL_USUARIO.md**](./entregables/MANUAL_USUARIO.md): Guía práctica ilustrada paso a paso para administradores e inspectores.
- [**PRESENTACION_Y_DEMO.md**](./entregables/PRESENTACION_Y_DEMO.md): Estructura de diapositivas y guion de demostración cronometrado para la mesa examinadora.
- [**base_de_datos.sql**](./entregables/base_de_datos.sql): Script SQL completo con estructura y datos de prueba.
