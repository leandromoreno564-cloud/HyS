import React, { useState, useRef, useEffect } from 'react';
import { 
    HelpCircle, 
    X, 
    Send, 
    Sparkles, 
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
    Search
} from 'lucide-react';

// Base de conocimiento interactiva sobre los botones y funciones de HyS Control
const KNOWLEDGE_BASE = [
    // --- BOTONES CLAVE ---
    {
        id: 'btn-extract-pdf',
        category: 'Botones',
        keywords: ['extraer pdf', 'subir pdf', 'importar pdf', 'boton pdf', 'cargar pdf', 'pdf checklist'],
        question: '¿Para qué sirve el botón "Extraer / Cargar PDF"?',
        answer: `📄 **Botón "Extraer / Cargar PDF":**
Sirve para importar automáticamente una lista de cotejo (checklist) desde un archivo PDF oficial que ya tengas escaneado o digitalizado.

• **Cómo funciona:** Subes el PDF y el sistema analiza el texto, reconociendo categorías y preguntas normativas.
• **Beneficio:** Evita tener que tipear a mano los 30 o 50 ítems del checklist uno por uno.
• **Ubicación:** Está disponible en la parte superior del Checklist de la Empresa.`
    },
    {
        id: 'btn-upload-photo',
        category: 'Botones',
        keywords: ['foto', 'fotos', 'evidencia', 'camara', 'adjuntar foto', 'subir foto', 'subir evidencia'],
        question: '¿Para qué sirve el botón de la Cámara / Subir Foto?',
        answer: `📸 **Botón de la Cámara / Evidencia Fotográfica:**
Sirve para documentar visualmente el peligro o hallazgo encontrado durante la inspección en la empresa.

• **Capacidad:** Puedes subir hasta **2 fotografías por ítem** del checklist.
• **Nivel de Gravedad:** Puedes clasificar el hallazgo como *Menor, Moderada, Mayor o Crítica*.
• **Visor Lightbox:** Al hacer clic sobre cualquier foto guardada, se abre en tamaño completo para ver los detalles técnicos.`
    },
    {
        id: 'btn-signature',
        category: 'Botones',
        keywords: ['firma', 'firmar', 'signature', 'pantalla tactil', 'canvas', 'firma digital', 'rubrica'],
        question: '¿Para qué sirve el botón "Firmar en Pantalla"?',
        answer: `✍️ **Botón "Firmar en Pantalla" (Canvas Digital):**
Abre un recuadro táctil interactivo para registrar las firmas manuscritas al finalizar la inspección.

• **Quiénes firman:** 
  1. El Inspector matriculado / alumno.
  2. El Representante o responsable del establecimiento inspeccionado.
• **En el celular:** Se puede firmar directamente con el dedo o con un lápiz táctil.
• **Botón Limpiar:** Si la firma salió desprolija, presionas "Limpiar" y se puede volver a trazar.`
    },
    {
        id: 'btn-download-pdf',
        category: 'Botones',
        keywords: ['descargar pdf', 'informe oficial', 'informe pdf', 'acta', 'qr', 'exportar pdf', 'verificar qr'],
        question: '¿Para qué sirve el botón "Descargar Informe PDF con QR"?',
        answer: `📄 **Botón "Descargar Informe Oficial en PDF":**
Emite el dictamen técnico formal definitivo de la inspección con validez institucional.

• **Contenido del PDF:** Membrete del IES Nuevo Horizonte, datos de la empresa, checklist con fotos en miniatura, medidas correctivas recomendadas y firmas digitales estampadas.
• **Verificación QR:** El documento incluye un código QR único que cualquier persona puede escanear con su celular para validar la autenticidad del acta en la web pública (\`/verify/{token}\`).`
    },
    {
        id: 'btn-add-measure',
        category: 'Botones',
        keywords: ['medida correctiva', 'agregar medida', 'plan de accion', 'plazo', 'responsable', 'costo'],
        question: '¿Para qué sirve el botón "Agregar Medida Correctiva"?',
        answer: `⚠️ **Botón "Agregar Medida Correctiva":**
Permite registrar una acción técnica obligatoria que la empresa debe realizar para solucionar un peligro detectado.

• **Campos requeridos:**
  - Descripción de la medida técnica a implementar.
  - Fecha límite de cumplimiento (plazo legal).
  - Responsable asignado (empresa o contratista).
  - Nivel de prioridad (*Baja, Media, Alta o Urgente*).
  - Estimación de costo aproximado (opcional).`
    },

    // --- SECCIÓN EMPRESAS ---
    {
        id: 'sec-companies-create',
        category: 'Empresas',
        keywords: ['crear empresa', 'nueva empresa', 'alta empresa', 'agregar empresa', 'registrar empresa'],
        question: '¿Cómo crear y dar de alta una nueva Empresa?',
        answer: `🏢 **Cómo crear una nueva Empresa:**
1. Ve al menú lateral izquierdo y haz clic en **"Empresas"**.
2. En la esquina superior derecha, toca el botón azul **"+ Nueva Empresa"**.
3. Completa los datos del establecimiento:
   • Razón Social (nombre oficial).
   • CUIT (identificación tributaria sin guiones).
   • Rubro / Sector Industrial (ej: Metalúrgica, Construcción, Comercio).
   • Cantidad de trabajadores equivalentes.
   • Dirección exacta del establecimiento y persona de contacto.
4. Presiona **"Guardar Empresa"** y quedará lista para inspeccionar.`
    },
    {
        id: 'sec-assign-inspector',
        category: 'Empresas',
        keywords: ['asignar inspector', 'inspector', 'asignar empresa', 'mis empresas'],
        question: '¿Cómo se asigna un inspector a una empresa?',
        answer: `👥 **Asignación de Inspectores:**
• El usuario con rol **Administrador** puede editar la empresa y seleccionar qué inspectores o alumnos tienen permiso para auditarla.
• Cuando un alumno ingresa con su cuenta de inspector, en la pantalla de Empresas verá únicamente los establecimientos que tiene asignados a su cargo.`
    },

    // --- CHECKLIST & INSPECCIONES ---
    {
        id: 'sec-checklist-status',
        category: 'Checklist',
        keywords: ['cumple', 'no cumple', 'no aplica', 'estados checklist', 'marcar checklist'],
        question: '¿Qué significan los estados Cumple, No Cumple y No Aplica?',
        answer: `📋 **Estados de cada ítem del Checklist:**
• ✅ **Cumple:** El establecimiento cumple con la normativa de seguridad de forma satisfactoria.
• ❌ **No Cumple:** Se detectó una irregularidad o riesgo. Se recomienda tomar fotos de evidencia y generar una medida correctiva.
• ⚪ **No Aplica:** La exigencia no corresponde a este tipo de actividad (ej: trabajo en altura en un local comercial de planta baja).

*La barra superior de la pantalla calcula automáticamente el porcentaje de avance hasta llegar al 100%.*`
    },
    {
        id: 'sec-edit-categories',
        category: 'Checklist',
        keywords: ['editar categoria', 'renombrar categoria', 'categorias checklist', 'agregar categoria'],
        question: '¿Cómo organizar o editar las categorías del Checklist?',
        answer: `🗂️ **Categorías del Checklist:**
Las preguntas están organizadas por temas normativos (ej: *Instalaciones Eléctricas, Protección contra Incendios, EPP, Iluminación y Color*).

• Puedes hacer clic en el botón de edición al lado del título de cualquier categoría para renombrarla o ajustarla a la realidad del establecimiento.`
    },

    // --- CALENDARIO & AGENDAS ---
    {
        id: 'sec-calendar',
        category: 'Calendario',
        keywords: ['calendario', 'agenda', 'visita', 'programar visita', 'fecha inspeccion', 'agendar'],
        question: '¿Cómo funciona la sección "Calendario & Agenda"?',
        answer: `📅 **Sección Calendario & Agenda:**
Permite planificar las visitas de campo para que los inspectores no se superpongan en el mismo día y horario.

• **Vista Mensual y Semanal:** Muestra las inspecciones programadas con etiquetas de colores según su estado (*Pendiente, En Proceso, Completada*).
• **Al tocar un día:** Puedes crear una nueva cita seleccionando la empresa, el inspector responsable y la hora programada.`
    },

    // --- ROLES & PERMISOS ---
    {
        id: 'sec-roles',
        category: 'Roles',
        keywords: ['rol', 'roles', 'admin', 'inspector', 'permisos', 'diferencia admin inspector'],
        question: '¿Qué diferencia hay entre el rol Administrador y el rol Inspector?',
        answer: `👤 **Roles del Sistema:**
• 👑 **Administrador (Docente / Coordinador):** Puede crear usuarios, aprobar cuentas de inspectores, dar de alta empresas, asignar tareas y ver el reporte global de todo el instituto.
• 🦺 **Inspector (Alumno / Licenciado):** Puede ver sus empresas asignadas, completar checklists de campo, capturar fotos de evidencia, registrar firmas y descargar informes en PDF.`
    }
];

