import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import {
    Bot,
    Send,
    X,
    Loader2,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    MessageCircle,
    Trash2,
    ArrowUpRight,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Check,
} from 'lucide-react';

const MAX_HISTORY_SENT = 12; // mensajes que se mandan como contexto, para no inflar el request

const readPref = (key, fallback) => {
    try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch {
        return fallback;
    }
};
const writePref = (key, value) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* sin almacenamiento: solo se pierde la preferencia */
    }
};

const SpeechRecognitionImpl =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

const normalize = (m) => ({
    id: m.id ?? null,
    role: m.role,
    content: m.content,
    links: m.links || [],
    actions: m.actions || [],
    updatedCount: m.updated_count || 0,
    isError: Boolean(m.is_error),
});

const xsrfToken = () =>
    decodeURIComponent((document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/) || [])[1] || '');

// Efecto de escritura para respuestas que llegan completas (cuando n8n no hace streaming real)
const typewriter = (full, patch) =>
    new Promise((resolve) => {
        const step = Math.max(2, Math.ceil(full.length / 80));
        let i = 0;
        const t = setInterval(() => {
            i += step;
            patch({ content: full.slice(0, i) });
            if (i >= full.length) {
                clearInterval(t);
                resolve();
            }
        }, 18);
    });

/**
 * Panel de chat reutilizable (botón flotante + ventana). Lo usan:
 *  - ChecklistChatWidget → asistente del relevamiento de UNA empresa (puede completar ítems)
 *  - AssistantWidget     → asistente general, visible en todo el sistema
 *
 * Funciones:
 *  - Historial guardado en el servidor por usuario y ámbito (`scope`): se ve igual en cualquier dispositivo.
 *  - Streaming (`stream`): el texto aparece mientras se genera; si n8n responde completo, se muestra con
 *    efecto de escritura.
 *  - Acciones propuestas por el asistente con botones Confirmar / Descartar (no se ejecuta nada solo).
 *  - Contexto de pantalla (`getExtra`): lo que devuelva se agrega al request.
 *  - Voz: dictado por micrófono y lectura en voz alta de las respuestas (Web Speech API del navegador).
 */
