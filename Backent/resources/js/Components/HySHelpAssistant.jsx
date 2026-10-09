import React, { useState, useRef, useEffect } from 'react';
import { 
    HelpCircle, 
    X, 
    Send, 
    Bot, 
    Minimize2, 
    RotateCcw, 
    ChevronRight, 
    FileText, 
    Camera, 
    PenTool, 
    Building2, 
    CheckSquare, 
    AlertTriangle, 
    Calendar, 
    QrCode, 
    UserCheck,
    Search,
    BookOpen,
    Scale,
    ShieldAlert,
    Briefcase,
    Layers
} from 'lucide-react';

// Secciones temáticas del Asistente HyS (sin emojis)
const SECTIONS = [
    {
        id: 'manual',
        title: 'Manual de la Web',
        shortTitle: 'Manual Web',
        desc: 'Botones y funciones de la plataforma',
        badge: '6 temas',
        questions: [
            { id: 'extraer_pdf', title: '¿Para qué sirve cada botón del checklist?' },
            { id: 'subir_foto', title: '¿Cómo cargar fotos y evidencias desde el celular?' },
            { id: 'firmar', title: '¿Cómo funciona la firma digital en pantalla?' },
            { id: 'descargar_pdf', title: '¿Cómo descargar el informe final con QR?' },
            { id: 'crear_empresa', title: '¿Cómo crear y registrar una nueva empresa?' },
            { id: 'calendario', title: '¿Cómo usar la agenda y calendario de visitas?' }
        ]
    },
    {
        id: 'normativas',
        title: 'Leyes y Normativas HyS',
        shortTitle: 'Leyes y Normas',
        desc: 'Ley 19.587, Decretos 351, 911 y 617',
        badge: '6 temas',
        questions: [
            { id: 'ley_19587', title: 'Ley 19.587: Pilares de Higiene y Seguridad Laboral' },
            { id: 'decreto_351', title: 'Decreto 351/79: Industria, Comercios y Servicios' },
            { id: 'decreto_911', title: 'Decreto 911/96: Normativa para la Construcción' },
            { id: 'decreto_617', title: 'Decreto 617/97: Actividad Agropecuaria y Forestal' },
            { id: 'epp_normas', title: 'EPP Obligatorios y certificación de calidad IRAM' },
            { id: 'colores_iram', title: 'Código de Colores y Señales (Norma IRAM 10005)' }
        ]
    },
    {
        id: 'riesgos',
        title: 'Riesgos y Medidas Correctivas',
        shortTitle: 'Riesgos y Medidas',
        desc: 'Evaluación de gravedad, plazos y planes',
        badge: '5 temas',
        questions: [
            { id: 'matriz_riesgo', title: '¿Cómo clasificar la gravedad de los peligros?' },
            { id: 'plazos_medidas', title: '¿Qué plazos legales fijar para subsanar faltas?' },
            { id: 'costos_medidas', title: '¿Cómo presupuestar y estimar costos de mejoras?' },
            { id: 'peligro_inminente', title: 'Protocolo ante peligro inminente y grave' },
            { id: 'seguimiento_medidas', title: '¿Cómo hacer seguimiento de medidas vencidas?' }
        ]
    },
    {
        id: 'gestion',
        title: 'Empresas y Legajo Técnico',
        shortTitle: 'Empresas y Legajo',
        desc: 'Legajo técnico, ART y contratistas',
        badge: '4 temas',
        questions: [
            { id: 'legajo_tecnico', title: '¿Qué documentos debe tener el Legajo Técnico de HyS?' },
            { id: 'horas_profesional', title: '¿Cuántas horas de profesional exige la ley por empresa?' },
            { id: 'programa_seguridad', title: '¿Cuándo se exige Programa de Seguridad con aval ART?' },
            { id: 'contratistas_sub', title: '¿Qué documentación exigir a contratistas y terceros?' }
        ]
    },
    {
        id: 'faq_campo',
        title: 'Preguntas Frecuentes y Campo',
        shortTitle: 'F.A.Q. y Campo',
        desc: 'Tips de campo, sin conexión y firmas',
        badge: '4 temas',
        questions: [
            { id: 'modo_offline', title: '¿Se puede usar la app si no hay señal en la fábrica?' },
            { id: 'validez_qr', title: '¿Por qué el código QR garantiza validez legal?' },
            { id: 'fotos_periciales', title: 'Consejos para tomar fotos periciales claras' },
            { id: 'negativa_firma', title: '¿Qué hacer si el responsable no quiere firmar el acta?' }
        ]
    }
];