// Temas destacados para los botones de acceso rápido
const QUICK_TOPICS = [
    { label: '🔘 ¿Para qué sirve extraer PDF?', query: 'extraer pdf' },
    { label: '📸 ¿Cómo subir fotos y evidencias?', query: 'subir foto' },
    { label: '✍️ ¿Cómo firmar en pantalla táctil?', query: 'firmar' },
    { label: '📄 ¿Cómo descargar informe con QR?', query: 'descargar pdf' },
    { label: '🏢 ¿Cómo crear una empresa?', query: 'crear empresa' },
    { label: '⚠️ ¿Cómo agregar medidas correctivas?', query: 'agregar medida' },
    { label: '📋 ¿Qué significa Cumple / No Cumple?', query: 'estados checklist' },
    { label: '📅 ¿Cómo usar el calendario?', query: 'calendario' }
];

export default function HySHelpAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: '¡Hola, Inspector/a! 👋 Soy tu **Asistente de Uso de HyS Control**.\n\n¿Tienes dudas sobre para qué sirve algún botón, cómo cargar una foto o cómo generar el informe? Toca una opción abajo o escribe tu consulta.',
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

    // Motor de búsqueda de respuestas por palabras clave
    const findAnswer = (query) => {
        const cleanQuery = query.toLowerCase().trim();

        // 1. Coincidencia directa por id o keywords exactas
        for (const item of KNOWLEDGE_BASE) {
            if (item.keywords.some(k => cleanQuery.includes(k))) {
                return item;
            }
        }

        // 2. Coincidencia por palabras individuales (token matching)
        const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);
        let bestMatch = null;
        let maxMatches = 0;

        for (const item of KNOWLEDGE_BASE) {
            let matches = 0;
            const fullText = (item.question + ' ' + item.keywords.join(' ') + ' ' + item.answer).toLowerCase();
            queryWords.forEach(word => {
                if (fullText.includes(word)) matches++;
            });

            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = item;
            }
        }

        if (maxMatches >= 1 && bestMatch) {
            return bestMatch;
        }

        return null;
    };

    const handleSendMessage = (textToSend = null) => {
        const text = (textToSend !== null ? textToSend : inputText).trim();
        if (!text) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Agregar mensaje del usuario
        setMessages(prev => [...prev, {
            sender: 'user',
            text: text,
            timestamp: timeStr
        }]);

        if (textToSend === null) setInputText('');
        setIsTyping(true);

        // Simular respuesta rápida natural
        setTimeout(() => {
            const match = findAnswer(text);
            let responseText = '';

            if (match) {
                responseText = match.answer;
            } else {
                responseText = `🤔 No encontré una explicación exacta para **"${text}"**.\n\nPuedes consultar sobre estos botones o funciones clave:\n• **"extraer pdf"** (para cargar el checklist automático)\n• **"foto"** o **"evidencia"** (para adjuntar fotos desde el celular)\n• **"firmar"** (para usar el canvas de firma en pantalla)\n• **"descargar pdf"** (para el informe con código QR)\n• **"crear empresa"** (para dar de alta un establecimiento)\n• **"medida correctiva"** (para plazos y planes de acción)\n\nO selecciona uno de los botones de ayuda rápida.`;
            }

            setMessages(prev => [...prev, {
                sender: 'bot',
                text: responseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 300);
    };

    const handleResetChat = () => {
        setMessages([
            {
                sender: 'bot',
                text: 'Conversación reiniciada. 🔄 ¿Sobre qué botón o función de la web deseas información?',
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
                    className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 border border-blue-400/40"
                    title="Abrir Asistente de Ayuda de la Web"
                >
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-blue-700 rounded-full animate-ping"></span>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-blue-700 rounded-full"></span>
                    </div>
                    <div className="text-left hidden sm:block">
                        <div className="text-xs font-black tracking-wide leading-tight">Guía del Sistema</div>
                        <div className="text-[10px] text-blue-100 font-medium">¿Para qué sirve cada botón?</div>
                    </div>
                </button>
            )}

            {/* Ventana de chat desplegable */}
            {isOpen && (
                <div className="w-[92vw] sm:w-[420px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0 border-b border-indigo-800/40">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center shadow-inner">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
                                    <span>Guía de Ayuda • HyS Control</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                                        En Vivo
                                    </span>
                                </h3>
                                <p className="text-[10px] text-slate-300 leading-tight">
                                    Aprende para qué sirve cada botón y pantalla
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleResetChat}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                title="Reiniciar chat"
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

                    {/* Mensajes y cuerpo de conversación */}
                    <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/70 text-xs text-slate-700">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[88%] p-3 rounded-2xl shadow-sm leading-relaxed whitespace-pre-line ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                                    {msg.timestamp}
                                </span>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-2xl w-24">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Accesos rápidos sugeridos */}
                    <div className="bg-white border-t border-slate-200 px-3 py-2 shrink-0">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Preguntas frecuentes sobre la web:</span>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                            {QUICK_TOPICS.map((topic, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(topic.query)}
                                    className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors border border-slate-200 hover:border-blue-300 shrink-0"
                                >
                                    {topic.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Barra de entrada de texto */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
                    >
                        <div className="relative flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Escribe un botón o duda (ej: extraer pdf, fotos)..."
                                className="w-full pl-3 pr-2 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-colors shrink-0"
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
