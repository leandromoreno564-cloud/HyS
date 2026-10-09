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
    Search,
    ListFilter
} from 'lucide-react';

// Menú vertical de preguntas destacadas solicitadas
const QUESTIONS_MENU = [
    { id: 'extraer pdf', icon: '🔘', title: '¿Para qué sirve cada botón del checklist?' },
    { id: 'subir foto', icon: '📸', title: '¿Cómo cargar fotos y evidencias desde el cel?' },
    { id: 'firmar', icon: '✍️', title: '¿Cómo funciona la firma digital en pantalla?' },
    { id: 'descargar pdf', icon: '📄', title: '¿Cómo descargar el informe final con QR?' },
    { id: 'crear empresa', icon: '🏢', title: '¿Cómo crear y asignar una nueva empresa?' },
    { id: 'calendario', icon: '📅', title: '¿Cómo usar la agenda y calendario de visitas?' },
    { id: 'agregar medida', icon: '⚠️', title: '¿Cómo agregar y seguir medidas correctivas?' }
];

// Base de conocimiento completa
const KNOWLEDGE_BASE = [
    {
        id: 'extraer pdf',
        keywords: ['extraer pdf', 'subir pdf', 'importar pdf', 'boton pdf', 'cargar pdf', 'pdf checklist', 'botones checklist', 'cada boton'],
        answer: `🔘 **¿Para qué sirve cada botón del Checklist?**

• 📄 **Botón "Extraer PDF":** Escanea un informe PDF oficial que subas y carga automáticamente todas las preguntas del checklist sin tener que escribirlas a mano.
• 📸 **Botón "Cámara / Foto":** Abre la cámara o galería para adjuntar hasta 2 fotos de evidencia del peligro encontrado.
• ✍️ **Botón "Firmar":** Abre la pantalla táctil para firmar el acta con el dedo junto al responsable de la empresa.
• 📄 **Botón "Descargar PDF":** Genera el dictamen técnico final con fotos, medidas y código QR de validación.`
    },
    {
        id: 'subir foto',
        keywords: ['foto', 'fotos', 'evidencia', 'camara', 'adjuntar foto', 'subir foto', 'subir evidencia', 'celular', 'cel'],
        answer: `📸 **¿Cómo cargar fotos y evidencias desde el celular?**

1. Al lado de cada ítem del checklist verás el botón con el ícono de la **Cámara**.
2. Al tocarlo, puedes sacar la foto en el momento en la empresa o elegir una de tu galería.
3. Puedes subir hasta **2 fotos por ítem**.
4. Selecciona el nivel de gravedad del peligro: *Menor, Moderada, Mayor o Crítica*.
5. Presiona **"Guardar Evidencia"**.

💡 *Si tocas la foto guardada, se abre en tamaño gigante (Lightbox) para revisar los detalles técnicos.*`
    },
    {
        id: 'firmar',
        keywords: ['firma', 'firmar', 'signature', 'pantalla tactil', 'canvas', 'firma digital', 'rubrica'],
        answer: `✍️ **¿Cómo funciona la firma digital en pantalla?**

Al finalizar la inspección en el establecimiento:
1. En la parte inferior del checklist verás el recuadro blanco de **Firma Digital**.
2. Puedes firmar directamente **con el dedo en la pantalla del celular** o con el mouse en la computadora.
3. Firman dos personas: el **Inspector/a** y el **Responsable de la empresa**.
4. Si la firma salió corrida o desprolija, presionas **"Limpiar"** y se puede volver a trazar.
5. Al guardar, las firmas quedan estampadas de forma inalterable en el informe oficial.`
    },
    {
        id: 'descargar pdf',
        keywords: ['descargar pdf', 'informe oficial', 'informe pdf', 'acta', 'qr', 'exportar pdf', 'verificar qr', 'informe final'],
        answer: `📄 **¿Cómo descargar el informe final con QR?**

1. Una vez completado el checklist y registradas las firmas, presiona el botón azul **"Descargar Informe PDF"**.
2. El sistema emite un documento formal con:
   • Membrete oficial del IES Nuevo Horizonte.
   • Datos completos de la empresa y fecha de inspección.
   • Las preguntas del checklist con sus fotos de evidencia en miniatura.
   • El plan de medidas correctivas recomendadas.
   • Las firmas manuscritas del inspector y la empresa.

📱 **Verificación QR:** En la esquina del documento hay un código QR que cualquier persona puede escanear con su celular para comprobar la autenticidad del acta en la web pública (\`/verify/{token}\`).`
    },
    {
        id: 'crear empresa',
        keywords: ['crear empresa', 'nueva empresa', 'alta empresa', 'agregar empresa', 'registrar empresa', 'asignar empresa'],
        answer: `🏢 **¿Cómo crear y asignar una nueva Empresa?**

1. En el menú lateral izquierdo, haz clic en **"Empresas"**.
2. Presiona el botón **"+ Nueva Empresa"** en la esquina superior.
3. Completa los datos obligatorios:
   • **Razón Social:** Nombre formal de la empresa.
   • **CUIT:** Número tributario de 11 dígitos sin guiones.
   • **Rubro:** Metalúrgica, Construcción, Comercio, Salud, etc.
   • **Cantidad de Empleados:** Para calcular exigencias de horas profesionales.
   • **Dirección y Contacto:** Teléfono y persona a cargo.
4. Presiona **"Guardar Empresa"**.

👥 *El Administrador puede asignar qué inspectores específicos auditarán cada empresa.*`
    },
    {
        id: 'calendario',
        keywords: ['calendario', 'agenda', 'visita', 'programar visita', 'fecha inspeccion', 'agendar'],
        answer: `📅 **¿Cómo usar la agenda y calendario de visitas?**

Sirve para organizar las fechas de inspección técnica en campo:
1. Entra a la sección **"Calendario & Agenda"** en el menú lateral.
2. Verás una vista mensual y semanal con las visitas programadas.
3. Toca cualquier día del calendario para **agendar una nueva visita**.
4. Elige la empresa, el inspector asignado, la fecha y el horario previsto.
5. Cada visita tiene etiquetas de colores según su estado: *Pendiente (amarillo), En Proceso (azul) o Completada (verde)*.`
    },
    {
        id: 'agregar medida',
        keywords: ['medida correctiva', 'agregar medida', 'plan de accion', 'plazo', 'responsable', 'costo', 'medidas'],
        answer: `⚠️ **¿Cómo agregar y seguir medidas correctivas?**

Cuando encuentras un peligro en la empresa:
1. En la sección **"Medidas Correctivas"** o dentro del ítem no cumplido, presiona **"+ Agregar Medida"**.
2. Describe la acción técnica obligatoria (ej: *"Instalar disyuntor diferencial de 30mA en tablero seccional T2"*).
3. Fija la **Fecha Límite (Plazo)** de cumplimiento legal.
4. Asigna el responsable (ej: *"Mantenimiento eléctrico de la empresa"*).
5. Define la prioridad: *Urgente (24hs), Alta (5 a 15 días), Media o Baja*.
6. El sistema permite filtrar medidas *Abiertas, En Proceso y Solucionadas*.`
    }
];

