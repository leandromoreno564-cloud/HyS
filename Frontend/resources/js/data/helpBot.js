/**
 * Contenido del asistente "codeado" (sin IA).
 *
 * Para agregar o cambiar respuestas editá solo este archivo:
 *  - label:    texto del botón rápido.
 *  - keywords: palabras que activan la respuesta cuando alguien escribe (en minúscula y SIN tildes).
 *  - text:     respuesta. Párrafos separados por línea en blanco; las líneas que empiezan con "• " son viñetas.
 *  - image:    imagen opcional (carpeta Backent/public/images/bot/). caption: pie de la imagen.
 *  - next:     botones que se ofrecen después (ids de otros nodos).
 *  - go:       botones que llevan a una pantalla: { label, href } (external: true abre en otra pestaña).
 *  - guide:    guía paso a paso: lista de { text, image?, go? }; el asistente ofrece "Siguiente paso".
 *  - admin:    true = solo para administradores.
 */
const IMG = '/images/bot/';

export const NODES = {
    inicio: {
        text: 'Soy el asistente de HyS. Elegí un tema o escribime tu consulta con tus palabras, por ejemplo: "cómo subo fotos" o "qué hago ante un incendio".',
    },
    menu: { text: 'Estos son los temas disponibles:' },

    empezar: {
        label: 'Primeros pasos',
        keywords: ['primeros pasos', 'empezar', 'comenzar', 'menu', 'inicio', 'modulos', 'por donde empiezo'],
        text: 'Para empezar: ingresás con tus credenciales, llegás al panel principal y desde el menú lateral accedés a cada módulo:',
        image: IMG + 'menu-lateral.svg',
        caption: 'Menú lateral del sistema',
        next: ['ingreso', 'panel', 'empresas', 'cuenta'],
        go: [{ label: 'Ir al panel', href: '/dashboard' }],
    },
    ingreso: {
        label: 'Ingresar al sistema',
        keywords: ['ingresar', 'entrar', 'iniciar sesion', 'login', 'registrarme', 'registro', 'cuenta nueva', 'crear cuenta', 'no tengo cuenta'],
        text: 'Para entrar usá "Iniciar sesión" en la portada e ingresá tus credenciales.\n\nSi sos Licenciado/a y todavía no tenés cuenta, registrate desde la pantalla de ingreso: un administrador debe aprobarla antes de que puedas entrar. Si olvidaste tu contraseña, consultá con un administrador.',
        image: IMG + 'login.svg',
        caption: 'Portada e ingreso',
        next: ['panel', 'cuenta'],
    },
    panel: {
        label: 'El panel principal',
        keywords: ['panel', 'dashboard', 'tarjetas', 'graficos', 'grafico', 'resumen', 'pantalla principal'],
        text: 'El panel muestra un resumen: empresas registradas, total de inspecciones, medidas pendientes (con cuántas están vencidas) y el cuerpo técnico. Abajo hay gráficos con la evolución mensual de inspecciones y su estado.',
        image: IMG + 'panel.svg',
        caption: 'Panel de Control General',
        next: ['empresas', 'medidas'],
        go: [{ label: 'Ir al panel', href: '/dashboard' }],
    },
    empresas: {
        label: 'Empresas',
        keywords: ['empresa', 'empresas', 'establecimiento', 'establecimientos', 'alta', 'registrar empresa', 'nueva empresa', 'editar empresa', 'asignar', 'restaurar'],
        text: 'En Empresas ves el listado de establecimientos. Para sumar uno tocá "Registrar Empresa", completá los datos y guardá.\n\n• Podés autocompletar el formulario subiendo un PDF o un Word.\n• Desde cada empresa editás sus datos y entrás a su relevamiento.\n• Los administradores asignan licenciados a cada establecimiento y restauran empresas eliminadas.',
        image: IMG + 'empresa-alta.svg',
        caption: 'Formulario para registrar una empresa',
        next: ['importar', 'relevamiento'],
        go: [
            { label: 'Ir a Empresas', href: '/companies' },
            { label: 'Registrar una empresa', href: '/companies/create' },
        ],
    },
    relevamiento: {
        label: 'Relevamiento (checklist)',
        keywords: ['relevamiento', 'checklist', 'lista de verificacion', 'control', 'items', 'item', 'categoria', 'categorias', 'guardar relevamiento', 'inspeccion', 'inspecciones'],
        text: 'Cada empresa tiene un relevamiento: una lista de verificación organizada por categorías.\n\n• Elegí el estado de cada ítem: Sí, No o No aplica.\n• Sumá observaciones y hasta 2 fotos por ítem.\n• Podés agregar ítems o categorías nuevas.\n• Todos los ítems deben tener una opción tildada para poder guardar.\n• Si un ítem queda en "No", se pide la recomendación del técnico y las fechas de recomendación y de regulación.\n• Al terminar tocá "Guardar Relevamiento" (reemplaza el anterior de esa empresa).\n• También podés descargarlo en PDF.',
        image: IMG + 'relevamiento.svg',
        caption: 'Así se completa cada ítem del relevamiento',
        next: ['fotos', 'estados', 'seguimiento', 'importar'],
    },
    fotos: {
        label: 'Cómo subir fotos',
        keywords: ['foto', 'fotos', 'imagen', 'imagenes', 'evidencia', 'evidencias', 'camara', 'subir foto', 'agregar foto'],
        text: 'Cada ítem del relevamiento admite hasta 2 fotos como evidencia. Tocá "Agregar foto", elegí la imagen y listo: se suben cuando guardás el relevamiento.\n\nConsejos: buena luz, el punto observado bien a la vista y archivos livianos. Si te equivocás, reemplazá o quitá la foto antes de guardar.',
        next: ['relevamiento', 'estados'],
    },
    estados: {
        label: 'Sí / No / No aplica',
        keywords: ['estado', 'estados', 'si no', 'no aplica', 'n/a', 'na', 'respuesta', 'respuestas', 'marcar'],
        text: 'Estados de cada ítem:\n• Sí: se cumple.\n• No: no se cumple; se pide la recomendación del técnico y las fechas de recomendación y de regulación.\n• No aplica: no corresponde a este establecimiento.',
        next: ['medidas', 'relevamiento'],
    },
    seguimiento: {
        label: 'Ítems en "No": recomendación y fechas',
        keywords: ['recomendacion', 'recomendaciones', 'regulacion', 'fecha de regulacion', 'fecha de recomendacion', 'seguimiento', 'acuerdo', 'de palabra', 'dueno', 'plazo'],
        text: 'Cuando un ítem queda en "No" aparece un recuadro de seguimiento:\n• Recomendación del técnico.\n• Fecha de recomendación (por defecto, hoy).\n• Fecha de regulación: como máximo 1 año después de la recomendación.\n• Casilla "Acordado de palabra con el dueño".\n\nLa fecha de regulación se agrega sola al calendario como "HyS en el Trabajo" y todo se imprime en el PDF del relevamiento.',
        image: IMG + 'seguimiento-no.svg',
        caption: 'Seguimiento de un ítem en "No"',
        next: ['calendario', 'pdf'],
    },
    pdf: {
        label: 'Descargar el relevamiento en PDF',
        keywords: ['descargar pdf', 'bajar pdf', 'imprimir', 'imprimo', 'pdf del relevamiento', 'sacar pdf', 'generar pdf'],
        text: 'Desde el relevamiento guardado de una empresa podés descargar un PDF. Se imprime todo el formulario: categorías, preguntas, estado, normativa, observaciones y fotos; los ítems en "No" muestran además la recomendación del técnico, las fechas y si fue acordado con el dueño.\n\nAntes de descargarlo, verificá que hayas guardado los últimos cambios.',
        image: IMG + 'pdf-descarga.svg',
        caption: 'Descarga del relevamiento en PDF',
        next: ['seguimiento', 'relevamiento'],
    },
    importar: {
        label: 'Importar PDF o Word',
        keywords: ['pdf', 'word', 'docx', 'importar', 'escanear', 'escaner', 'extraer', 'autocompletar', 'cargar archivo', 'subir archivo', 'archivo', 'odt', 'txt', 'documento'],
        text: 'Podés cargar un PDF o un documento Word (.docx, también .odt y .txt) y el sistema lo escanea:\n\n• Detecta preguntas, categorías y títulos, aunque no tengan numeración.\n• Rescata las respuestas ya cargadas (casillas marcadas, Sí/No, comentarios).\n• Extrae las imágenes y las pone como fotos del ítem.\n\nTodo entra como borrador: revisalo, corregilo y recién ahí guardá. Un PDF que es solo una imagen escaneada no tiene texto para leer.',
        image: IMG + 'importar-archivo.svg',
        caption: 'Del archivo al borrador del relevamiento',
        next: ['relevamiento', 'empresas'],
    },
    medidas: {
        label: 'Medidas correctivas',
        keywords: ['medida', 'medidas', 'correctiva', 'correctivas', 'vencida', 'vencidas', 'vencimiento', 'pendiente', 'pendientes', 'accion', 'acciones'],
        text: 'Las medidas correctivas son las acciones para resolver los desvíos que detectás. En el módulo ves el listado con el estado de cada una y lo actualizás a medida que avanzan.\n\nMirá los vencimientos: las medidas vencidas se destacan en el panel principal.',
        image: IMG + 'medidas.svg',
        caption: 'Listado de medidas correctivas',
        next: ['estados', 'calendario'],
        go: [{ label: 'Ir a Medidas Correctivas', href: '/corrective-measures' }],
    },
    calendario: {
        label: 'Calendario',
        keywords: ['calendario', 'actividad', 'actividades', 'agenda', 'programar', 'visita', 'visitas', 'seguimiento', 'recordatorio'],
        text: 'El calendario muestra las actividades programadas. Todos pueden verlas y marcarlas como completadas; los administradores crean actividades con "Nueva actividad", las asignan a un licenciado y pueden editarlas o eliminarlas.',
        image: IMG + 'calendario.svg',
        caption: 'Calendario de actividades',
        go: [{ label: 'Ir al Calendario', href: '/calendar' }],
    },
    notificaciones: {
        label: 'Notificaciones',
        keywords: ['notificacion', 'notificaciones', 'campana', 'aviso', 'avisos'],
        text: 'La campana de la parte superior te avisa cuando hay novedades, por ejemplo una actividad asignada. Tocala para ver el listado y marcá una o todas como leídas.',
        image: IMG + 'notificaciones.svg',
        caption: 'Notificaciones',
        go: [{ label: 'Ver notificaciones', href: '/notifications' }],
    },
    cuenta: {
        label: 'Mi perfil y cerrar sesión',
        keywords: ['perfil', 'contrasena', 'clave', 'password', 'cerrar sesion', 'salir', 'logout', 'mi cuenta', 'datos personales', 'cambiar contrasena'],
        text: 'Tocá tu nombre arriba a la derecha: ahí están "Mi perfil" (tus datos personales y la contraseña) y "Cerrar sesión". Cerrá sesión siempre al terminar, sobre todo en computadoras compartidas.',
        image: IMG + 'perfil-sesion.svg',
        caption: 'Menú de usuario',
        go: [{ label: 'Ir a Mi perfil', href: '/profile' }],
    },
    exportar: {
        label: 'Exportar a Excel',
        keywords: ['exportar', 'excel', 'csv', 'descargar datos', 'reporte', 'reportes', 'planilla', 'exportacion'],
        text: 'En el menú lateral, sección Exportación, el botón "Exportar a Excel (CSV)" descarga un archivo con la información del sistema para analizarla en Excel o en cualquier planilla de cálculo.',
        image: IMG + 'exportar.svg',
        caption: 'Exportación a Excel',
    },
    usuarios: {
        label: 'Usuarios y técnicos',
        admin: true,
        keywords: ['usuario', 'usuarios', 'tecnico', 'tecnicos', 'licenciado', 'licenciados', 'aprobar', 'activar', 'desactivar', 'rol', 'inspector', 'inspectores'],
        text: 'En Usuarios & Técnicos (solo administradores) registrás usuarios, editás sus datos, activás o desactivás cuentas y asignás empresas a cada licenciado. Una cuenta desactivada no puede ingresar, pero conserva su historial.',
        image: IMG + 'usuarios.svg',
        caption: 'Usuarios y técnicos',
        go: [{ label: 'Ir a Usuarios', href: '/users' }],
    },
    portada: {
        label: 'Editar la portada',
        admin: true,
        keywords: ['portada', 'pagina de inicio', 'editar portada', 'modo edicion', 'textos de la portada'],
        text: 'Entrá a la portada desde "Portada (editar)" en el menú lateral y activá "Modo edición": podés agregar, editar, ocultar, reordenar y borrar elementos, mover secciones enteras y cambiar textos y fondo desde "Textos y portada".',
        image: IMG + 'portada-edicion.svg',
        caption: 'Modo edición de la portada',
        go: [{ label: 'Abrir la portada', href: '/' }],
    },

    asistente: {
        label: 'Cómo usar este asistente',
        keywords: ['asistente', 'bot', 'chat', 'quien sos', 'que haces', 'como funciona el asistente', 'para que sirves'],
        text: 'Soy el Asistente HyS. Podés:\n• Elegir un tema con los botones.\n• Escribir tu duda con tus palabras y te respondo con texto e imágenes.\n• Pedirme una guía paso a paso para una tarea.\n• Descargar el manual de usuario completo en PDF.\n\nSegún la pantalla en la que estés, te sugiero los temas más útiles.',
        image: IMG + 'asistente.svg',
        caption: 'El Asistente HyS',
        next: ['guias', 'manual'],
    },
    manual: {
        label: 'Manual de usuario',
        keywords: ['manual', 'manual de usuario', 'documentacion', 'instructivo', 'guia de uso', 'manual pdf', 'descargar manual'],
        text: 'El manual de usuario completo (26 páginas, con imágenes) explica cada pantalla paso a paso: ingreso, panel, empresas, relevamientos, seguimiento de ítems en "No", PDF, medidas, calendario, administración y una guía rápida de seguridad e higiene.\n\nPodés descargarlo, verlo en la sección Ayuda de la portada o recorrer sus capítulos desde acá:',
        next: ['ingreso', 'panel', 'empresas', 'relevamiento', 'seguimiento', 'pdf', 'medidas', 'calendario', 'notificaciones', 'cuenta', 'exportar', 'usuarios', 'portada', 'seguridad', 'problemas'],
        go: [
            { label: 'Descargar el manual (PDF)', href: '/manual/Manual-de-usuario-HyS.pdf', external: true },
            { label: 'Verlo en la portada', href: '/#ayuda' },
        ],
    },

    guias: {
        label: 'Guías paso a paso',
        keywords: ['guia', 'guias', 'paso a paso', 'tutorial', 'ensenar', 'ensename', 'ayudame', 'quiero aprender'],
        text: 'Elegí la tarea y te acompaño paso a paso, con imágenes:',
        next: ['guia_empresa', 'guia_relevamiento', 'guia_importar', 'guia_seguimiento', 'guia_pdf', 'guia_calendario'],
    },
    guia_empresa: {
        label: 'Guía: registrar una empresa',
        keywords: ['registrar una empresa', 'dar de alta una empresa', 'agregar empresa', 'cargar una empresa', 'nueva empresa'],
        guide: [
            { text: 'Entrá a Empresas desde el menú lateral.', image: IMG + 'menu-lateral.svg', go: [{ label: 'Ir a Empresas', href: '/companies' }] },
            { text: 'Tocá "Registrar Empresa" (arriba a la derecha).', go: [{ label: 'Abrir el formulario', href: '/companies/create' }] },
            { text: 'Si tenés un PDF o un Word con los datos, arrastralo al recuadro azul: el sistema completa lo que reconoce. Revisá siempre los datos detectados.', image: IMG + 'empresa-alta.svg' },
            { text: 'Completá o corregí los datos y tocá "Guardar". Después, desde la empresa, entrás a su relevamiento.' },
        ],
    },
    guia_relevamiento: {
        label: 'Guía: completar un relevamiento',
        keywords: ['completar un relevamiento', 'completar relevamiento', 'hacer un relevamiento', 'hacer relevamiento', 'como completo'],
        guide: [
            { text: 'Entrá a Empresas, abrí la empresa y entrá a su relevamiento.', go: [{ label: 'Ir a Empresas', href: '/companies' }] },
            { text: 'Elegí el estado de cada ítem: Sí, No o No aplica. Todos los ítems deben quedar con una opción tildada.', image: IMG + 'relevamiento.svg' },
            { text: 'Si un ítem queda en "No", completá la recomendación del técnico, la fecha de recomendación y la fecha de regulación (como máximo 1 año).', image: IMG + 'seguimiento-no.svg' },
            { text: 'Agregá hasta 2 fotos por ítem como evidencia y una observación si hace falta. Podés agregar ítems o categorías nuevas.' },
            { text: 'Tocá "Guardar Relevamiento". Si falta algún ítem, el sistema te avisa cuáles y los marca en rojo. Ojo: guardar reemplaza el relevamiento anterior de esa empresa.' },
            { text: 'Listo. Desde el relevamiento guardado podés descargar el PDF con todo el formulario.', image: IMG + 'pdf-descarga.svg' },
        ],
    },
    guia_importar: {
        label: 'Guía: cargar un PDF o Word',
        keywords: ['cargar un pdf', 'subir un pdf', 'cargar un word', 'subir un word', 'importar un archivo', 'escanear un pdf'],
        guide: [
            { text: 'Entrá al alta de la empresa o a su relevamiento: ahí está el recuadro para cargar archivos.', go: [{ label: 'Registrar una empresa', href: '/companies/create' }] },
            { text: 'Arrastrá el archivo al recuadro, pegalo con Ctrl+V o tocá "Elegir archivo". Acepta PDF, Word (.docx), .odt y .txt.', image: IMG + 'importar-archivo.svg' },
            { text: 'Esperá unos segundos: el sistema detecta preguntas, categorías, respuestas ya cargadas y las fotos del documento.' },
            { text: 'Revisá el borrador: corregí lo que haga falta, borrá lo que sobre y completá los ítems sin estado.' },
            { text: 'Tocá "Guardar Relevamiento". Un PDF que es solo una imagen escaneada no tiene texto para leer; los .doc antiguos hay que guardarlos como .docx.' },
        ],
    },
    guia_seguimiento: {
        label: 'Guía: ítems en "No"',
        keywords: ['item en no', 'items en no', 'cargar el seguimiento', 'cargar recomendacion', 'cargar la regulacion'],
        guide: [
            { text: 'Marcá el ítem como "No". Aparece un recuadro de seguimiento debajo.', image: IMG + 'seguimiento-no.svg' },
            { text: 'Escribí la recomendación del técnico: qué debe corregirse y cómo.' },
            { text: 'Revisá la fecha de recomendación (por defecto, hoy) y elegí la fecha de regulación: puede ser como máximo 1 año después.' },
            { text: 'Si lo acordaste verbalmente con el dueño, tildá "Acordado de palabra con el dueño". Al guardar, la fecha se agrega al calendario como "HyS en el Trabajo".', go: [{ label: 'Ver el calendario', href: '/calendar' }] },
        ],
    },
    guia_pdf: {
        label: 'Guía: descargar el PDF',
        keywords: ['guia pdf', 'bajar el relevamiento', 'descargar el relevamiento'],
        guide: [
            { text: 'Guardá primero los últimos cambios del relevamiento.' },
            { text: 'Tocá "Descargar PDF" en el relevamiento de la empresa. Se imprime todo el formulario, con fotos y el seguimiento de los ítems en "No".', image: IMG + 'pdf-descarga.svg' },
        ],
    },
    guia_calendario: {
        label: 'Guía: programar una actividad',
        admin: true,
        keywords: ['programar una actividad', 'agendar', 'crear una actividad', 'nueva actividad'],
        guide: [
            { text: 'Entrá al Calendario desde el menú lateral.', go: [{ label: 'Ir al Calendario', href: '/calendar' }] },
            { text: 'Tocá "Nueva actividad", elegí el día y el tipo (inspección, visita, capacitación, seguimiento).', image: IMG + 'calendario.svg' },
            { text: 'Asignala a un licenciado y guardá. Todos pueden verla y marcarla como completada.' },
        ],
    },

    seguridad: {
        label: 'Seguridad e higiene',
        keywords: ['seguridad', 'higiene', 'prevencion', 'prevenir'],
        text: '¿Sobre qué querés saber?',
        next: ['epp', 'ciclo', 'emergencia', 'extintor', 'riesgos'],
    },
    epp: {
        label: 'Elementos de protección (EPP)',
        keywords: ['epp', 'proteccion personal', 'casco', 'guantes', 'anteojos', 'calzado', 'proteccion auditiva', 'elementos de proteccion'],
        text: 'Los EPP protegen una parte del cuerpo frente a un riesgo concreto. La empresa debe entregarlos sin costo, adecuados a la tarea y en buen estado; vos tenés que usarlos correctamente y avisar si se dañan.',
        image: IMG + 'epp.svg',
        caption: 'Elementos de protección personal',
        next: ['ciclo', 'riesgos'],
    },
    ciclo: {
        label: 'Ciclo de prevención',
        keywords: ['ciclo', 'identificar', 'evaluar', 'proteger', 'comunicar', 'metodo', 'pasos de prevencion'],
        text: 'La prevención sigue cuatro pasos que se repiten en cada tarea: identificar los peligros, evaluar el riesgo, proteger con medidas y elementos adecuados, y comunicar lo que detectes.',
        image: IMG + 'ciclo-prevencion.svg',
        caption: 'Ciclo de prevención',
        next: ['riesgos', 'epp'],
    },
    emergencia: {
        label: 'Qué hacer en una emergencia',
        keywords: ['emergencia', 'evacuar', 'evacuacion', 'accidente', 'incendio', '911', 'alarma', 'humo'],
        text: 'Ante una emergencia: mantené la calma, dá la alarma, llamá al 911, evacuá por las salidas señalizadas, andá al punto de reunión y después informá y registrá lo ocurrido. Si hay fuego o humo, no uses ascensores.',
        image: IMG + 'emergencia.svg',
        caption: 'Pasos ante una emergencia',
        next: ['extintor'],
    },
    extintor: {
        label: 'Cómo usar un matafuego',
        keywords: ['matafuego', 'matafuegos', 'extintor', 'extintores', 'apagar fuego', 'apagar'],
        text: 'Técnica para usar un matafuego: tirar el precinto, apuntar a la base del fuego, apretar la palanca y barrer de lado a lado. Verificá que sea el tipo adecuado para ese fuego y mantené una salida libre a tu espalda.',
        image: IMG + 'extintor.svg',
        caption: 'Uso del matafuego',
        next: ['emergencia'],
    },
    riesgos: {
        label: 'Tipos de riesgos',
        keywords: ['riesgos', 'peligros', 'peligro', 'fisicos', 'quimicos', 'biologicos', 'ergonomicos', 'psicosociales', 'mecanicos', 'electricos', 'caidas'],
        text: 'Los grupos de riesgos más comunes:\n• Físicos: ruido, vibraciones, temperaturas extremas, iluminación.\n• Químicos: gases, vapores, polvos y líquidos peligrosos.\n• Biológicos: virus, bacterias y hongos.\n• Ergonómicos: posturas forzadas, movimientos repetitivos, cargas.\n• Psicosociales: estrés, sobrecarga y violencia laboral.\n• Mecánicos: máquinas y herramientas.\n• Eléctricos: contactos y cables dañados.\n• Incendio y explosión.\n• Caídas de altura y a nivel.\n\nEn la portada, sección Riesgos, está el detalle de cada uno.',
        next: ['ciclo', 'epp'],
        go: [{ label: 'Ver Riesgos en la portada', href: '/#riesgos' }],
    },

    problemas: {
        label: 'Tengo un problema',
        keywords: ['problema', 'problemas', 'error', 'no puedo', 'no funciona', 'no anda', 'falla', 'no carga', 'no veo', 'no me deja'],
        text: 'Soluciones rápidas:\n• No puedo ingresar: revisá tus datos y que un administrador haya aprobado tu cuenta.\n• No veo una empresa: puede que todavía no te la hayan asignado.\n• Una foto no se sube: probá con una imagen más liviana.\n• La pantalla no se actualiza: recargá con Ctrl+F5.\n• El archivo no se lee: subí un PDF o .docx (no .doc) con texto seleccionable.',
        next: ['contacto'],
    },
    contacto: {
        label: 'Hablar con una persona',
        keywords: ['contacto', 'ayuda humana', 'administrador', 'soporte', 'hablar con alguien', 'ayuda'],
        text: 'Si no pude resolver tu duda, consultá con un administrador de la plataforma. También tenés el manual de usuario completo en la portada.',
        go: [{ label: 'Abrir el manual de ayuda', href: '/#ayuda' }],
    },

    saludo: {
        keywords: ['hola', 'buenas', 'buen dia', 'buenas tardes', 'buenas noches', 'hey'],
        text: '¡Hola! ¿En qué te puedo ayudar?',
        next: ['menu'],
    },
    gracias: {
        keywords: ['gracias', 'genial', 'perfecto', 'excelente', 'listo', 'barbaro'],
        text: '¡De nada! Si necesitás algo más, elegí un tema.',
        next: ['menu'],
    },
    chau: {
        keywords: ['chau', 'adios', 'hasta luego'],
        text: '¡Hasta luego! Acá voy a estar si me necesitás.',
    },
    soloAdmin: {
        text: 'Eso lo gestionan los administradores. Si lo necesitás, pedíselo a uno de ellos.',
        next: ['menu'],
    },
    noEntendi: {
        text: 'No encontré una respuesta para eso. Probá con otras palabras (por ejemplo: "fotos", "relevamiento", "matafuego") o elegí un tema:',
        next: ['menu'],
    },
};