export default function ChatPanel({
    endpoint,
    scope,
    title,
    subtitle = '',
    storageKey,
    welcome,
    suggestions = [],
    placeholder = 'Preguntá algo...',
    onItemsUpdated = null,
    getExtra = null,
    stream = false,
}) {
    const [open, setOpen] = useState(() => readPref(`${storageKey}:open`, false));
    const [speak, setSpeak] = useState(() => readPref(`${storageKey}:speak`, false));
    const [messages, setMessages] = useState([]); // sin el mensaje de bienvenida (no se guarda)
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const keepScrollRef = useRef(null); // altura previa del scroll al cargar mensajes anteriores
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [listening, setListening] = useState(false);

    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    // ---- Historial del servidor
    useEffect(() => {
        let cancelled = false;
        setLoadingHistory(true);
        axios
            .get('/assistant/history', { params: { scope, limit: 30 }, headers: { Accept: 'application/json' } })
            .then((res) => {
                if (cancelled) return;
                setMessages((res.data.messages || []).map(normalize));
                setHasMore(Boolean(res.data.has_more));
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoadingHistory(false);
            });
        return () => {
            cancelled = true;
        };
    }, [scope]);

    useEffect(() => {
        writePref(`${storageKey}:open`, open);
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open, storageKey]);

    useEffect(() => writePref(`${storageKey}:speak`, speak), [speak, storageKey]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (keepScrollRef.current !== null) {
            // Se cargaron mensajes anteriores: mantener la vista donde estaba, sin saltar al final
            el.scrollTop = el.scrollHeight - keepScrollRef.current;
            keepScrollRef.current = null;
            return;
        }
        el.scrollTop = el.scrollHeight;
    }, [messages, sending, open, loadingHistory]);

    useEffect(
        () => () => {
            recognitionRef.current?.abort?.();
            if (canSpeak) window.speechSynthesis.cancel();
        },
        []
    );

    // ---- Voz
    const speakText = (text) => {
        if (!speak || !canSpeak || !text) return;
        const plain = text.replace(/\*\*/g, '').replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, '');
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(plain);
        u.lang = 'es-AR';
        window.speechSynthesis.speak(u);
    };

    const toggleListening = () => {
        if (!SpeechRecognitionImpl) return;
        if (listening) {
            recognitionRef.current?.stop();
            return;
        }
        if (!window.isSecureContext) {
            setError('El micrófono solo funciona con HTTPS o en localhost.');
            return;
        }

        const rec = new SpeechRecognitionImpl();
        rec.lang = 'es-AR';
        rec.interimResults = true;
        rec.continuous = false;
        const base = input.trim();

        rec.onresult = (e) => {
            let transcript = '';
            for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
            setInput((base ? base + ' ' : '') + transcript);
        };
        rec.onerror = (e) => {
            const msgs = {
                'not-allowed': 'Permiso de micrófono denegado. Habilitalo en el navegador.',
                'no-speech': 'No se escuchó nada. Probá de nuevo.',
                'audio-capture': 'No se encontró un micrófono.',
            };
            setError(msgs[e.error] || 'No se pudo usar el micrófono.');
        };
        rec.onend = () => setListening(false);

        setError('');
        recognitionRef.current = rec;
        setListening(true);
        rec.start();
    };

    // ---- Envío
    const patchLast = (patch) =>
        setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
            return copy;
        });

    const sendStreaming = async (text, history, extra) => {
        const res = await fetch(endpoint, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/x-ndjson',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': xsrfToken(),
            },
            body: JSON.stringify({ message: text, history, stream: true, ...extra }),
        });

        if (!res.ok || !res.body) {
            let data = {};
            try {
                data = await res.json();
            } catch {
                /* respuesta sin JSON */
            }
            throw { response: { data } };
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true, links: [], actions: [] }]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let acc = '';
        let gotDelta = false;
        let final = null;

        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let nl;
            while ((nl = buffer.indexOf('\n')) >= 0) {
                const line = buffer.slice(0, nl).trim();
                buffer = buffer.slice(nl + 1);
                if (!line) continue;

                let ev;
                try {
                    ev = JSON.parse(line);
                } catch {
                    continue;
                }

                if (ev.t === 'delta') {
                    gotDelta = true;
                    acc += ev.text;
                    patchLast({ content: acc });
                } else if (ev.t === 'done') {
                    final = ev;
                } else if (ev.t === 'error') {
                    throw { response: { data: { reply: ev.reply } } };
                }
            }
        }

        if (!final) {
            if (!acc) throw { response: { data: {} } };
            final = { reply: acc, links: [], actions: [], message_id: null };
        }

        if (!gotDelta) await typewriter(final.reply, patchLast);

        patchLast({
            content: final.reply,
            streaming: false,
            id: final.message_id,
            links: final.links || [],
            actions: final.actions || [],
        });

        return final.reply;
    };

    const send = async (override = null) => {
        const text = (override ?? input).trim();
        if (!text || sending) return;

        recognitionRef.current?.stop?.();
        if (canSpeak) window.speechSynthesis.cancel();

        setError('');
        setInput('');
        setSending(true);

        const userMsg = { role: 'user', content: text };
        const history = [...messages, userMsg]
            .filter((m) => (m.role === 'user' || m.role === 'assistant') && !m.isError && !m.streaming)
            .slice(-MAX_HISTORY_SENT)
            .map((m) => ({ role: m.role, content: m.content }));

        setMessages((prev) => [...prev, userMsg]);

        const extra = getExtra ? getExtra() : {};

        try {
            let reply;

            if (stream) {
                reply = await sendStreaming(text, history, extra);
            } else {
                const res = await axios.post(
                    endpoint,
                    { message: text, history, ...extra },
                    { headers: { Accept: 'application/json' } }
                );
                const { updated_items: updatedItems = [] } = res.data;
                reply = res.data.reply || 'Listo.';

                setMessages((prev) => [
                    ...prev,
                    normalize({
                        id: res.data.message_id,
                        role: 'assistant',
                        content: reply,
                        links: res.data.links,
                        actions: res.data.actions,
                        updated_count: updatedItems.length,
                    }),
                ]);

                if (updatedItems.length > 0 && onItemsUpdated) onItemsUpdated(updatedItems);
            }

            speakText(reply);
        } catch (err) {
            const msg =
                err.response?.data?.reply ||
                err.response?.data?.message ||
                'No se pudo contactar al asistente. Probá de nuevo en unos segundos.';
            setError(msg);
            setMessages((prev) => [
                ...prev.filter((m) => !m.streaming),
                { role: 'assistant', content: msg, isError: true },
            ]);
        } finally {
            setSending(false);
        }
    };

    // ---- Acciones propuestas
    const decideAction = async (msg, index, decision) => {
        if (!msg.id) return;

        const patchAction = (patch) =>
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === msg.id
                        ? { ...m, actions: m.actions.map((a, i) => (i === index ? { ...a, ...patch } : a)) }
                        : m
                )
            );

        patchAction({ busy: true, error: null });

        try {
            const res = await axios.post(`/assistant/messages/${msg.id}/actions/${index}/${decision}`, null, {
                headers: { Accept: 'application/json' },
            });
            patchAction({ busy: false, status: res.data.status, result: res.data.message, link: res.data.link || null });
        } catch (err) {
            const data = err.response?.data;
            patchAction({
                busy: false,
                status: err.response?.status === 409 && data?.status ? data.status : undefined,
                error: data?.message || 'No se pudo completar la acción.',
            });
        }
    };

    const loadMore = async () => {
        const oldest = messages.find((m) => m.id)?.id;
        if (!oldest || loadingMore) return;

        setLoadingMore(true);
        try {
            const res = await axios.get('/assistant/history', {
                params: { scope, before: oldest, limit: 30 },
                headers: { Accept: 'application/json' },
            });
            keepScrollRef.current = scrollRef.current ? scrollRef.current.scrollHeight : null;
            setMessages((prev) => [...(res.data.messages || []).map(normalize), ...prev]);
            setHasMore(Boolean(res.data.has_more));
        } catch {
            setError('No se pudieron cargar los mensajes anteriores.');
        } finally {
            setLoadingMore(false);
        }
    };

    const clearChat = async () => {
        if (messages.length > 0 && !confirm('¿Borrar toda la conversación?')) return;
        try {
            await axios.delete('/assistant/history', { params: { scope }, headers: { Accept: 'application/json' } });
        } catch {
            /* si falla el servidor igual se limpia la vista */
        }
        setMessages([]);
        setHasMore(false);
        setError('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <>
            {!open && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-105"
                    title={title}
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {open && (
                <div className="fixed bottom-6 right-6 z-50 w-[23rem] max-w-[calc(100vw-2rem)] h-[32rem] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-900 text-white shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold truncate">{title}</p>
                                {subtitle && <p className="text-[10px] text-white/60 truncate">{subtitle}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                            {canSpeak && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (speak) window.speechSynthesis.cancel();
                                        setSpeak((v) => !v);
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                    title={speak ? 'Desactivar lectura en voz alta' : 'Leer respuestas en voz alta'}
                                >
                                    {speak ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={clearChat}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                title="Borrar conversación"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                title="Cerrar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
                        <ChatBubble message={{ role: 'assistant', content: welcome, links: [], actions: [] }} />

                        {loadingHistory && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pl-1">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Cargando conversación...
                            </div>
                        )}

                        {hasMore && !loadingHistory && (
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors disabled:opacity-60"
                                >
                                    {loadingMore ? 'Cargando...' : 'Ver mensajes anteriores'}
                                </button>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <ChatBubble
                                key={m.id ?? `local-${i}`}
                                message={m}
                                onNavigate={(url) => router.visit(url)}
                                onDecide={(index, decision) => decideAction(m, index, decision)}
                            />
                        ))}

                        {!loadingHistory && messages.length === 0 && suggestions.length > 0 && !sending && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => send(s)}
                                        className="text-[11px] font-medium text-blue-700 bg-white border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors text-left"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {sending && !messages.some((m) => m.streaming && m.content) && (
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
                                placeholder={listening ? 'Escuchando...' : placeholder}
                                rows={1}
                                disabled={sending}
                                className="flex-1 resize-none text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none disabled:opacity-60 max-h-24"
                            />
                            {SpeechRecognitionImpl && (
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    disabled={sending}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 ${
                                        listening
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                    }`}
                                    title={listening ? 'Detener dictado' : 'Dictar por voz'}
                                >
                                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => send()}
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

// **negrita** → <strong>; el resto se muestra como texto plano (nunca se inyecta HTML)
function renderInline(text) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
            <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
        )
    );
}

function renderContent(content) {
    const blocks = [];
    let list = null;

    content.split('\n').forEach((line, i) => {
        const item = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
        if (item) {
            if (!list) {
                list = [];
                blocks.push({ type: 'list', items: list, key: i });
            }
            list.push(item[1]);
        } else {
            list = null;
            blocks.push({ type: 'p', text: line, key: i });
        }
    });

    return blocks.map((b) =>
        b.type === 'list' ? (
            <ul key={b.key} className="list-disc pl-4 space-y-0.5 my-1">
                {b.items.map((it, j) => (
                    <li key={j}>{renderInline(it)}</li>
                ))}
            </ul>
        ) : b.text.trim() === '' ? (
            <div key={b.key} className="h-1.5" />
        ) : (
            <p key={b.key}>{renderInline(b.text)}</p>
        )
    );
}

function ActionCard({ action, onDecide }) {
    const status = action.status || 'pending';

    return (
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold text-amber-900 leading-snug">{action.label}</p>

            {status === 'pending' && (
                <div className="mt-2 flex items-center gap-2">
                    <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => onDecide?.('confirm')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-2.5 py-1 disabled:opacity-50"
                    >
                        {action.busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Confirmar
                    </button>
                    <button
                        type="button"
                        disabled={action.busy}
                        onClick={() => onDecide?.('cancel')}
                        className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg px-2.5 py-1 disabled:opacity-50"
                    >
                        Descartar
                    </button>
                </div>
            )}

            {status === 'done' && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    {action.result || 'Hecho'}
                </p>
            )}
            {status === 'cancelled' && <p className="mt-1.5 text-[11px] font-medium text-slate-500">Descartada.</p>}
            {action.error && <p className="mt-1.5 text-[11px] font-medium text-rose-600">{action.error}</p>}
        </div>
    );
}

function ChatBubble({ message, onNavigate, onDecide }) {
    const isUser = message.role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                        ? 'bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap'
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

                {isUser || message.isError ? message.content : renderContent(message.content || '')}
                {message.streaming && <span className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-blue-400 animate-pulse" />}

                {!message.streaming &&
                    message.actions?.map((a, i) => (
                        <ActionCard key={i} action={a} onDecide={(decision) => onDecide?.(i, decision)} />
                    ))}

                {!message.streaming && message.links?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.links.map((l) => (
                            <button
                                key={l.url}
                                type="button"
                                onClick={() => onNavigate?.(l.url)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-100 transition-colors"
                            >
                                {l.label}
                                <ArrowUpRight className="w-3 h-3" />
                            </button>
                        ))}
                    </div>
                )}

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
