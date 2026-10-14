import React, { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowUpRight, Bot, ChevronLeft, ChevronRight, Download, MessageCircle, RotateCcw, Send, X, ZoomIn } from 'lucide-react';
import { ADMIN_MENU, CONTEXT, MENU, NODES, findNode } from '@/data/helpBot';

/**
 * Asistente "codeado": responde con el contenido de data/helpBot.js (sin IA, sin servidor).
 * Las respuestas pueden traer imágenes, botones rápidos, accesos a pantallas, el manual en PDF
 * y guías paso a paso.
 */

const STORAGE = 'hys-helpbot-v2';
let seq = 0;
const nextId = () => `m${Date.now()}-${++seq}`;

const initialMessages = () => [{ id: nextId(), from: 'bot', node: 'inicio' }];

function Paragraphs({ text }) {
    return (
        <div className="space-y-2">
            {String(text || '')
                .split('\n\n')
                .map((block, i) => (
                    <div key={i} className="space-y-1">
                        {block.split('\n').map((line, j) =>
                            line.startsWith('• ') ? (
                                <div key={j} className="flex gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>{line.slice(2)}</span>
                                </div>
                            ) : (
                                <p key={j}>{line}</p>
                            ),
                        )}
                    </div>
                ))}
        </div>
    );
}

