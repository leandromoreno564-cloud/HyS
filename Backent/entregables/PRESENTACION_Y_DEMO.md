# Presentación del Proyecto y Guion de Demostración en Vivo
## Sistema de Gestión de Inspecciones de Higiene y Seguridad Laboral (HyS Control)

---

### PARTE 1: Estructura de Diapositivas para la Defensa Académica / Profesional

#### Diapositiva 1: Portada
- **Título**: Sistema Integral de Gestión de Inspecciones de Higiene y Seguridad Laboral (HyS Control)
- **Subtítulo**: Digitalización, Trazabilidad y Cumplimiento Normativo en Campo
- **Tecnologías**: Laravel 12, PHP 8.2, MySQL / SQLite, Bootstrap 5, Chart.js, DomPDF
- **Equipo de Desarrollo**: Estudiantes de Higiene, Seguridad y Sistemas

#### Diapositiva 2: Planteamiento del Problema
- **Situación Actual**: Las inspecciones de seguridad en plantas industriales y obras se realizan predominantemente en formularios en papel o planillas estáticas de cálculo.
- **Problemáticas Detectadas**:
  - Pérdida de tiempo en transcripción manual de datos en gabinete (horas extra dedicadas a confeccionar informes).
  - Fotografías de no conformidades desvinculadas del acta técnica o dispersas en teléfonos celulares personales.
  - Falta de estandarización en la aplicación de normativas (Ley 19.587, Dec. 351/79, Dec. 911/96).
  - Dificultad en el seguimiento de las medidas correctivas (las recomendaciones suelen quedar en papel sin trazabilidad de cumplimiento).
  - Imposibilidad de validar la autenticidad física de un informe técnico frente a auditorías externas o ART.

#### Diapositiva 3: Objetivos del Sistema
- **Objetivo General**: Desarrollar una aplicación web responsive que permita a los licenciados en higiene y seguridad gestionar inspecciones en campo, documentar evidencia fotográfica, completar checklists técnicos normativos, formular planes de acción y generar automáticamente informes PDF profesionales con validación QR.
- **Objetivos Específicos**:
  - Control de acceso por roles (Administrador e Inspectores).
  - Generación dinámica de checklists según sector industrial.
  - Interfaz Mobile-First adaptable a celulares y tablets para trabajo en planta.
  - Trazabilidad y sistema de notificaciones automáticas para medidas próximas a vencer.

#### Diapositiva 4: Arquitectura Tecnológica
- **Patrón Arquitectónico**: MVC (Modelo-Vista-Controlador) robusto.
- **Seguridad**:
  - Cifrado de credenciales con algoritmo Bcrypt.
  - Protección contra ataques CSRF, XSS e Inyecciones SQL mediante Eloquent ORM.
  - Middleware de autorización basada en roles (RBAC) y verificación de estado de cuenta activa.
- **Módulos Principales**:
  - Gestión de Usuarios y Licencias Profesionales.
  - Padrón de Empresas con Soft Delete e Historial.
  - Motor de Inspecciones y Checklists Dinámicos.
  - Matriz de Medidas Correctivas con Semáforo de Vencimiento.
  - Generador de Informes PDF con DomPDF y Códigos QR.

#### Diapositiva 5: Demostración en Vivo
*(Paso a la demostración práctica del software).*

#### Diapositiva 6: Conclusiones y Valor Agregado
- Reducción del tiempo de elaboración de informes de un 70% (de horas a un clic).
- Estandarización de criterios técnicos en base a leyes y decretos reglamentarios.
- Mayor confiabilidad documental y trazabilidad para empresas aseguradoras y entes de control.

---

### PARTE 2: Guion Paso a Paso para la Demostración en Vivo (5 a 10 Minutos)

#### Momento 1: Inicio de Sesión y Roles (1 minuto)
1. Abrir el navegador en `http://127.0.0.1:8000/login`.
2. Mostrar la pantalla de login con diseño responsive y el logotipo de seguridad.
3. Señalar los botones de acceso rápido de prueba: hacer clic en **"Admin"** e iniciar sesión.

#### Momento 2: Dashboard del Administrador y Analítica (2 minutos)
1. Mostrar las 4 tarjetas de indicadores clave (Empresas, Inspecciones, Inspectores y Medidas Vencidas).
2. Resaltar los gráficos interactivos en **Chart.js**:
   - Evolución mensual de auditorías.
   - Distribución porcentual por estado (Completadas, En Curso, Borradores).
3. Explicar el panel de **Alertas de Seguridad Críticas** (medidas vencidas) y el ranking de empresas con más observaciones.
4. Mostrar la sección **Gestión de Usuarios** y cómo se habilitan/deshabilitan cuentas o se editan matrículas.

#### Momento 3: Perspectiva del Inspector en Dispositivo Móvil (2 minutos)
1. Cerrar sesión e ingresar con el usuario del **Licenciado en Seguridad** (`inspector@seguridad.local`).
2. Redimensionar el navegador a vista móvil (o F12 -> modo emulador celular) para mostrar la interfaz responsive:
   - El menú colapsable (hamburguesa).
   - Los botones táctiles de gran tamaño (mínimo 44px de altura).
   - La tarjeta de inicio rápido para trabajo en campo.
3. Mostrar cómo el inspector visualiza únicamente sus empresas e inspecciones asignadas.

#### Momento 4: Flujo Completo de una Inspección en Campo (3 minutos)
1. Presionar **"Iniciar Inspección"**.
2. Seleccionar una empresa (ej. *Siderúrgica del Plata* o *Constructora Horizontes*).
3. Mostrar cómo al crear la inspección, el sistema genera automáticamente los checklists clasificados en los 10 ejes técnicos (Herramientas, Electricidad, Autoelevadores, EPP, Incendio, etc.).
4. **Evaluar ítems**:
   - Presionar los botones **Cumple**, **No Cumple** o **No Aplica**.
   - Mostrar cómo la barra de porcentaje de avance sube en tiempo real.
   - Abrir el desplegable de un ítem para agregar una nota técnica y nivel de riesgo.
5. **Cargar una Observación con Foto**:
   - Ir a la pestaña *Observaciones con Fotos*.
   - Registrar un hallazgo, indicar la ubicación (*Nave 2*), severidad (*Mayor*) y adjuntar una imagen.
   - Activar la casilla para generar la medida correctiva en el mismo acto.
6. **Revisar la Matriz de Medidas Correctivas**:
   - Cambiar el estado de una medida a *"Completada"*.
7. **Firmas y Cierre**:
   - En la pestaña *Firmas y Cierre*, verificar la firma del inspector y consignar el receptor de la empresa.
   - Pasar el estado a **"Completada"**.

#### Momento 5: Generación del Informe PDF y Verificación QR (2 minutos)
1. Presionar el botón **"Descargar Informe Técnico PDF"**.
2. Abrir el PDF generado y exhibir:
   - Portada profesional y metadatos de la empresa e inspector matriculado.
   - Gráficos y porcentajes de cumplimiento del resumen ejecutivo.
   - Tabla de relevamiento completo de todos los puntos de la norma.
   - Hallazgos detectados con severidades.
   - Plan de medidas correctivas.
   - Bloque de firmas oficiales.
   - **Código QR de autenticidad**.
3. Hacer clic en el enlace del QR o escanearlo con un celular para mostrar la **Página Pública de Certificado de Autenticidad**.
4. Mostrar la exportación de listados a formato CSV / Excel.
5. Conclusión y espacio para preguntas del jurado docente.
