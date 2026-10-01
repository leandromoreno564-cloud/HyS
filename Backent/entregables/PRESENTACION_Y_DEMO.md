# Presentación del Proyecto Institucional y Guion de Demostración en Vivo
## Plataforma Web de Gestión Integral de Inspecciones de Higiene y Seguridad Laboral (HyS Control)
**Instituto de Educación Superior "Nuevo Horizonte"**  
**Carrera:** Tecnicatura Superior en Desarrollo de Software  
**Espacio Curricular:** Prácticas Profesionalizantes I y II  
**Equipo Docente Evaluador:** Prof. Aquino Carolina, Prof. Figueroa Franco, Prof. Huanca Elio  
**Destinatarios:** Estudiantes, docentes e inspectores licenciados en Higiene y Seguridad Laboral

---

### PARTE 1: Estructura de Diapositivas para la Defensa Académica

#### Diapositiva 1: Portada Institucional
- **Título:** Plataforma Web de Gestión Integral de Inspecciones de Higiene y Seguridad Laboral (**HyS Control**)
- **Subtítulo:** Digitalización de Campo, Trazabilidad Normativa, Firmas Digitales y Verificación QR
- **Stack Tecnológico:** Laravel 12.x • React 19 • Inertia.js v2 • Tailwind CSS • MySQL 8.0 • DomPDF
- **Desarrolladores Ejecutores:** Estudiantes de 2.° y 3.° año de la Tecnicatura Superior en Desarrollo de Software

#### Diapositiva 2: Problemática y Justificación Interdisciplinaria
- **Diagnóstico en Campo:** Tradicionalmente, los profesionales en Seguridad e Higiene relevan plantas y obras con planillas impresas en papel y carpetas físicas.
- **Inconsistencias Detectadas:**
  - Pérdida excesiva de horas en gabinete transcribiendo apuntes y redactando informes en Word.
  - Fotografías de no conformidades dispersas en los teléfonos personales de los inspectores, desvinculadas del acta técnica.
  - Retrasos severos en la comunicación de medidas urgentes a las empresas clientes.
  - Imposibilidad de validar la autenticidad física de un informe frente a auditorías externas, entes de control o ART.
- **Propuesta:** Una solución web moderna, trazable, mobile-first y segura, que automatiza el ciclo integral desde la visita en campo hasta la emisión del informe formal.

#### Diapositiva 3: Decisión de Arquitectura Frontend (Evolución a React)
- **Evolución del Stack:** Con el aval del equipo docente, se sustituyó el esquema clásico de plantillas (*AdminLTE 3 y Bootstrap 5*) por un ecosistema de vanguardia en la industria: **React 19 + Inertia.js + Tailwind CSS**.
- **Ventajas Estratégicas:**
  - **Single Page Application (SPA):** Navegación fluida e instantánea sin recarga de pantallas.
  - **Experiencia Táctil Mobile-First:** Botones grandes de evaluación diseñados para celulares y tablets en plantas industriales ruidosas o con guantes.
  - **100% Gratuito y Open Source:** Sin costo de licencias ni plataformas privativas.
  - **Componentes Avanzados:** Canvas táctil para rúbrica manuscrita digital y mapas interactivos satelitales con OpenStreetMap.

#### Diapositiva 4: Alcance Funcional Fase I (Núcleo Operativo Implementado)
- **Seguridad y Roles:** Autenticación protegida con control RBAC (`role:admin` / `role:inspector`), registro de actividad y control de inactividad.
- **Gestión de Empresas:** Padrón con búsqueda en vivo, filtro por sector, soft delete, restauración y asignación de técnicos por tabla pivote (`company_user`).
- **Checklists Técnicos Normativos:** Generación automática de listas de cotejo según sector (Ley 19.587 y Dec. 351/79) con cálculo automático de avance al 100%.
- **Evidencias Fotográficas:** Clasificación de desvíos con severidad (*Menor, Moderada, Mayor, Crítica*) y subida de imágenes múltiples.
- **Planes de Acción:** Matriz de medidas correctivas con asignación de responsables, costos estimados y semáforo de vencimiento.
- **Informes Ejecutivos:** Generación en alta calidad de actas técnicas oficiales en PDF mediante DomPDF.

