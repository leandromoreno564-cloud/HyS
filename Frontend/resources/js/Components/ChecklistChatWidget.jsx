import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, X, Loader2, Sparkles, AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react';

const MAX_HISTORY_SENT = 12; // mensajes que se mandan como contexto, para no inflar el request

/**
 * Asistente conversacional del relevamiento. Vive como botón flotante en la pantalla
 * del checklist; al abrirse, habla con /companies/{id}/checklist/chat, que a su vez
 * le pasa la pregunta + el estado completo del checklist a un workflow de n8n.
 *
 * n8n decide la respuesta y, opcionalmente, qué ítems completar (SI/NO/N/A + observación).
 * Los cambios que devuelve el asistente los aplica Laravel (no este componente ni n8n
 * directamente), así que acá simplemente mostramos la respuesta y fusionamos los ítems
 * actualizados que el backend ya validó y guardó.
 */
export default function ChecklistChatWidget({ company, onItemsUpdated }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                '¡Hola! Puedo responder dudas sobre la normativa y los ítems del relevamiento, y también ayudarte a completarlo: contame qué querés cargar y lo hago por vos.',
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, sending, open]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    const send = async () => {
        const text = input.trim();
        if (!text || sending) return;

        setError('');
        setInput('');
        const userMsg = { role: 'user', content: text };
        setMessages((prev) => [...prev, userMsg]);
        setSending(true);

        try {
            const history = [...messages, userMsg]
                .filter((m) => m.role === 'user' || m.role === 'assistant')
                .slice(-MAX_HISTORY_SENT)
                .map((m) => ({ role: m.role, content: m.content }));

            const res = await axios.post(
                `/companies/${company.id}/checklist/chat`,
                { message: text, history },
                { headers: { Accept: 'application/json' } }
            );

            const { reply, updated_items: updatedItems = [] } = res.data;

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: reply || 'Listo.',
                    updatedCount: updatedItems.length,
                },
            ]);

            if (updatedItems.length > 0 && onItemsUpdated) {
                onItemsUpdated(updatedItems);
            }
        } catch (err) {
            const msg =
                err.response?.data?.reply ||
                err.response?.data?.message ||
                'No se pudo contactar al asistente. Probá de nuevo en unos segundos.';
            setError(msg);
            setMessages((prev) => [...prev, { role: 'assistant', content: msg, isError: true }]);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <>
            {/* Botón flotante */}
            {!open && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-105"
                    title="Asistente del relevamiento"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Panel de chat */}
            {open && (
                <div className="fixed bottom-6 right-6 z-50 w-[23rem] max-w-[calc(100vw-2rem)] h-[32rem] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-900 text-white shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                <Bot className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold truncate">Asistente del relevamiento</p>
                                <p className="text-[10px] text-white/60 truncate">{company.business_name}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                            title="Cerrar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
                        {messages.map((m, i) => (
                            <ChatBubble key={i} message={m} />
                        ))}
                        {sending && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pl-1">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Pensando...
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                        {error && (
                            <div className="mb-2 flex items-start gap-1.5 text-[11px] text-rose-600">
                                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Preguntá algo o pedile que complete un ítem..."
                                rows={1}
                                disabled={sending}
                                className="flex-1 resize-none text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none disabled:opacity-60 max-h-24"
                            />
                            <button
                                type="button"
                                onClick={send}
                                disabled={sending || !input.trim()}
                                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-40"
                                title="Enviar"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function ChatBubble({ message }) {
    const isUser = message.role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : message.isError
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 rounded-bl-sm'
                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                }`}
            >
                {!isUser && !message.isError && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 mb-1">
                        <Sparkles className="w-3 h-3" />
                        Asistente
                    </div>
                )}
                {message.content}
                {message.updatedCount > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Se actualizaron {message.updatedCount} ítem{message.updatedCount === 1 ? '' : 's'} del checklist
                    </div>
                )}
            </div>
        </div>
    );
}