/** Temas del menú principal (en este orden) */
export const MENU = ['empezar', 'guias', 'manual', 'empresas', 'relevamiento', 'importar', 'medidas', 'calendario', 'cuenta', 'seguridad', 'exportar', 'problemas'];
export const ADMIN_MENU = ['usuarios', 'portada'];

/** Sugerencias según la pantalla en la que está la persona */
export const CONTEXT = [
    [/Checklist$/, ['guia_relevamiento', 'seguimiento', 'fotos', 'pdf']],
    [/Companies\/Create$/, ['guia_empresa', 'guia_importar']],
    [/Companies\//, ['empresas', 'relevamiento']],
    [/Calendar/, ['calendario']],
    [/CorrectiveMeasures/, ['medidas', 'estados']],
    [/Users/, ['usuarios']],
    [/Notifications/, ['notificaciones']],
    [/Dashboard/, ['empezar', 'empresas', 'medidas']],
];

export const normalize = (s) =>
    String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9/ ]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

/** Busca la respuesta que mejor coincide con lo que escribió la persona */
export function findNode(input, isAdmin) {
    const q = ` ${normalize(input)} `;
    if (q.trim() === '') return null;

    let best = null;
    let bestScore = 0;
    for (const [id, node] of Object.entries(NODES)) {
        if (!node.keywords) continue;
        let score = 0;
        for (const kw of node.keywords) {
            if (q.includes(` ${kw} `)) score += kw.includes(' ') ? kw.split(' ').length * 2 + 1 : 2; // las frases pesan más
            else if (kw.length >= 5 && q.includes(` ${kw}`)) score += 1; // plurales y conjugaciones
        }
        if (score > bestScore) {
            bestScore = score;
            best = id;
        }
    }

    if (bestScore < 2) return null;
    if (NODES[best].admin && !isAdmin) return 'soloAdmin';
    return best;
}