// Base de conocimiento completa (sin emojis y sin marcas de asteriscos)
const KNOWLEDGE_BASE = [
    // --- MANUAL DE LA WEB ---
    {
        id: 'extraer_pdf',
        sectionId: 'manual',
        keywords: ['extraer pdf', 'subir pdf', 'importar pdf', 'boton pdf', 'cargar pdf', 'pdf checklist', 'botones checklist', 'cada boton', 'botones'],
        answer: `¿Para qué sirve cada botón del Checklist?

• Botón "Extraer PDF": Escanea un informe PDF oficial que subas y carga automáticamente todas las preguntas del checklist sin tener que escribirlas a mano.
• Botón "Cámara / Foto": Abre la cámara o galería para adjuntar hasta 2 fotos de evidencia del peligro encontrado.
• Botón "Firmar": Abre la pantalla táctil para firmar el acta con el dedo junto al responsable de la empresa.
• Botón "Descargar PDF": Genera el dictamen técnico final con fotos, medidas y código QR de validación.`
    },
    {
        id: 'subir_foto',
        sectionId: 'manual',
        keywords: ['foto', 'fotos', 'evidencia', 'camara', 'adjuntar foto', 'subir foto', 'subir evidencia', 'celular', 'cel'],
        answer: `¿Cómo cargar fotos y evidencias desde el celular?

1. Al lado de cada ítem del checklist se encuentra el botón con el ícono de la Cámara.
2. Al presionarlo, puedes tomar la foto en el momento en la empresa o elegir una de tu galería.
3. Puedes subir hasta 2 fotos por ítem.
4. Selecciona el nivel de gravedad del peligro: Menor, Moderada, Mayor o Crítica.
5. Presiona "Guardar Evidencia".

Nota: Si tocas la foto guardada, se abre en tamaño ampliado (Lightbox) para revisar los detalles técnicos.`
    },
    {
        id: 'firmar',
        sectionId: 'manual',
        keywords: ['firma', 'firmar', 'signature', 'pantalla tactil', 'canvas', 'firma digital', 'rubrica'],
        answer: `¿Cómo funciona la firma digital en pantalla?

Al finalizar la inspección en el establecimiento:
1. En la parte inferior del checklist se encuentra el recuadro blanco de Firma Digital.
2. Puedes firmar directamente con el dedo en la pantalla del celular o con el mouse en la computadora.
3. Firman dos personas: el Inspector/a y el Responsable de la empresa.
4. Si la firma salió corrida o desprolija, presionas "Limpiar" y se puede volver a trazar.
5. Al guardar, las firmas quedan estampadas de forma inalterable en el informe oficial.`
    },
    {
        id: 'descargar_pdf',
        sectionId: 'manual',
        keywords: ['descargar pdf', 'informe oficial', 'informe pdf', 'acta', 'qr', 'exportar pdf', 'verificar qr', 'informe final'],
        answer: `¿Cómo descargar el informe final con QR?

1. Una vez completado el checklist y registradas las firmas, presiona el botón azul "Descargar Informe PDF".
2. El sistema emite un documento formal con:
   - Membrete oficial del IES Nuevo Horizonte.
   - Datos completos de la empresa y fecha de inspección.
   - Las preguntas del checklist con sus fotos de evidencia en miniatura.
   - El plan de medidas correctivas recomendadas con sus plazos.
   - Las firmas manuscritas del inspector y la empresa.

Verificación QR: En la esquina del documento hay un código QR que cualquier persona puede escanear con su celular para comprobar la autenticidad del acta en la web pública (/verify/{token}).`
    },
    {
        id: 'crear_empresa',
        sectionId: 'manual',
        keywords: ['crear empresa', 'nueva empresa', 'alta empresa', 'agregar empresa', 'registrar empresa', 'asignar empresa'],
        answer: `¿Cómo crear y registrar una nueva Empresa?

1. En el menú lateral izquierdo, haz clic en "Empresas".
2. Presiona el botón "+ Nueva Empresa" en la esquina superior.
3. Completa los datos obligatorios:
   - Razón Social: Nombre formal de la empresa.
   - CUIT: Número tributario de 11 dígitos sin guiones.
   - Rubro: Metalúrgica, Construcción, Comercio, Salud, etc.
   - Cantidad de Empleados: Para calcular exigencias de horas profesionales.
   - Dirección y Contacto: Teléfono y persona a cargo.
4. Presiona "Guardar Empresa".

El Administrador puede asignar qué inspectores específicos auditarán cada empresa.`
    },
    {
        id: 'calendario',
        sectionId: 'manual',
        keywords: ['calendario', 'agenda', 'visita', 'programar visita', 'fecha inspeccion', 'agendar'],
        answer: `¿Cómo usar la agenda y calendario de visitas?

Sirve para organizar las fechas de inspección técnica en campo:
1. Entra a la sección "Calendario y Agenda" en el menú lateral.
2. Verás una vista mensual y semanal con las visitas programadas.
3. Toca cualquier día del calendario para agendar una nueva visita.
4. Elige la empresa, el inspector asignado, la fecha y el horario previsto.
5. Cada visita tiene etiquetas según su estado: Pendiente (amarillo), En Proceso (azul) o Completada (verde).`
    },

    // --- LEYES Y NORMATIVAS HYS ---
    {
        id: 'ley_19587',
        sectionId: 'normativas',
        keywords: ['ley 19587', '19587', 'ley nacional', 'pilares', 'objetivo ley', 'empleador', 'trabajador', 'normativa'],
        answer: `Ley 19.587 de Higiene y Seguridad en el Trabajo (Nacional)

Es la ley madre de la prevención de riesgos laborales en Argentina (sancionada en 1972).
• Objetivo principal: Proteger la vida, preservar y mantener la integridad psicofísica de los trabajadores, prevenir accidentes y enfermedades profesionales.
• Obligaciones del Empleador: Proveer condiciones e instalaciones seguras, proveer EPP certificados sin costo, capacitaciones periódicas y contar con servicio de HyS.
• Obligaciones del Trabajador: Cumplir las normas, usar obligatoriamente los EPP provistos y participar en las capacitaciones de seguridad.

Se reglamenta mediante decretos según el tipo de actividad (Decreto 351/79 industria, Decreto 911/96 construcción, Decreto 617/97 agro).`
    },
    {
        id: 'decreto_351',
        sectionId: 'normativas',
        keywords: ['decreto 351', '351/79', '351', 'industria', 'comercio', 'carga termica', 'ruido', 'iluminacion', 'puesta a tierra', 'incendio'],
        answer: `Decreto 351/79 (Industrias, Comercios y Servicios)

Reglamenta la Ley 19.587 para todos los establecimientos fabriles y comerciales:
• Capítulo 5 - Carga Térmica: Evaluación de estrés térmico por calor y frío en ambientes laborales.
• Capítulo 9 - Iluminación y Color: Niveles mínimos de lux según la tarea (Anexo IV) y señalización de seguridad.
• Capítulo 13 - Ruidos y Vibraciones: Límite máximo de 85 dBA para 8 horas de jornada laboral (Anexo V).
• Capítulo 14 - Instalaciones Eléctricas: Protocolo de Puesta a Tierra (Resolución SRT 900/15), protección diferencial y disyuntores.
• Capítulo 18 - Protección contra Incendios: Cálculo de carga de fuego, tipos de extintores (ABC, CO2), salidas de emergencia y simulacros.`
    },
    {
        id: 'decreto_911',
        sectionId: 'normativas',
        keywords: ['decreto 911', '911/96', '911', 'construccion', 'obra', 'altura', 'arnes', 'excavacion', 'andamio', 'zanjas'],
        answer: `Decreto 911/96 (Higiene y Seguridad en la Construcción)

Reglamento técnico específico para obras civiles, montajes, excavaciones y demoliciones:
• Aviso de Inicio de Obra: Obligación de comunicar a la ART antes de empezar cualquier trabajo.
• Trabajos en Altura: Obligatoriedad de arnés integral de seguridad con cabo de vida a partir de los 2 metros de altura (con punto de anclaje firme).
• Excavaciones: Entibado o tablestacado obligatorio en zanjas de más de 1.20 metros de profundidad.
• Tableros Eléctricos de Obra: Deben ser estancos, con disyuntor diferencial de 30mA, puesta a tierra y tomas industriales normalizados tipo Steck.`
    },
    {
        id: 'decreto_617',
        sectionId: 'normativas',
        keywords: ['decreto 617', '617/97', '617', 'agro', 'campo', 'agroquimico', 'fitosanitario', 'tractor', 'rops', 'rural'],
        answer: `Decreto 617/97 (Actividad Agropecuaria y Forestal)

Aplica a explotaciones agrícolas, ganaderas, forestales y avícolas:
• Maquinaria y Tractores: Estructura de protección antivuelco certificada (ROPS), protección en toma de fuerza y cardanes.
• Manejo de Fitosanitarios y Agroquímicos: Depósito ventilado exclusivo bajo llave, EPP especial (máscara con filtro para vapores orgánicos, guantes de nitrilo, traje impermeable).
• Animales y Riesgo Biológico: Vacunación antitetánica y prevención de zoonosis, corrales y mangas con diseño seguro.
• Vivienda y Campamentos: Provisión de agua potable certificada y condiciones habitacionales dignas.`
    },
    {
        id: 'epp_normas',
        sectionId: 'normativas',
        keywords: ['epp', 'elementos de proteccion', 'casco', 'gafas', 'calzado', 'iram', 'res 299', 'entrega epp', 'proteccion personal'],
        answer: `EPP Obligatorios y Certificación de Calidad

Los Elementos de Protección Personal son la última barrera de defensa tras agotar controles de ingeniería y organizativos.
• Requisito legal: Todo EPP en Argentina debe poseer sello de certificación reconocido (Sello IRAM o Sello de Seguridad de la Secretaría de Comercio).
• Cabeza: Casco de seguridad Clase B (aislante eléctrico) o Clase A (impacto).
• Ojos y Rostro: Gafas con protección lateral anti-impacto o pantallas faciales (chispas / químicos).
• Auditivo: Protectores de copa (de vincha) o de inserción endoaural si el nivel supera los 85 dBA.
• Pies: Calzado de seguridad con puntera de acero o composite y suela dieléctrica antideslizante.
• Planilla de Entrega: Debe registrarse bajo la constancia oficial de la Resolución SRT 299/11 con firma de cada operario.`
    },
    {
        id: 'colores_iram',
        sectionId: 'normativas',
        keywords: ['color', 'colores', 'iram 10005', '10005', 'senalizacion', 'rojo', 'amarillo', 'verde', 'azul', 'senales'],
        answer: `Código de Colores y Señalización (Norma IRAM 10005)

Estandariza los colores de seguridad en plantas industriales y obras:
• Rojo: Parada obligatoria, prohibición, y ubicación de equipos contra incendio (matafuegos, hidrantes, pulsadores de alarma).
• Amarillo: Precaución, riesgo físico (desniveles, vigas bajas, partes móviles de máquinas, circulación de autoelevadores).
• Verde: Seguridad, primeros auxilios, botiquines, duchas de emergencia, lavaojos y vías de evacuación.
• Azul: Acción de mando obligatorio (ejemplo: "Uso obligatorio de casco", "Uso de gafas de seguridad").`
    },

    // --- RIESGOS Y MEDIDAS CORRECTIVAS ---
    {
        id: 'matriz_riesgo',
        sectionId: 'riesgos',
        keywords: ['matriz', 'gravedad', 'clasificar riesgo', 'peligro', 'menor', 'moderada', 'mayor', 'critica', 'iperc'],
        answer: `¿Cómo clasificar la gravedad de los peligros?

En HyS Control clasificamos los desvíos en 4 niveles para priorizar la acción preventiva:
• Menor: Desvío formal o leve que no pone en riesgo inminente la integridad física (ejemplo: falta cartel indicativo de salida).
• Moderada: Riesgo controlable con bajo potencial de incapacidad (ejemplo: pasillo de circulación parcialmente obstruido).
• Mayor: Peligro importante con riesgo de lesión grave o fractura (ejemplo: cables pelados sin aislación, falta baranda reglamentaria a 2m).
• Crítica: Peligro inminente de muerte o mutilación (ejemplo: trabajo en altura sin arnés, zanja sin entibar a punto de derrumbe).`
    },
    {
        id: 'plazos_medidas',
        sectionId: 'riesgos',
        keywords: ['plazo', 'plazos', 'dias', 'tiempo', 'no conformidad', 'subsanar', '24hs', 'urgente', 'cuantos dias'],
        answer: `Plazos Legales Sugeridos para Subsanar No Conformidades

Según el nivel de gravedad detectado en la inspección:
• Peligro Crítico (Inminente): Subsanación inmediata (24 a 48 horas). En casos graves se ordena la paralización preventiva de la tarea.
• Peligro Mayor: Plazo perentorio de 5 a 15 días corridos.
• Peligro Moderado: Plazo operativo de 15 a 30 días corridos.
• Peligro Menor / Administrativo: Plazo de 30 a 60 días corridos.

Todo plazo pactado queda registrado en el informe oficial firmado por el responsable de la empresa.`
    },
    {
        id: 'costos_medidas',
        sectionId: 'riesgos',
        keywords: ['costo', 'costos', 'presupuesto', 'estimar costo', 'inversion', 'precio', 'medidas correctivas'],
        answer: `¿Cómo presupuestar y estimar costos de mejoras?

Al cargar una medida correctiva en la plataforma, puedes ingresar un costo estimado para que la gerencia visualice la inversión necesaria:
• Bajo ($): Cartelería y señalética, charlas de seguridad de 5 minutos, demarcación de sendas peatonales con pintura epoxi.
• Medio ($$): Recambio de EPP certificados, instalación y recarga de extintores, protecciones mecánicas de correas y poleas.
• Alto ($$$): Sistema de puesta a tierra integral, adecuación de tableros con disyuntores termomagnéticos, ventilación forzada o insonorización.`
    },
    {
        id: 'peligro_inminente',
        sectionId: 'riesgos',
        keywords: ['peligro inminente', 'suspension', 'paralizar', 'riesgo grave', 'urgente', 'parar tarea', 'muerte'],
        answer: `Protocolo ante Peligro Inminente y Grave

Si durante la auditoría detectas una situación con riesgo inminente de vida:
1. Acción inmediata: Notificar verbalmente al responsable del sector y solicitar la suspensión inmediata de la maniobra peligrosa.
2. Registro pericial: Tomar fotografía con el botón de cámara de la app marcándola como Gravedad Crítica.
3. Acta formal: Dejar constancia expresa en las observaciones del informe técnico.
4. Notificación fehaciente: Informar por escrito a la gerencia de la empresa y a la aseguradora (ART) según corresponda.`
    },
    {
        id: 'seguimiento_medidas',
        sectionId: 'riesgos',
        keywords: ['seguimiento', 'medidas vencidas', 'vencida', 'abierta', 'resueltas', 'cerrar medida', 'estado medida'],
        answer: `¿Cómo hacer seguimiento de medidas correctivas?

1. En el módulo "Medidas Correctivas" del sistema puedes filtrar por: Abiertas, En Proceso y Resueltas.
2. Al vencerse un plazo acordado, el sistema resalta el ítem en rojo como Vencida.
3. En la siguiente visita de seguimiento, se verifica si fue subsanada en campo.
4. Si está resuelta, se toma una foto de la mejora implementada y se marca como Solucionada, cerrando el ciclo de no conformidad.`
    },

    // --- EMPRESAS Y LEGAJO TÉCNICO ---
    {
        id: 'legajo_tecnico',
        sectionId: 'gestion',
        keywords: ['legajo', 'legajo tecnico', 'documentacion', 'protocolos', 'res 900', 'res 84', 'res 85', 'habilitacion'],
        answer: `¿Qué documentos debe tener el Legajo Técnico de HyS?

El Legajo Técnico es la carpeta legal obligatoria que debe poseer todo establecimiento:
• Habilitación municipal y croquis con plano de evacuación y roles de emergencia.
• Organigrama del Servicio de Higiene y Seguridad con asignación de horas profesionales.
• Planillas de entrega de EPP firmadas por cada operario (Resolución SRT 299/11).
• Constancias de capacitación periódica del personal con temario y firmas.
• Protocolos de medición oficiales: Puesta a Tierra (Res. 900/15), Iluminación (Res. 84/12) y Ruido (Res. 85/12).
• Registro de mantenimiento y recarga de extintores (tarjetas y prueba hidráulica).
• Simulacros de evacuación anuales con informe de tiempos.`
    },
    {
        id: 'horas_profesional',
        sectionId: 'gestion',
        keywords: ['horas', 'horas profesional', 'asignacion de horas', 'licenciado', 'tecnico', 'cuantas horas', 'profesional hys'],
        answer: `¿Cuántas horas de profesional exige la ley por empresa?

Depende de la categoría del establecimiento y cantidad de trabajadores (Decreto 351/79 Cap. 4 o Decreto 911/96):
• Se calculan según el número de trabajadores equivalentes y el nivel de riesgo de la actividad (código CIIU).
• Van desde asignaciones mensuales mínimas (ejemplo: 4 horas semanales en pequeños talleres o comercios) hasta presencia permanente con supervisión continua en obras de construcción de gran porte o plantas químicas complejas.`
    },
    {
        id: 'programa_seguridad',
        sectionId: 'gestion',
        keywords: ['programa de seguridad', 'programa', 'art', 'res 51', 'res 35', 'res 319', 'inicio de obra'],
        answer: `¿Cuándo se exige Programa de Seguridad con aval de ART?

En la industria de la construcción (Resoluciones SRT 51/97, 35/98 y 319/99):
• Obligatorio si hay: Excavaciones, demoliciones, trabajos en altura a más de 4 metros, o si la obra supera los 1000 m² cubiertos.
• Presentación: Debe ser redactado y firmado por el profesional de HyS y presentado a la ART con al menos 5 días hábiles de anticipación al inicio de obra para su aprobación formal.`
    },
    {
        id: 'contratistas_sub',
        sectionId: 'gestion',
        keywords: ['contratista', 'contratistas', 'subcontratista', 'clausula de no repeticion', 'terceros', 'ingreso a planta'],
        answer: `¿Qué documentación exigir a contratistas y terceros?

Antes de permitir el ingreso a trabajar en el establecimiento u obra:
• Constancia de ART: Nómina con Cláusula de No Repetición a favor de la empresa cliente emitida por su aseguradora.
• Planilla de EPP: Constancia de entrega de EPP específicos para la labor (Resolución SRT 299/11).
• Apto médico: Examen médico periódico laboral vigente.
• Inspección de equipos: Verificación de herramientas eléctricas, andamios tubulares normalizados y arneses con fecha vigente.`
    },

    // --- F.A.Q. Y TRABAJO EN CAMPO ---
    {
        id: 'modo_offline',
        sectionId: 'faq_campo',
        keywords: ['offline', 'sin internet', 'sin senal', 'sin conexion', 'desconectado', 'fabrica', 'galpon'],
        answer: `¿Se puede usar la app si no hay señal en la fábrica?

Sí. La plataforma está optimizada para trabajo en campo e inspección móvil:
• Puedes ir completando el checklist, seleccionando opciones de cumplimiento y redactando observaciones mientras recorres la nave industrial.
• Las fotos y firmas se procesan localmente en tu teléfono.
• Al volver a tener señal 4G o WiFi, se sincronizan los cambios y puedes descargar el informe final definitivo.`
    },
    {
        id: 'validez_qr',
        sectionId: 'faq_campo',
        keywords: ['validez qr', 'validez legal', 'autenticidad', 'token', 'escanear qr', 'adulteracion', 'seguridad qr'],
        answer: `¿Por qué el código QR garantiza validez legal?

Cada informe emitido genera un token criptográfico único en la base de datos de HyS Control:
• Si alguien intentara falsificar o adulterar el archivo PDF impreso o digital, cualquier cliente, inspector o autoridad pública puede escanear el QR con la cámara del celular.
• El QR redirige a la página pública oficial de validación (/verify/{token}), donde se muestra el acta original inalterable con las firmas y fecha exacta.`
    },
    {
        id: 'fotos_periciales',
        sectionId: 'faq_campo',
        keywords: ['fotos periciales', 'fotos claras', 'evidencia fotografica', 'consejos fotos', 'iluminacion foto', 'sacar foto'],
        answer: `Consejos para tomar fotos periciales claras

Para que una foto sirva como prueba técnica irrefutable:
1. Foto de contexto (plano general): Muestra el sector completo para ubicar en qué parte de la planta se encuentra el desvío.
2. Foto de detalle (primer plano): Muestra el peligro puntual nítido (ejemplo: cable pelado, traba de seguridad rota, falta de puesta a tierra).
3. Buena iluminación: Activa el flash del teléfono si el área es oscura y evita tomas a contraluz o movidas.`
    },
    {
        id: 'negativa_firma',
        sectionId: 'faq_campo',
        keywords: ['negativa', 'no quiere firmar', 'rechaza firma', 'no firma', 'acta sin firma', 'se niega'],
        answer: `¿Qué hacer si el responsable no quiere firmar el acta?

Si el encargado o propietario se niega a estampar su firma digital:
1. Mantener la calma y no confrontar.
2. Dejar constancia expresa en las Observaciones: "Se deja constancia que el Sr. [Nombre/Cargo] toma conocimiento de las observaciones formuladas pero se niega a suscribir la presente acta".
3. El inspector firma de manera unilateral.
4. Se remite copia formal vía correo electrónico institucional o carta documento con acuse de recibo.`
    }
];