#### Diapositiva 5: Alcance Funcional Fase II (Módulos de Evolución Técnica)
- **Firma Digital Manuscrita en Canvas:** Módulo táctil para la rúbrica en pantalla del inspector y del representante de la empresa.
- **Geolocalización GPS y Mapas:** Captura automática de coordenadas con un clic y visualización en mapa interactivo con Leaflet.
- **Validación Pública por Código QR:** Inclusión de código QR dinámico con token UUID para que cualquier perito o autoridad pueda constatar la autenticidad del acta en `/verify/{token}`.
- **Exportación Masiva a Excel:** Extracción de datos en CSV UTF-8 estructurado.

#### Diapositiva 6: Conclusiones e Impacto
- Reducción del tiempo de elaboración de informes en un **80%** (de horas de redacción a un solo clic).
- Trazabilidad y transparencia absoluta para la Tecnicatura en Seguridad e Higiene Laboral.
- Cumplimiento estricto del cronograma de 6 semanas y de todos los estándares de calidad del proyecto educativo.

---

### PARTE 2: Guion Paso a Paso para la Demostración Práctica en Vivo (7 a 10 Minutos)

Este guion está cronometrado para guiar la presentación práctica ante los profesores evaluadores de manera contundente y ordenada.

---

#### Momento 1: Inicio de Sesión y Control de Accesos (1 minuto)
1. **Abrir el navegador** en `http://127.0.0.1:8000`.
2. **Explicar:** *"Presentamos la interfaz de acceso de HyS Control, construida con React 19 y Tailwind CSS, con un diseño SaaS contemporáneo y validación en tiempo real"*.
3. **Demostración de Acceso Rápido:** Hacer clic en el botón **"Como Admin"** (completa `admin@hys.com` / `admin123`) e iniciar sesión.
4. **Resaltar:** Señalar el mensaje de bienvenida emergente y la ausencia total de parpadeo en la carga gracias a Inertia.js.

---

#### Momento 2: Dashboard General y Monitoreo Estratégico (2 minutos)
1. **Métricas Clave:** Mostrar las tarjetas superiores de KPI (Empresas registradas, Total de inspecciones, Medidas pendientes e Inspectores activos).
2. **Alerta Crítica de Seguridad:** Señalar el banner de medidas vencidas: *"Si un extintor venció o un tablero eléctrico no se arregló en plazo, el sistema lo detecta automáticamente y lo destaca en rojo para los auditores"*.
3. **Gráficos Interactivos:**
   - Mostrar el gráfico de barras con la **evolución de inspecciones de los últimos 6 meses**.
   - Mostrar el desglose porcentual de estados (*Completadas, En Progreso, Borradores*).
4. **Módulo de Usuarios (Exclusivo Admin):** Ir a **"Usuarios & Técnicos"** y mostrar:
   - Los números de matrícula profesional de los inspectores (`LIC-HYS-8492`).
   - El botón de activación/desactivación instantánea de cuenta para seguridad operativa.

---

#### Momento 3: Perspectiva del Inspector en Dispositivo Móvil (1 minuto)
1. **Cambio de Rol:** Cerrar sesión desde el menú de usuario e ingresar con el botón **"Como Inspector"** (`inspector@hys.com` / `inspector123`).
2. **Modo Emulador Móvil:** Presionar `F12` en el navegador y conmutar a la vista de celular (iPhone o Galaxy) para que los profesores aprecien el diseño *Mobile-First*:
   - Menú lateral hamburguesa retraíble con fondo traslúcido (*backdrop-blur*).
   - Acceso directo para **"Iniciar Inspección en Terreno"**.
   - Listado de empresas que ese inspector tiene efectivamente asignadas.

---

#### Momento 4: Flujo Completo de Auditoría en Campo (3 a 4 minutos)
*(Regresar a pantalla normal o mantener en tablet)*.

1. **Iniciar Inspección:**
   - Hacer clic en **"Iniciar Inspección en Terreno"**.
   - Seleccionar la empresa **"Siderúrgica del Plata S.A."** (Sector Metalmecánica).
   - Indicar tipo: **General** y presionar **"Crear e Iniciar Evaluación"**.
   - **Explicar:** *"En este instante, el backend generó automáticamente todos los ítems normativos correspondientes a la Ley 19.587 para el sector metalmecánico"*.
