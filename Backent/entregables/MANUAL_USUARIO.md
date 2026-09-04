# Manual de Usuario del Sistema HyS Control
## Guía Integral para Alumnos, Docentes y Profesionales en Higiene y Seguridad Laboral

---

### 1. Introducción y Propósito de la Plataforma
El **Sistema de Gestión de Inspecciones de Higiene y Seguridad Laboral (HyS Control)** es una solución web responsive de nivel profesional diseñada para digitalizar, estructurar y optimizar el trabajo de campo de los licenciados e ingenieros en seguridad.

Reemplaza los tradicionales formularios en papel por un entorno ágil con:
- Carga de datos en tiempo real desde celulares, tablets o PC de escritorio.
- Listas de verificación (checklists) estandarizadas según normativas vigentes (Ley 19.587, Dec. 351/79, Dec. 911/96, Resoluciones SRT y normas IRAM).
- Captura directa de fotografías de evidencia.
- Generación automática de planes de medidas correctivas.
- Emisión instantánea de Informes Oficiales en PDF con código QR de autenticidad.

---

### 2. Roles de Usuario y Niveles de Acceso

#### A. Administrador (Root)
- Control total sobre usuarios (alta de inspectores, asignación de roles y habilitación/deshabilitación de cuentas).
- Supervisión estratégica global mediante el Dashboard Central con gráficos de evolución y alertas de seguridad.
- Capacidad de reasignar empresas entre inspectores y gestionar la papelera de reciclaje (soft delete y restauración).

#### B. Licenciado en Higiene y Seguridad (Inspector)
- Registro directo y autónomo de nuevas empresas y establecimientos clientes.
- Realización de inspecciones técnicas en campo sobre empresas asignadas o dadas de alta por el propio profesional.
- Evaluación de ítems de checklist, registro de hallazgos fotográficos y formulación de medidas correctivas.
- Descarga de informes técnicos en PDF y seguimiento de plazos de vencimiento.

---

### 3. Guía de Operación Paso a Paso

#### 3.1. Inicio de Sesión
1. Ingrese a la URL de la plataforma (`http://127.0.0.1:8000/login`).
2. Digite su correo electrónico y contraseña asignada.
   - *Tip*: En la pantalla de login dispone de botones de un solo clic (**"Admin: admin@seguridad.local"** e **"Inspector: inspector@seguridad.local"**) para demostraciones ágiles.
3. Presione **Iniciar Sesión**.

#### 3.2. Gestión de Empresas e Instalaciones
1. Desde el menú lateral, diríjase a **Empresas**.
2. Presione el botón **"Registrar Empresa"**.
3. Complete los datos del establecimiento: Razón Social, CUIT/RUC, Sector Industrial (Metalmecánica, Construcción, Química, etc.), Dirección y Persona de Contacto.
4. Presione **"Registrar Empresa"**.
5. En la ficha de la empresa, podrá visualizar:
   - Los datos generales y personal asignado.
   - El **Código QR dinámico** de la empresa (apto para imprimir y exhibir en la portería o entrada de la planta).
   - El historial cronológico de todas las inspecciones realizadas en dicho establecimiento.

#### 3.3. Creación y Ejecución de una Inspección en Campo
1. Haga clic en **"Iniciar Inspección"** (desde el menú, el Dashboard o la ficha de la empresa).
2. Seleccione el establecimiento, la fecha, el tipo de auditoría (**General**, **Específica** o **Seguimiento**) y el horario.
3. Presione **"Iniciar Checklist y Carga"**. El sistema generará automáticamente los ítems normativos correspondientes a los 10 ejes técnicos de seguridad:
   1. *Herramientas manuales y portátiles*
   2. *Instalaciones eléctricas*
   3. *Vehículos y autoelevadores*
   4. *Procedimientos de trabajo seguro (PTS)*
   5. *Equipos de Protección Personal (EPP)*
   6. *Señalización y cartelería*
   7. *Emergencias y evacuación (Extintores y salidas)*
   8. *Almacenamiento y estibaje*
   9. *Sustancias químicas y residuos peligrosos*
   10. *Maquinaria y equipos industriales*

#### 3.4. Evaluación del Checklist Técnico (Pestaña 1)
- Cada ítem presenta botones táctiles grandes optimizados para uso móvil en campo:
  - **Cumple** (Verde): La condición se ajusta a la normativa.
  - **No Cumple** (Rojo): Se detectó una no conformidad o condición subestándar.
  - **No Aplica** (Gris): La condición no existe en ese sector o puesto de trabajo.
- Al pulsar el botón **"Notas / Foto"**, puede escribir observaciones puntuales, seleccionar el nivel de riesgo (**Bajo / Medio / Alto**) y subir fotos de evidencia desde la cámara del celular.
- La barra superior actualiza de inmediato el **Porcentaje de Avance** y la **Tasa de Cumplimiento Global**.
- Si la planta posee un riesgo particular no contemplado, presione **"Agregar Ítem Personalizado"** para incluirlo en el acta.

#### 3.5. Registro de Observaciones con Fotos (Pestaña 2)
1. Ingrese a la pestaña **"Observaciones con Fotos"**.
2. Haga clic en **"Registrar Hallazgo / Foto"**.
3. Seleccione el tipo (**Hallazgo**, **Buena práctica** o **Mejora**), el nivel de severidad (**Menor**, **Moderado**, **Mayor** o **Crítico**) y la ubicación en planta (ej. *Nave 2 - Taller de Soldadura*).
4. Adjunte las fotos del defecto o situación detectada.
5. *Función Rápida*: Si marca la casilla *"Generar de inmediato una Medida Correctiva"*, podrá definir la solución técnica en el mismo formulario.

#### 3.6. Plan de Medidas Correctivas (Pestaña 3)
1. En esta sección se consolida el plan de acción preventivo/correctivo.
2. Cada medida cuenta con:
   - Acción requerida y sugerencias técnicas.
   - Nivel de prioridad (**Crítica / Alta / Media / Baja**).
   - Responsable asignado en la empresa.
   - Fecha límite de implementación (el sistema alertará si la fecha expira).
   - Selector de estado interactivo (**Pendiente / En Progreso / Completada / Cancelada**).

#### 3.7. Conformidad, Firmas y Descarga del Informe PDF (Pestaña 4)
1. Diríjase a la pestaña **"Firmas y Cierre"**.
2. Ingrese la aclaración de matrícula del Inspector y los datos del Representante de la empresa que acompaña el recorrido.
3. Presione **"Guardar Conformidad de Firmas"**.
4. Cambie el estado de la inspección a **"Completada"**.
5. Haga clic en **"Descargar Informe Técnico PDF"**. El sistema generará un documento en alta calidad con:
   - Portada y datos formales del acta.
   - Resumen ejecutivo con gráficos de conformidad.
   - Tabla completa del checklist categorizado.
   - Registro de hallazgos y fotos.
   - Matriz de medidas correctivas priorizadas.
   - Espacio de firmas oficiales.
   - **Código QR de validación inalterable**.

#### 3.8. Verificación de Autenticidad mediante Código QR
Cualquier auditor, cliente o autoridad que escanee el código QR impreso en el PDF será redirigido a la pantalla pública de verificación (`/verify/{token}`), donde podrá constatar en línea la validez del acta, inspector interviniente y estado de cumplimiento.