// Función para renderizar texto limpio de asteriscos y emojis con formato ordenado
function renderCleanMessageText(text) {
    if (!text) return null;
    // Eliminación de cualquier emoji y cualquier asterisco **
    const clean = text
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
        .replace(/\*\*/g, '');

    const lines = clean.split('\n');
    return (
        <div className="space-y-1">
            {lines.map((line, idx) => {
                if (!line.trim()) {
                    return <div key={idx} className="h-1.5" />;
                }
                const isHeading = idx === 0 && !line.startsWith('•') && !line.startsWith('-') && !line.match(/^\d+\./);
                if (isHeading) {
                    return (
                        <div key={idx} className="font-bold text-slate-900 pb-1 mb-1 border-b border-slate-100">
                            {line}
                        </div>
                    );
                }
                return (
                    <p key={idx} className="leading-relaxed">
                        {line}
                    </p>
                );
            })}
        </div>
    );
}

export default function HySHelpAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('manual');
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            type: 'welcome',
            text: 'Hola, Inspector/a. Soy el Asistente de HyS Control.\n\nPuedes navegar por las secciones temáticas arriba o seleccionar una pregunta de la lista:',
            sectionId: 'manual',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen, messages, isTyping]);

    const getSection = (secId) => {
        return SECTIONS.find(s => s.id === secId) || SECTIONS[0];
    };

    const findAnswer = (query) => {
        const cleanQuery = query.toLowerCase().trim();

        // 1. Coincidencia exacta por ID de conocimiento
        const byId = KNOWLEDGE_BASE.find(item => item.id === cleanQuery);
        if (byId) return { answer: byId.answer, sectionId: byId.sectionId };

        // 2. Coincidencia directa por keywords
        for (const item of KNOWLEDGE_BASE) {
            if (item.keywords.some(k => cleanQuery.includes(k))) {
                return { answer: item.answer, sectionId: item.sectionId };
            }
        }

        // 3. Coincidencia por palabras clave
        const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);
        let bestMatch = null;
        let bestSection = null;
        let maxMatches = 0;

        for (const item of KNOWLEDGE_BASE) {
            let matches = 0;
            const fullText = (item.keywords.join(' ') + ' ' + item.answer).toLowerCase();
            queryWords.forEach(word => {
                if (fullText.includes(word)) matches++;
            });

            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = item.answer;
                bestSection = item.sectionId;
            }
        }

        if (maxMatches >= 1 && bestMatch) {
            return { answer: bestMatch, sectionId: bestSection };
        }

        return {
            answer: `No se encontró una explicación exacta para "${query}".\n\nPuedes seleccionar una de las secciones arriba o tocar una pregunta de la lista.`,
            sectionId: activeSection
        };
    };

    const handleSwitchSection = (sectionId) => {
        setActiveSection(sectionId);
        const sec = getSection(sectionId);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages(prev => [...prev, {
            sender: 'bot',
            text: `Sección: ${sec.title}\n${sec.desc}:`,
            sectionId: sectionId,
            timestamp: timeStr
        }]);
    };

    const handleSelectQuestion = (questionId, questionTitle, sectionId) => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages(prev => [...prev, {
            sender: 'user',
            text: questionTitle,
            timestamp: timeStr
        }]);

        setIsTyping(true);

        setTimeout(() => {
            const result = findAnswer(questionId);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: result.answer,
                currentSectionId: result.sectionId || sectionId || activeSection,
                showMenuButtons: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 180);
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        const text = inputText.trim();
        if (!text) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages(prev => [...prev, {
            sender: 'user',
            text: text,
            timestamp: timeStr
        }]);

        setInputText('');
        setIsTyping(true);

        setTimeout(() => {
            const result = findAnswer(text);
            if (result.sectionId) {
                setActiveSection(result.sectionId);
            }
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: result.answer,
                currentSectionId: result.sectionId || activeSection,
                showMenuButtons: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 220);
    };

    const handleShowSectionQuestions = (sectionId) => {
        const sec = getSection(sectionId);
        setMessages(prev => [...prev, {
            sender: 'bot',
            text: `Preguntas de ${sec.title}:`,
            sectionId: sectionId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const handleShowAllSections = () => {
        setMessages(prev => [...prev, {
            sender: 'bot',
            text: 'Secciones Disponibles del Asistente:\nSelecciona la temática que deseas consultar:',
            showSectionsList: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const handleResetChat = () => {
        setActiveSection('manual');
        setMessages([
            {
                sender: 'bot',
                type: 'welcome',
                text: 'Conversación reiniciada. Selecciona una sección o haz tu consulta:',
                sectionId: 'manual',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 font-sans print:hidden">
            {/* Botón flotante para abrir el asistente */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 border border-blue-400/40 cursor-pointer"
                    title="Abrir Asistente de Ayuda de HyS"
                >
                    <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left hidden sm:block">
                        <div className="text-xs font-bold tracking-wide leading-tight">Guía y Manual HyS</div>
                        <div className="text-[10px] text-blue-100 font-medium">Manual, Leyes y Riesgos</div>
                    </div>
                </button>
            )}

            {/* Ventana de chat desplegable */}
            {isOpen && (
                <div className="w-[94vw] sm:w-[460px] h-[600px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800 animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-indigo-800/40">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center shadow-inner">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
                                    <span>Asistente HyS Control</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                                        Activo
                                    </span>
                                </h3>
                                <p className="text-[10px] text-slate-300 leading-tight">
                                    Manual del sistema, normativas y campo
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleResetChat}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                title="Reiniciar conversación"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                title="Minimizar ventana"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
                                title="Cerrar ventana"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Barra superior de Secciones (Pestañas limpias sin emojis) */}
                    <div className="bg-slate-100/90 border-b border-slate-200 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-thin shrink-0 shadow-inner">
                        {SECTIONS.map((sec) => {
                            const isActive = activeSection === sec.id;
                            return (
                                <button
                                    key={sec.id}
                                    onClick={() => handleSwitchSection(sec.id)}
                                    className={`whitespace-nowrap px-3 py-1 rounded-xl text-[11px] font-bold transition shrink-0 cursor-pointer ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300'
                                    }`}
                                >
                                    {sec.shortTitle}
                                </button>
                            );
                        })}
                    </div>

                    {/* Mensajes y cuerpo de conversación */}
                    <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs text-slate-700">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} w-full`}
                            >
                                <div
                                    className={`p-3.5 rounded-2xl shadow-sm leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'max-w-[88%] bg-blue-600 text-white font-medium self-end'
                                            : 'w-full bg-white text-slate-800 border border-slate-200/80'
                                    }`}
                                >
                                    {renderCleanMessageText(msg.text)}

                                    {/* Lista de preguntas vertical (una debajo de la otra, sin emojis) */}
                                    {msg.sectionId && (
                                        <div className="mt-3 p-2 bg-slate-100/90 border border-slate-200/90 rounded-2xl w-full space-y-1.5 shadow-inner">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 pt-0.5 flex items-center justify-between">
                                                <span>Seleccione una pregunta para ver la respuesta:</span>
                                                <span className="text-[9px] text-blue-600 font-mono font-bold">
                                                    {getSection(msg.sectionId)?.badge}
                                                </span>
                                            </div>
                                            {getSection(msg.sectionId)?.questions.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleSelectQuestion(item.id, item.title, msg.sectionId)}
                                                    className="w-full text-left px-3 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-800 hover:text-blue-700 font-medium text-xs transition flex items-center justify-between shadow-xs group cursor-pointer"
                                                >
                                                    <span className="leading-tight pr-2">{item.title}</span>
                                                    <span className="text-slate-300 group-hover:text-blue-600 font-bold transition text-xs shrink-0">
                                                        ➔
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Menú vertical de todas las secciones */}
                                    {msg.showSectionsList && (
                                        <div className="mt-3 p-2 bg-slate-100/90 border border-slate-200 rounded-2xl w-full space-y-1.5 shadow-inner">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 pt-0.5">
                                                Selecciona una sección temática:
                                            </div>
                                            {SECTIONS.map((sec) => (
                                                <button
                                                    key={sec.id}
                                                    onClick={() => handleSwitchSection(sec.id)}
                                                    className="w-full text-left p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition flex items-center justify-between shadow-xs group cursor-pointer"
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-800 group-hover:text-blue-700 text-xs">{sec.title}</div>
                                                        <div className="text-[10px] text-slate-500">{sec.desc}</div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                                                            {sec.badge}
                                                        </span>
                                                        <span className="text-slate-300 group-hover:text-blue-600 font-bold text-xs">➔</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Botones de navegación contextual (sin emojis) */}
                                    {msg.showMenuButtons && (
                                        <div className="pt-2.5 mt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                            <button
                                                onClick={() => handleShowSectionQuestions(msg.currentSectionId || activeSection)}
                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                                            >
                                                Preguntas de esta sección
                                            </button>
                                            <button
                                                onClick={handleShowAllSections}
                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                                            >
                                                Ver todas las secciones
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                                    {msg.timestamp}
                                </span>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-2xl w-24 shadow-xs">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Barra de entrada de texto */}
                    <form
                        onSubmit={handleSendMessage}
                        className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Escribe un tema o botón (ej: decreto 911, fotos, epp, firma)..."
                            className="flex-1 pl-3 pr-2 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition shrink-0 cursor-pointer"
                            title="Enviar consulta"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