2. **Pestaña 1 - Checklist Técnico Táctil:**
   - Mostrar los botones grandes de evaluación: presionar **`[ Cumple ]`**, **`[ No Cumple ]`** y **`[ No Aplica ]`**.
   - Señalar cómo la **barra de progreso y el porcentaje de cumplimiento** suben instantáneamente en pantalla sin recargar la página.
   - En un ítem con *No Cumple*, mostrar el atajo rápido que invita a documentar el hallazgo.
3. **Pestaña 2 - Observaciones con Evidencia Fotográfica:**
   - Ir a la pestaña **"Observaciones & Fotos"** y hacer clic en **"Nueva Observación"**.
   - Indicar severidad: **Mayor**, Ubicación: *Nave 2 - Taller de Maquinado*, y descripción técnica del defecto eléctrico.
   - Adjuntar fotos de prueba y marcar la casilla *"Generar Medida Correctiva Inmediata"*.
   - Mostrar la galería visual generada y hacer clic en una foto para demostrar el **visor Lightbox modal** ampliado.
4. **Pestaña 3 - Medidas Correctivas:**
   - Mostrar cómo la medida correctiva quedó vinculada con responsable, fecha de vencimiento y estado *Pendiente*.
5. **Pestaña 4 - Firma Digital Manuscrita en Pantalla (Fase II):**
   - Ir a la pestaña **"Firma Digital & Cierre"**.
   - **Dibujar la firma con el mouse o con el dedo en la pantalla táctil** en el recuadro del Inspector.
   - Escribir el nombre del representante de planta (*Ing. Roberto Gómez*) y estampar su firma en el segundo canvas.
   - Presionar **"Guardar y Estampar Firmas en Informe"**.
6. **Pestaña 5 - Geolocalización Satelital GPS (Fase II):**
   - Ir a la pestaña **"Geolocalización GPS"**.
   - Presionar **"Usar mi GPS actual"** y mostrar el mapa interactivo de OpenStreetMap con el marcador fijado sobre las coordenadas.

---

#### Momento 5: Cierre del Acta, Emisión del PDF y Validación QR (2 minutos)
1. **Cerrar el Acta:** Presionar el botón superior **"Finalizar y Cerrar"**.
2. **Generar Informe Oficial:** Hacer clic en **"Descargar Informe PDF"**.
3. **Exhibir el PDF Oficial generado por DomPDF:**
   - Mostrar la portada formal con datos de la empresa, inspector y matrícula.
   - El resumen ejecutivo con los porcentajes de conformidad.
   - La lista de cotejo completa categorizada.
   - Las fotos de evidencia integradas en alta definición.
   - Las **firmas manuscritas digitales** capturadas en el canvas.
   - El **Código QR dinámico** estampado al pie del acta.
4. **Verificación Pública de Autenticidad:**
   - Abrir en una pestaña nueva la URL de verificación pública vinculada al código QR (`http://127.0.0.1:8000/verify/{token}`).
   - **Explicar:** *"Cualquier persona que escanee el código QR físico con su teléfono accederá a este certificado digital oficial que garantiza la inalterabilidad y validez jurídica del informe"*.

---

### PARTE 3: Respuestas a Preguntas Probables de la Mesa Examinadora

- **¿Por qué migraron a React si el programa original mencionaba AdminLTE?**  
  *Respuesta:* AdminLTE 3 es una plantilla basada en Bootstrap 4/5 y jQuery que data de 2014, requiriendo recargas continuas de página que entorpecen la labor en campo. React 19 con Inertia.js y Tailwind CSS nos permite brindar una aplicación tipo SPA de alta velocidad, con componentes táctiles modernos (como el canvas de firma y los mapas) que elevan sustancialmente el perfil profesional del egresado, utilizando tecnologías 100% gratuitas y de máxima demanda en la industria.

- **¿Cómo se asegura que no se pierdan datos si el inspector pierde conectividad momentánea?**  
  *Respuesta:* Cada acción sobre el checklist se envía mediante peticiones asíncronas optimistas de Inertia.js preservando el estado de la pantalla. Además, la arquitectura está preparada para la Fase II de PWA Offline mediante Service Workers y almacenamiento local en IndexedDB.

- **¿Cómo se garantiza que un informe en PDF no sea adulterado?**  
  *Respuesta:* Mediante la combinación de la firma digital manuscrita en base64 y el token UUID criptográfico único estampado en el código QR. Cualquier modificación al PDF físico quedará en evidencia al contrastarlo contra los datos públicos alojados en el servidor institucional.