export default function HelpBot() {
    const page = usePage();
    const user = page.props.auth?.user;
    const isAdmin = user?.role === 'admin';
    const component = page.component || '';

    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState(initialMessages);
    const [typing, setTyping] = useState(false);
    const [input, setInput] = useState('');
    const [zoom, setZoom] = useState(null);
    const endRef = useRef(null);
    const inputRef = useRef(null);
    const timer = useRef(null);

    // Recupera la conversación de esta sesión del navegador
    useEffect(() => {
        try {
            const raw = window.sessionStorage.getItem(STORAGE);
            if (raw) {
                const saved = JSON.parse(raw);
                const valid = Array.isArray(saved.msgs) ? saved.msgs.filter((m) => m.from === 'me' || NODES[m.node]) : [];
                if (valid.length) setMsgs(valid);
                if (saved.open) setOpen(true);
            }
        } catch {
            /* sin almacenamiento: empieza de cero */
        }
        return () => clearTimeout(timer.current);
    }, []);

    useEffect(() => {
        try {
            window.sessionStorage.setItem(STORAGE, JSON.stringify({ msgs: msgs.slice(-40), open }));
        } catch {
            /* ignorar */
        }
    }, [msgs, open]);

    useEffect(() => {
        if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [msgs, typing, open]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    if (!user) return null;

    const visible = (ids) => ids.filter((id) => NODES[id] && (!NODES[id].admin || isAdmin));
    const menuIds = visible([...MENU, ...ADMIN_MENU]);

    const reply = (nodeId, step = 0) => {
        setTyping(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            setTyping(false);
            setMsgs((m) => [...m, { id: nextId(), from: 'bot', node: nodeId, step }]);
        }, 450);
    };

    const say = (text) => setMsgs((m) => [...m, { id: nextId(), from: 'me', text }]);

    const choose = (id) => {
        say(id === 'menu' ? 'Ver todos los temas' : NODES[id].label);
        reply(id);
    };

    const moveStep = (nodeId, step, delta) => {
        say(delta > 0 ? 'Siguiente paso' : 'Paso anterior');
        reply(nodeId, step + delta);
    };

    const send = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || typing) return;
        setInput('');
        say(text);
        reply(findNode(text, isAdmin) || 'noEntendi');
    };

    const reset = () => {
        clearTimeout(timer.current);
        setTyping(false);
        setMsgs(initialMessages());
    };

    const go = (g) => {
        if (g.external) {
            window.open(g.href, '_blank', 'noopener');
            return;
        }
        setOpen(false);
        router.visit(g.href);
    };

    /** Botones rápidos que se ofrecen debajo de la última respuesta */
    const chipsFor = (m) => {
        const node = NODES[m.node] || {};
        const toChip = (id) => ({ key: id, label: id === 'menu' ? 'Ver todos los temas' : NODES[id].label, run: () => choose(id) });

        if (m.node === 'inicio') {
            const ctx = (CONTEXT.find(([re]) => re.test(component)) || [null, []])[1];
            const first = visible(ctx);
            return [...first, ...menuIds.filter((id) => !first.includes(id))].map(toChip);
        }
        if (m.node === 'menu' || m.node === 'noEntendi') return menuIds.map(toChip);

        if (node.guide) {
            const step = m.step || 0;
            const last = node.guide.length - 1;
            const chips = [];
            if (step < last) chips.push({ key: 'next', label: 'Siguiente paso', primary: true, icon: 'next', run: () => moveStep(m.node, step, 1) });
            if (step > 0) chips.push({ key: 'prev', label: 'Paso anterior', icon: 'prev', run: () => moveStep(m.node, step, -1) });
            if (step === last) chips.push(...visible(['guias', 'manual']).map(toChip));
            else chips.push(toChip('guias'));
            return chips;
        }

        const out = visible(node.next || []).filter((id) => id !== 'menu');
        out.push('menu'); // siempre se puede volver al menú
        return out.map(toChip);
    };

    const lastBotId = [...msgs].reverse().find((m) => m.from === 'bot')?.id;

    return (
        <>
            <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 print:hidden">
                {open && (
                    <div className="w-[min(400px,calc(100vw-2.5rem))] h-[min(640px,calc(100vh-7.5rem))] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
                        {/* Encabezado */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <span className="w-9 h-9 grid place-items-center rounded-xl bg-white/20">
                                <Bot className="w-5 h-5" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm leading-tight">Asistente HyS</div>
                                <div className="text-[11px] text-blue-100">Guía rápida · respuestas al instante</div>
                            </div>
                            <a href="/manual/Manual-de-usuario-HyS.pdf" target="_blank" rel="noopener" title="Descargar el manual de usuario (PDF)" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-white/15">
                                <Download className="w-4 h-4" />
                            </a>
                            <button type="button" onClick={reset} title="Empezar de nuevo" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-white/15">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => setOpen(false)} title="Cerrar" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-white/15">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4 space-y-3">
                            {msgs.map((m) => {
                                if (m.from === 'me') {
                                    return (
                                        <div key={m.id} className="flex justify-end">
                                            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 text-white text-sm px-3.5 py-2">{m.text}</div>
                                        </div>
                                    );
                                }

                                const node = NODES[m.node] || NODES.noEntendi;
                                const step = node.guide ? Math.min(m.step || 0, node.guide.length - 1) : 0;
                                const content = node.guide ? node.guide[step] : node;
                                const isLast = m.id === lastBotId && !typing;
                                const chips = isLast ? chipsFor({ ...m, step }) : [];
                                const goList = content.go || [];

                                return (
                                    <div key={m.id} className="flex gap-2 items-start">
                                        <span className="w-7 h-7 shrink-0 grid place-items-center rounded-full bg-blue-100 text-blue-600 mt-0.5">
                                            <Bot className="w-4 h-4" />
                                        </span>
                                        <div className="min-w-0 max-w-[88%] space-y-2">
                                            <div className="rounded-2xl rounded-tl-md bg-white border border-slate-200 text-slate-700 text-[13px] leading-relaxed px-3.5 py-2.5 shadow-sm">
                                                {m.node === 'inicio' && <p className="font-bold text-slate-900 mb-1">¡Hola, {String(user.name || '').split(' ')[0]}!</p>}
                                                {node.guide && (
                                                    <div className="mb-2">
                                                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{node.label}</div>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                                <div className="h-full bg-blue-600 transition-all" style={{ width: `${((step + 1) / node.guide.length) * 100}%` }} />
                                                            </div>
                                                            <span className="text-[11px] font-semibold text-slate-500">
                                                                Paso {step + 1} de {node.guide.length}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <Paragraphs text={content.text} />
                                                {content.image && (
                                                    <button type="button" onClick={() => setZoom({ src: content.image, caption: content.caption || node.label })} className="group relative mt-2.5 block w-full overflow-hidden rounded-xl border border-slate-200" title="Ampliar imagen">
                                                        <img src={content.image} alt={content.caption || ''} loading="lazy" className="w-full h-auto block" />
                                                        <span className="absolute right-2 top-2 w-7 h-7 grid place-items-center rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition">
                                                            <ZoomIn className="w-4 h-4" />
                                                        </span>
                                                    </button>
                                                )}
                                                {content.image && content.caption && <div className="mt-1 text-[11px] text-slate-400">{content.caption}</div>}
                                            </div>

                                            {isLast && goList.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {goList.map((g) => (
                                                        <button key={g.href} type="button" onClick={() => go(g)} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 transition">
                                                            {g.external ? <Download className="w-3.5 h-3.5" /> : null}
                                                            {g.label}
                                                            {!g.external && <ArrowUpRight className="w-3.5 h-3.5" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {chips.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {chips.map((c) => (
                                                        <button
                                                            key={c.key}
                                                            type="button"
                                                            onClick={c.run}
                                                            className={`inline-flex items-center gap-1 rounded-full border text-xs font-semibold px-3 py-1.5 transition ${
                                                                c.primary ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700' : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
                                                            }`}
                                                        >
                                                            {c.icon === 'prev' && <ChevronLeft className="w-3.5 h-3.5" />}
                                                            {c.label}
                                                            {c.icon === 'next' && <ChevronRight className="w-3.5 h-3.5" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {typing && (
                                <div className="flex gap-2 items-center">
                                    <span className="w-7 h-7 grid place-items-center rounded-full bg-blue-100 text-blue-600">
                                        <Bot className="w-4 h-4" />
                                    </span>
                                    <div className="flex gap-1 rounded-2xl bg-white border border-slate-200 px-3.5 py-3">
                                        {[0, 150, 300].map((d) => (
                                            <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Entrada */}
                        <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-3">
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribí tu consulta (ej: cómo subo fotos)"
                                className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button type="submit" disabled={!input.trim() || typing} className="w-10 h-10 grid place-items-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition" title="Enviar">
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}

                <button type="button" onClick={() => setOpen((v) => !v)} className="w-14 h-14 grid place-items-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition" title={open ? 'Cerrar asistente' : 'Abrir asistente'}>
                    {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                </button>
            </div>

            {/* Imagen ampliada */}
            {zoom && (
                <div className="fixed inset-0 z-[120] grid place-items-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setZoom(null)}>
                    <button type="button" className="absolute top-5 right-5 w-10 h-10 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white" onClick={() => setZoom(null)}>
                        <X className="w-5 h-5" />
                    </button>
                    <figure className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <img src={zoom.src} alt={zoom.caption || ''} className="w-full h-auto rounded-2xl bg-white shadow-2xl" />
                        {zoom.caption && <figcaption className="mt-3 text-center text-sm text-white/80">{zoom.caption}</figcaption>}
                    </figure>
                </div>
            )}
        </>
    );
}