export default function HySHelpAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            type: 'welcome',
            text: '¡Hola, Inspector/a! 👋 Soy tu **Asistente de Uso de HyS Control**.\n\n¿Tienes dudas sobre cómo usar la web o qué hace cada botón? Selecciona una opción de la lista abajo o escribe tu consulta:',
            showMenu: true,
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

    const findAnswer = (query) => {
        const cleanQuery = query.toLowerCase().trim();

        for (const item of KNOWLEDGE_BASE) {
            if (item.keywords.some(k => cleanQuery.includes(k))) {
                return item.answer;
            }
        }

        const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);
        let bestMatch = null;
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
            }
        }

        if (maxMatches >= 1 && bestMatch) {
            return bestMatch;
        }

        return `🤔 No encontré una explicación exacta para **"${query}"**.\n\nPuedes tocar una de las preguntas de la lista para ver la guía correspondiente.`;
    };

    const handleSelectQuestion = (questionId, questionTitle) => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages(prev => [...prev, {
            sender: 'user',
            text: questionTitle,
            timestamp: timeStr
        }]);

        setIsTyping(true);

        setTimeout(() => {
            const answer = findAnswer(questionId);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: answer,
                showMenuButton: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 200);
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
            const answer = findAnswer(text);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: answer,
                showMenuButton: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 250);
    };

    const handleShowMenuAgain = () => {
        setMessages(prev => [...prev, {
            sender: 'bot',
            text: 'Aquí tienes la lista completa de preguntas:',
            showMenu: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const handleResetChat = () => {
        setMessages([
            {
                sender: 'bot',
                type: 'welcome',
                text: 'Conversación reiniciada. 🔄 Selecciona una pregunta de la lista o escribe tu duda:',
                showMenu: true,
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
                <div className="w-[94vw] sm:w-[440px] h-[580px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800 animate-in fade-in duration-200">
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
                                    Manual interactivo de botones y funciones
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
                    <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs text-slate-700">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} w-full`}
                            >
                                <div
                                    className={`p-3.5 rounded-2xl shadow-sm leading-relaxed whitespace-pre-line ${
                                        msg.sender === 'user'
                                            ? 'max-w-[88%] bg-blue-600 text-white font-medium self-end'
                                            : 'w-full bg-white text-slate-800 border border-slate-200/80'
                                    }`}
                                >
                                    <p className="font-normal">{msg.text}</p>

                                    {/* Lista de preguntas vertical (una debajo de la otra) */}
                                    {msg.showMenu && (
                                        <div className="mt-3 p-2 bg-slate-100/90 border border-slate-200/90 rounded-2xl w-full space-y-1.5 shadow-inner">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 pt-0.5 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-amber-500" />
                                                <span>Toca una pregunta para ver la respuesta:</span>
                                            </div>
                                            {QUESTIONS_MENU.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleSelectQuestion(item.id, item.title)}
                                                    className="w-full text-left px-3 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-800 hover:text-blue-700 font-medium text-xs transition flex items-center justify-between shadow-xs group cursor-pointer"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-sm shrink-0">{item.icon}</span>
                                                        <span className="leading-tight">{item.title}</span>
                                                    </span>
                                                    <span className="text-slate-300 group-hover:text-blue-600 font-bold transition text-xs shrink-0 ml-1">
                                                        ➔
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Botón para volver a ver la lista */}
                                    {msg.showMenuButton && (
                                        <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                                            <button
                                                onClick={handleShowMenuAgain}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                                            >
                                                <span>📋</span>
                                                <span>Ver lista de preguntas</span>
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
                            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-2xl w-24">
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
                            placeholder="Escribe un botón o duda (ej: extraer pdf, fotos)..."
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
