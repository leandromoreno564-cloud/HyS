import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowRight,
    Activity,
    ArrowUp,
    BookOpen,
    Brain,
    Bug,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    ClipboardCheck,
    Cog,
    Download,
    Eye,
    EyeOff,
    Film,
    FileText,
    Flag,
    FlaskConical,
    Flame,
    GraduationCap,
    HardHat,
    HeartPulse,
    LayoutDashboard,
    LifeBuoy,
    LogIn,
    LogOut,
    Megaphone,
    Pencil,
    Phone,
    Play,
    Plus,
    Scale,
    Search,
    Settings2,
    ShieldCheck,
    Sparkles,
    Trash2,
    TriangleAlert,
    Upload,
    UserRound,
    Users,
    Volume2,
    Wrench,
    X,
    Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_ORDER = ['acerca', 'recursos', 'pasos', 'riesgos', 'normativa', 'galeria', 'practicas', 'emergencia', 'videos', 'faq', 'ayuda'];

const DEFAULT_HERO =
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2200&q=85';

const isUrl = (v) => /^https?:\/\//i.test(v || '');
// URL completa, ruta propia del sitio (/images/...) o archivo subido (disco public)
const mediaUrl = (v) => (!v ? null : isUrl(v) || String(v).startsWith('/') ? v : `/storage/${v}`);
const ytId = (u) => {
    const m = String(u || '').match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
};
const isVideoUrl = (v) => /\.(mp4|webm|mov)(\?.*)?$/i.test(v || '');

const inputCls =
    'w-full rounded-xl bg-slate-800/60 border border-slate-600/60 px-3 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition';

const SECTION_LABELS = {
    stats: 'dato destacado',
    acerca: 'texto',
    recursos: 'recurso',
    pasos: 'paso',
    normativa: 'norma',
    galeria: 'foto',
    practicas: 'práctica',
    videos: 'video',
    faq: 'pregunta',
    riesgos: 'riesgo',
    emergencia: 'paso de emergencia',
    ayuda: 'capítulo del manual',
};

/* Íconos disponibles (sin emojis): clave guardada en la base -> [componente, nombre] */
const ICON_MAP = {
    shield: [ShieldCheck, 'Escudo'],
    hardhat: [HardHat, 'Casco'],
    alert: [TriangleAlert, 'Advertencia'],
    graduation: [GraduationCap, 'Capacitación'],
    search: [Search, 'Buscar'],
    brain: [Brain, 'Análisis'],
    megaphone: [Megaphone, 'Comunicar'],
    flame: [Flame, 'Fuego'],
    heart: [HeartPulse, 'Salud'],
    file: [FileText, 'Documento'],
    users: [Users, 'Personas'],
    clipboard: [ClipboardCheck, 'Checklist'],
    scale: [Scale, 'Ley'],
    phone: [Phone, 'Teléfono'],
    eye: [Eye, 'Observar'],
    wrench: [Wrench, 'Herramientas'],
    check: [CircleCheck, 'Correcto'],
    sparkles: [Sparkles, 'Orden y limpieza'],
    zap: [Zap, 'Electricidad'],
    flask: [FlaskConical, 'Químicos'],
    bug: [Bug, 'Biológico'],
    volume: [Volume2, 'Ruido'],
    cog: [Cog, 'Máquinas'],
    activity: [Activity, 'Ergonomía'],
    flag: [Flag, 'Punto de reunión'],
};

function Icon({ name, fallback = null, className = 'w-5 h-5' }) {
    const Cmp = ICON_MAP[name]?.[0] ?? fallback;
    return Cmp ? <Cmp className={className} /> : null;
}

/* ------------------------------------------------------------------ */
/* Estilos y animaciones propias de la portada                         */
/* ------------------------------------------------------------------ */

const PortalStyles = () => (
    <style>{`
        html { scroll-behavior: smooth; }
        .hys-reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); transition-delay: var(--d, 0ms); }
        .hys-reveal.in { opacity: 1; transform: none; }
        @keyframes hys-pulse { 50% { opacity: .35; transform: scale(.7); } }
        @keyframes hys-rise { from { opacity: 0; transform: translateY(34px); } to { opacity: 1; transform: none; } }
        @keyframes hys-fill { from { width: 0; } to { width: 100%; } }
        @keyframes hys-ring { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.7); opacity: 0; } }
        @keyframes hys-bob { 50% { transform: translateY(7px); } }
        @keyframes hys-pop { from { opacity: 0; transform: scale(.96) translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes hys-fade { from { opacity: 0; } to { opacity: 1; } }
        .hys-hero-in { animation: hys-rise 1s cubic-bezier(.2,.7,.2,1) both; }
        .hys-pop { animation: hys-pop .28s ease both; }
        .hys-fade { animation: hys-fade .25s ease both; }
        .hys-noise::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .05; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E"); }
        @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto; }
            .hys-reveal { opacity: 1; transform: none; transition: none; }
            .hys-hero-in, .hys-pop, .hys-fade { animation: none; }
        }
    `}</style>
);

/* ------------------------------------------------------------------ */
/* Componentes de interacción                                          */
/* ------------------------------------------------------------------ */

function Reveal({ children, delay = 0, className = '' }) {
    const ref = useRef(null);
    const [on, setOn] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        if (!('IntersectionObserver' in window)) {
            setOn(true);
            return undefined;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setOn(true);
                    io.disconnect();
                }
            },
            { threshold: 0.12 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ '--d': `${delay}ms` }} className={`hys-reveal ${on ? 'in' : ''} ${className}`}>
            {children}
        </div>
    );
}

function Tilt({ children, className = '' }) {
    const ref = useRef(null);

    const move = (e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    };
    const leave = () => {
        if (ref.current) ref.current.style.transform = '';
    };

    return (
        <div
            ref={ref}
            onMouseMove={move}
            onMouseLeave={leave}
            className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
        >
            {children}
        </div>
    );
}

function CountUp({ value }) {
    const m = String(value ?? '').match(/^(\D*)(\d+)(\D*)$/);
    const [n, setN] = useState(0);

    useEffect(() => {
        if (!m) return undefined;
        const target = parseInt(m[2], 10);
        let raf;
        const start = performance.now();
        const tick = (t) => {
            const p = Math.min(1, (t - start) / 1300);
            setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    if (!m) return <>{value}</>;
    return (
        <>
            {m[1]}
            {String(n).padStart(m[2].length, '0')}
            {m[3]}
        </>
    );
}

function SafeImg({ src, alt = '', className = '' }) {
    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={className}
            onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
            }}
        />
    );
}

/* ------------------------------------------------------------------ */
/* Herramientas de edición (solo admin)                                */
/* ------------------------------------------------------------------ */

function ToolBtn({ title, onClick, disabled, danger, children }) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClick();
            }}
            className={`w-8 h-8 grid place-items-center rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed ${
                danger ? 'hover:bg-rose-500/20 text-rose-300' : 'hover:bg-white/10 text-slate-200'
            }`}
        >
            {children}
        </button>
    );
}

function ItemTools({ item, first, last, onEdit }) {
    const keep = { preserveScroll: true };
    return (
        <div
            className="absolute top-2 right-2 z-20 flex gap-0.5 rounded-xl bg-slate-950/90 backdrop-blur p-1 border border-white/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
        >
            <ToolBtn title="Mover antes" disabled={first} onClick={() => router.post(`/portal/items/${item.id}/move`, { direction: 'up' }, keep)}>
                <ArrowUp className="w-4 h-4" />
            </ToolBtn>
            <ToolBtn title="Mover después" disabled={last} onClick={() => router.post(`/portal/items/${item.id}/move`, { direction: 'down' }, keep)}>
                <ArrowDown className="w-4 h-4" />
            </ToolBtn>
            <ToolBtn title={item.is_active ? 'Ocultar a los visitantes' : 'Mostrar a los visitantes'} onClick={() => router.post(`/portal/items/${item.id}/toggle`, {}, keep)}>
                {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-amber-300" />}
            </ToolBtn>
            <ToolBtn title="Editar" onClick={onEdit}>
                <Pencil className="w-4 h-4" />
            </ToolBtn>
            <ToolBtn
                title="Eliminar"
                danger
                onClick={() => {
                    if (window.confirm('¿Eliminar este elemento? No se puede deshacer.')) {
                        router.delete(`/portal/items/${item.id}`, keep);
                    }
                }}
            >
                <Trash2 className="w-4 h-4" />
            </ToolBtn>
        </div>
    );
}

function HiddenBadge() {
    return (
        <span className="absolute top-2 left-2 z-20 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-900 rounded-full px-2.5 py-1">
            Oculto
        </span>
    );
}

function AddTile({ label, onClick, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-400/40 text-amber-300 hover:bg-amber-400/10 hover:border-amber-400 transition min-h-[160px] w-full ${className}`}
        >
            <span className="w-11 h-11 grid place-items-center rounded-full bg-amber-400/15 group-hover:scale-110 transition">
                <Plus className="w-5 h-5" />
            </span>
            <span className="text-sm font-semibold">{label}</span>
        </button>
    );
}

function Modal({ title, onClose, children, wide = false }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4 bg-black/70 backdrop-blur-md hys-fade" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`hys-pop w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/10 shadow-2xl`}>
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur border-b border-white/10">
                    <h3 className="text-base font-bold text-white">{title}</h3>
                    <button type="button" onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

function Field({ label, error, hint, children }) {
    return (
        <div className="mb-4">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
            {children}
            {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
            {error && <p className="mt-1 text-xs font-medium text-rose-400">{error}</p>}
        </div>
    );
}

function FilePick({ file, onChange, accept, label }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-slate-600 hover:border-amber-400 px-3 py-2.5 text-sm text-slate-300 transition">
            <Upload className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">{file ? file.name : label}</span>
            <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
        </label>
    );
}

function SubmitRow({ processing, onClose }) {
    return (
        <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10">
                Cancelar
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:opacity-50">
                <Check className="w-4 h-4" />
                {processing ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}

/* Alta / edición de un elemento */
function ItemModal({ section, item, onClose }) {
    const isEdit = !!item;
    const { data, setData, post, processing, errors } = useForm({
        section,
        title: item?.title ?? '',
        text: item?.text ?? '',
        icon: item?.icon ?? '',
        image_file: null,
        image_url: isUrl(item?.image) ? item.image : '',
        remove_image: false,
        video_file: null,
        video_url: isUrl(item?.video) ? item.video : '',
        remove_video: false,
    });

    const hasImageField = ['recursos', 'galeria', 'videos', 'ayuda'].includes(section);
    const hasVideoField = section === 'videos';
    const hasIcon = ['recursos', 'pasos', 'normativa', 'practicas', 'riesgos', 'emergencia'].includes(section);
    const hasText = section !== 'galeria';
    const bigText = ['acerca', 'faq'].includes(section);
    const titleLabel = { stats: 'Número o dato', galeria: 'Descripción (opcional)', faq: 'Pregunta' }[section] ?? 'Título';
    const textLabel = { stats: 'Texto debajo', pasos: 'Descripción del paso', faq: 'Respuesta' }[section] ?? 'Texto';

    const submit = (e) => {
        e.preventDefault();
        post(isEdit ? `/portal/items/${item.id}` : '/portal/items', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const currentImage = isEdit && item.image && !data.remove_image ? mediaUrl(item.image) : null;

    return (
        <Modal title={`${isEdit ? 'Editar' : 'Agregar'} ${SECTION_LABELS[section]}`} onClose={onClose}>
            <form onSubmit={submit}>
                {hasIcon && (
                    <Field label="Ícono" error={errors.icon}>
                        <select className={inputCls} value={data.icon} onChange={(e) => setData('icon', e.target.value)}>
                            <option value="">Sin ícono</option>
                            {Object.entries(ICON_MAP).map(([key, [, label]]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </Field>
                )}

                <Field label={titleLabel} error={errors.title}>
                    <input className={inputCls} value={data.title} onChange={(e) => setData('title', e.target.value)} />
                </Field>

                {hasText && (
                    <Field label={textLabel} error={errors.text}>
                        <textarea rows={bigText ? 7 : 4} className={inputCls} value={data.text} onChange={(e) => setData('text', e.target.value)} />
                    </Field>
                )}

                {hasVideoField && (
                    <>
                        <Field
                            label="Video"
                            error={errors.video_file || errors.video_url}
                            hint="Subí un archivo (mp4, webm o mov, hasta 50 MB) o pegá un enlace de YouTube / .mp4."
                        >
                            <FilePick file={data.video_file} onChange={(f) => setData('video_file', f)} accept="video/mp4,video/webm,video/quicktime" label="Elegir archivo de video" />
                            <input className={`${inputCls} mt-2`} value={data.video_url} onChange={(e) => setData('video_url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                            {isEdit && item.video && !isUrl(item.video) && !data.video_file && (
                                <p className="mt-2 text-xs text-slate-400">Hay un video subido. Si elegís otro, lo reemplaza.</p>
                            )}
                        </Field>
                    </>
                )}

                {hasImageField && (
                    <Field
                        label={section === 'videos' ? 'Portada del video (opcional)' : section === 'ayuda' ? 'Imagen del capítulo (opcional)' : 'Foto'}
                        error={errors.image_file || errors.image_url}
                        hint="JPG, PNG, WEBP o GIF, hasta 8 MB. También podés pegar un enlace."
                    >
                        {currentImage && (
                            <div className="mb-2 flex items-center gap-3">
                                <img src={currentImage} alt="" className="w-20 h-14 rounded-lg object-cover border border-white/10" />
                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                    <input type="checkbox" checked={data.remove_image} onChange={(e) => setData('remove_image', e.target.checked)} className="rounded border-slate-500 bg-slate-800 text-amber-400" />
                                    Quitar foto
                                </label>
                            </div>
                        )}
                        <FilePick file={data.image_file} onChange={(f) => setData('image_file', f)} accept="image/*" label="Elegir foto" />
                        <input className={`${inputCls} mt-2`} value={data.image_url} onChange={(e) => setData('image_url', e.target.value)} placeholder="https://..." />
                    </Field>
                )}

                <SubmitRow processing={processing} onClose={onClose} />
            </form>
        </Modal>
    );
}

/* Textos generales + medio de portada */
const SETTINGS_GROUPS = [
    {
        title: 'Portada principal',
        fields: [
            ['brand_name', 'Nombre en la barra'],
            ['hero_kicker', 'Frase superior'],
            ['hero_title', 'Título'],
            ['hero_highlight', 'Título resaltado'],
            ['hero_text', 'Descripción', true],
            ['hero_cta', 'Texto del botón'],
        ],
    },
    {
        title: 'Sección Quiénes somos',
        fields: [
            ['acerca_eyebrow', 'Etiqueta'],
            ['acerca_title', 'Título'],
            ['acerca_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Recursos',
        fields: [
            ['recursos_eyebrow', 'Etiqueta'],
            ['recursos_title', 'Título'],
            ['recursos_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Pasos',
        fields: [
            ['pasos_eyebrow', 'Etiqueta'],
            ['pasos_title', 'Título'],
            ['pasos_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Riesgos',
        fields: [
            ['riesgos_eyebrow', 'Etiqueta'],
            ['riesgos_title', 'Título'],
            ['riesgos_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Normativa',
        fields: [
            ['normativa_eyebrow', 'Etiqueta'],
            ['normativa_title', 'Título'],
            ['normativa_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Galería',
        fields: [
            ['galeria_eyebrow', 'Etiqueta'],
            ['galeria_title', 'Título'],
            ['galeria_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Buenas prácticas',
        fields: [
            ['practicas_eyebrow', 'Etiqueta'],
            ['practicas_title', 'Título'],
            ['practicas_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Emergencias',
        fields: [
            ['emergencia_eyebrow', 'Etiqueta'],
            ['emergencia_title', 'Título'],
            ['emergencia_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Videos',
        fields: [
            ['videos_eyebrow', 'Etiqueta'],
            ['videos_title', 'Título'],
            ['videos_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Preguntas frecuentes',
        fields: [
            ['faq_eyebrow', 'Etiqueta'],
            ['faq_title', 'Título'],
            ['faq_text', 'Texto', true],
        ],
    },
    {
        title: 'Sección Ayuda (manual de usuario)',
        fields: [
            ['ayuda_eyebrow', 'Etiqueta'],
            ['ayuda_title', 'Título'],
            ['ayuda_text', 'Texto', true],
        ],
    },
    {
        title: 'Cierre (invitación a ingresar)',
        fields: [
            ['cta_title', 'Título'],
            ['cta_text', 'Texto', true],
        ],
    },
    {
        title: 'Pie de página',
        fields: [
            ['footer_left', 'Texto izquierdo'],
            ['footer_right', 'Texto derecho'],
        ],
    },
];

function SettingsModal({ settings, onClose }) {
    const initial = { hero_media_file: null, hero_media_url: isUrl(settings.hero_media) ? settings.hero_media : '', remove_hero_media: false };
    SETTINGS_GROUPS.forEach((g) => g.fields.forEach(([k]) => (initial[k] = settings[k] ?? '')));

    const { data, setData, post, processing, errors } = useForm(initial);
    const [open, setOpen] = useState(0);

    const submit = (e) => {
        e.preventDefault();
        post('/portal/settings', { forceFormData: true, preserveScroll: true, onSuccess: onClose });
    };

    const heroSrc = settings.hero_media && !data.remove_hero_media ? mediaUrl(settings.hero_media) : null;

    return (
        <Modal title="Editar textos y portada" onClose={onClose} wide>
            <form onSubmit={submit}>
                {SETTINGS_GROUPS.map((g, i) => (
                    <div key={g.title} className="mb-3 rounded-2xl border border-white/10 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setOpen(open === i ? -1 : i)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white bg-white/5 hover:bg-white/10"
                        >
                            {g.title}
                            <ChevronDown className={`w-4 h-4 transition ${open === i ? 'rotate-180' : ''}`} />
                        </button>
                        {open === i && (
                            <div className="p-4">
                                {g.fields.map(([key, label, area]) => (
                                    <Field key={key} label={label} error={errors[key]}>
                                        {area ? (
                                            <textarea rows={3} className={inputCls} value={data[key]} onChange={(e) => setData(key, e.target.value)} />
                                        ) : (
                                            <input className={inputCls} value={data[key]} onChange={(e) => setData(key, e.target.value)} />
                                        )}
                                    </Field>
                                ))}

                                {i === 0 && (
                                    <Field
                                        label="Foto o video de fondo"
                                        error={errors.hero_media_file || errors.hero_media_url}
                                        hint="Foto (hasta 50 MB) o video mp4/webm. Si no cargás nada, se usa la imagen por defecto."
                                    >
                                        {heroSrc && (
                                            <div className="mb-2 flex items-center gap-3">
                                                {settings.hero_media_type === 'video' ? (
                                                    <span className="w-20 h-14 grid place-items-center rounded-lg bg-slate-800 border border-white/10">
                                                        <Film className="w-5 h-5 text-amber-300" />
                                                    </span>
                                                ) : (
                                                    <img src={heroSrc} alt="" className="w-20 h-14 rounded-lg object-cover border border-white/10" />
                                                )}
                                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                                    <input type="checkbox" checked={data.remove_hero_media} onChange={(e) => setData('remove_hero_media', e.target.checked)} className="rounded border-slate-500 bg-slate-800 text-amber-400" />
                                                    Volver a la imagen por defecto
                                                </label>
                                            </div>
                                        )}
                                        <FilePick file={data.hero_media_file} onChange={(f) => setData('hero_media_file', f)} accept="image/*,video/mp4,video/webm,video/quicktime" label="Elegir foto o video" />
                                        <input className={`${inputCls} mt-2`} value={data.hero_media_url} onChange={(e) => setData('hero_media_url', e.target.value)} placeholder="https://... (imagen o .mp4)" />
                                    </Field>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                <SubmitRow processing={processing} onClose={onClose} />
            </form>
        </Modal>
    );
}

/* ------------------------------------------------------------------ */
/* Visores: galería y video                                            */
/* ------------------------------------------------------------------ */

function Lightbox({ photos, index, onIndex, onClose }) {
    const total = photos.length;
    const prev = useCallback(() => onIndex((index - 1 + total) % total), [index, total, onIndex]);
    const next = useCallback(() => onIndex((index + 1) % total), [index, total, onIndex]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [prev, next, onClose]);

    const p = photos[index];
    if (!p) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md grid place-items-center hys-fade" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <button type="button" onClick={onClose} className="absolute top-5 right-5 w-11 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white">
                <X className="w-6 h-6" />
            </button>
            {total > 1 && (
                <>
                    <button type="button" onClick={prev} className="absolute left-3 md:left-6 w-12 h-12 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button type="button" onClick={next} className="absolute right-3 md:right-6 w-12 h-12 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}
            <figure key={p.id} className="hys-pop max-w-[92vw] max-h-[86vh] flex flex-col items-center">
                <img src={mediaUrl(p.image)} alt={p.title || ''} className="max-w-full max-h-[78vh] rounded-2xl object-contain shadow-2xl" />
                <figcaption className="mt-4 text-center text-sm text-slate-300">
                    {p.title && <span className="font-semibold text-white">{p.title} · </span>}
                    {index + 1} / {total}
                </figcaption>
            </figure>
        </div>
    );
}

function VideoModal({ video, onClose }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const id = ytId(video.video);
    const src = mediaUrl(video.video);

    return (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md grid place-items-center p-4 hys-fade" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <button type="button" onClick={onClose} className="absolute top-5 right-5 w-11 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white">
                <X className="w-6 h-6" />
            </button>
            <div className="hys-pop w-full max-w-5xl">
                <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                    {id ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
                            title={video.title || 'Video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video className="w-full h-full" src={src} controls autoPlay playsInline />
                    )}
                </div>
                {video.title && <p className="mt-4 text-center text-white font-semibold">{video.title}</p>}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Secciones                                                           */
/* ------------------------------------------------------------------ */

function SectionHead({ eyebrow, title, text, editing, addLabel, onAdd, left = false }) {
    return (
        <Reveal className={left ? 'mb-10' : 'text-center max-w-2xl mx-auto mb-12'}>
            {eyebrow && <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber-400">{eyebrow}</div>}
            {title && <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>}
            {text && <p className="mt-4 text-slate-400 leading-relaxed whitespace-pre-line">{text}</p>}
            {editing && (
                <button type="button" onClick={onAdd} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-400 text-slate-900 hover:bg-amber-300">
                    <Plus className="w-4 h-4" />
                    {addLabel}
                </button>
            )}
        </Reveal>
    );
}

function Steps({ list, editing, onEdit }) {
    const [active, setActive] = useState(0);
    const [auto, setAuto] = useState(true);

    useEffect(() => {
        if (!auto || editing || list.length < 2) return undefined;
        const t = setInterval(() => setActive((a) => (a + 1) % list.length), 6000);
        return () => clearInterval(t);
    }, [auto, editing, list.length]);

    const safe = Math.min(active, Math.max(0, list.length - 1));
    const cur = list[safe];
    if (!cur) return null;

    return (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-6 max-w-5xl mx-auto">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1">
                {list.map((it, i) => (
                    <div key={it.id} className="relative flex-1 lg:flex-none min-w-[150px]">
                        <button
                            type="button"
                            onClick={() => {
                                setActive(i);
                                setAuto(false);
                            }}
                            className={`relative w-full text-left flex items-center gap-3 rounded-2xl px-4 py-4 border transition overflow-hidden ${
                                i === safe ? 'bg-amber-400/10 border-amber-400/50' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                            } ${!it.is_active ? 'opacity-50' : ''}`}
                        >
                            <span className="w-10 h-10 shrink-0 grid place-items-center rounded-xl bg-amber-400/10 text-amber-300 font-extrabold">
                                <Icon name={it.icon} fallback={null} className="w-5 h-5" />
                                {!ICON_MAP[it.icon] && i + 1}
                            </span>
                            <span className="font-bold">{it.title}</span>
                            {i === safe && auto && !editing && (
                                <span key={safe} className="absolute left-0 bottom-0 h-[3px] bg-amber-400" style={{ animation: 'hys-fill 6s linear both' }} />
                            )}
                        </button>
                        {editing && <ItemTools item={it} first={i === 0} last={i === list.length - 1} onEdit={() => onEdit(it)} />}
                    </div>
                ))}
            </div>

            <div key={cur.id} className="hys-pop relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 md:p-10 flex flex-col justify-center min-h-[240px]">
                <div className="w-16 h-16 grid place-items-center rounded-2xl bg-amber-400/10 text-amber-300 mb-5 text-3xl font-extrabold">
                    <Icon name={cur.icon} className="w-8 h-8" />
                    {!ICON_MAP[cur.icon] && safe + 1}
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 mb-2">
                    Paso {safe + 1} de {list.length}
                </div>
                <h3 className="text-3xl font-extrabold mb-3">{cur.title}</h3>
                <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-line">{cur.text}</p>
            </div>
        </div>
    );
}

function Faq({ list, editing, onEdit }) {
    const [openId, setOpenId] = useState(list[0]?.id ?? null);

    return (
        <div className="max-w-3xl mx-auto space-y-3">
            {list.map((q, i) => {
                const open = openId === q.id;
                return (
                    <Reveal key={q.id} delay={i * 60}>
                        <div className={`relative rounded-2xl border transition ${open ? 'border-amber-400/50 bg-amber-400/[0.05]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'} ${!q.is_active ? 'opacity-50' : ''}`}>
                            {editing && <ItemTools item={q} first={i === 0} last={i === list.length - 1} onEdit={() => onEdit(q)} />}
                            {editing && !q.is_active && <HiddenBadge />}
                            <button type="button" onClick={() => setOpenId(open ? null : q.id)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4">
                                <span className={`font-bold ${editing ? 'pr-44 pt-6' : ''}`}>{q.title}</span>
                                <ChevronDown className={`w-5 h-5 shrink-0 text-amber-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                            </button>
                            <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
                                <div className="overflow-hidden">
                                    <p className="px-5 pb-5 text-slate-300 leading-relaxed whitespace-pre-line">{q.text}</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                );
            })}
        </div>
    );
}

function UserMenu({ user }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onDoc = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    const initial = String(user.name || '?').trim().charAt(0).toUpperCase();
    const item = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10 transition text-left';

    return (
        <div className="flex items-center gap-2" ref={ref}>
            <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-amber-400/60 bg-amber-400/10 text-amber-200 hover:bg-amber-400 hover:text-slate-900 transition">
                <LayoutDashboard className="w-4 h-4" />
                Ir al panel
            </Link>

            <div className="relative">
                <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 pl-1.5 pr-3 py-1.5 transition">
                    <span className="w-8 h-8 grid place-items-center rounded-lg bg-amber-400 text-slate-900 font-extrabold">{initial}</span>
                    <span className="hidden md:block text-sm font-semibold max-w-[130px] truncate">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div className="hys-pop absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/50 p-2">
                        <div className="px-3 py-2.5 mb-1 border-b border-white/10">
                            <div className="font-bold truncate">{user.name}</div>
                            {user.email && <div className="text-xs text-slate-400 truncate">{user.email}</div>}
                        </div>
                        <Link href="/dashboard" className={item} onClick={() => setOpen(false)}>
                            <LayoutDashboard className="w-4 h-4 text-amber-300" />
                            Ir al panel
                        </Link>
                        <Link href="/profile" className={item} onClick={() => setOpen(false)}>
                            <UserRound className="w-4 h-4 text-amber-300" />
                            Mi perfil
                        </Link>
                        <a href="#ayuda" className={item} onClick={() => setOpen(false)}>
                            <LifeBuoy className="w-4 h-4 text-amber-300" />
                            Ayuda y manual
                        </a>
                        <div className="my-1 border-t border-white/10" />
                        <button type="button" className={`${item} !text-rose-300 hover:!bg-rose-500/15`} onClick={() => router.post('/logout')}>
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const norm = (v) =>
    String(v || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

function Manual({ list, editing, onEdit }) {
    const [q, setQ] = useState('');
    const [sel, setSel] = useState(list[0]?.id ?? null);

    const filtered = q.trim() ? list.filter((c) => norm(`${c.title} ${c.text}`).includes(norm(q))) : list;
    const cur = list.find((c) => c.id === sel) ?? filtered[0] ?? list[0];
    const pos = cur ? list.findIndex((c) => c.id === cur.id) : -1;
    if (!cur) return null;

    return (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] gap-6">
            <div>
                <div className="relative mb-3">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en el manual..." className={`${inputCls} pl-10`} />
                </div>
                <div className="space-y-2 max-h-[30rem] overflow-y-auto pr-1">
                    {filtered.length === 0 && <p className="text-sm text-slate-400 px-2 py-4">No hay capítulos que coincidan con la búsqueda.</p>}
                    {filtered.map((c) => {
                        const n = list.findIndex((x) => x.id === c.id);
                        const active = c.id === cur.id;
                        return (
                            <div key={c.id} className="relative">
                                {editing && <ItemTools item={c} first={n === 0} last={n === list.length - 1} onEdit={() => onEdit(c)} />}
                                <button
                                    type="button"
                                    onClick={() => setSel(c.id)}
                                    className={`w-full text-left flex items-center gap-3 rounded-2xl px-4 py-3 border transition ${active ? 'bg-amber-400/10 border-amber-400/50' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'} ${!c.is_active ? 'opacity-50' : ''}`}
                                >
                                    <span className={`w-8 h-8 shrink-0 grid place-items-center rounded-lg text-xs font-extrabold ${active ? 'bg-amber-400 text-slate-900' : 'bg-amber-400/10 text-amber-300'}`}>{n + 1}</span>
                                    <span className={`font-semibold text-sm ${editing ? 'pr-2 pt-8' : ''}`}>{c.title}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <article key={cur.id} className="hys-pop rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-7 md:p-10 flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-400 mb-3">
                    <BookOpen className="w-4 h-4" />
                    Capítulo {pos + 1} de {list.length}
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold mb-5">{cur.title}</h3>
                {cur.image && <SafeImg src={mediaUrl(cur.image)} alt={cur.title} className="mb-6 w-full h-auto rounded-2xl border border-white/10 bg-white" />}
                <p className="text-slate-300 leading-relaxed text-[17px] whitespace-pre-line flex-1">{cur.text}</p>
                <div className="mt-8 flex items-center justify-between gap-3">
                    <button type="button" disabled={pos <= 0} onClick={() => setSel(list[pos - 1].id)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/15 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition">
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </button>
                    <button type="button" disabled={pos >= list.length - 1} onClick={() => setSel(list[pos + 1].id)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition">
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </article>
        </div>
    );
}

function VideoCard({ v, editing, first, last, onPlay, onEdit }) {
    const id = ytId(v.video);
    const poster = v.image ? mediaUrl(v.image) : id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    const fileSrc = !id && v.video ? mediaUrl(v.video) : null;

    return (
        <div className={`relative group ${!v.is_active ? 'opacity-50' : ''}`}>
            {editing && <ItemTools item={v} first={first} last={last} onEdit={onEdit} />}
            {editing && !v.is_active && <HiddenBadge />}
            <button type="button" onClick={onPlay} className="block w-full text-left">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-white/10 group-hover:border-amber-400/50 transition">
                    {poster ? (
                        <SafeImg src={poster} alt={v.title} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : fileSrc ? (
                        <video src={`${fileSrc}#t=0.5`} preload="metadata" muted playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                    ) : (
                        <div className="absolute inset-0 grid place-items-center">
                            <Film className="w-10 h-10 text-slate-600" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-0 grid place-items-center">
                        <span className="relative w-16 h-16 grid place-items-center rounded-full bg-amber-400 text-slate-900 shadow-xl group-hover:scale-110 transition">
                            <span className="absolute inset-0 rounded-full bg-amber-400" style={{ animation: 'hys-ring 1.8s ease-out infinite' }} />
                            <Play className="relative w-7 h-7 translate-x-0.5" fill="currentColor" />
                        </span>
                    </div>
                </div>
                <h3 className="mt-3 font-bold text-lg">{v.title}</h3>
                {v.text && <p className="mt-1 text-sm text-slate-400 leading-relaxed">{v.text}</p>}
            </button>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function Index({ settings: s, items, canEdit }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    const [editing, setEditing] = useState(false);
    const [itemModal, setItemModal] = useState(null); // { section, item }
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [lightbox, setLightbox] = useState(null);
    const [playing, setPlaying] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [toast, setToast] = useState(null);

    const heroBg = useRef(null);
    const heroRef = useRef(null);
    const progress = useRef(null);

    const isEditing = canEdit && editing;
    const closeItem = useCallback(() => setItemModal(null), []);
    const closeSettings = useCallback(() => setSettingsOpen(false), []);
    const closeLightbox = useCallback(() => setLightbox(null), []);
    const closeVideo = useCallback(() => setPlaying(null), []);

    // Scroll: barra de progreso, barra superior opaca y parallax del fondo
    useEffect(() => {
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const y = window.scrollY;
                const max = document.documentElement.scrollHeight - window.innerHeight;
                if (progress.current) progress.current.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
                if (heroBg.current && y < window.innerHeight * 1.2) heroBg.current.style.transform = `translate3d(0, ${y * 0.28}px, 0) scale(1.08)`;
                setScrolled(y > 24);
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    // Si se llega con un ancla (por ejemplo /#ayuda), bajar a esa sección
    useEffect(() => {
        const h = window.location.hash.slice(1);
        if (!h) return undefined;
        const timer = setTimeout(() => document.getElementById(h)?.scrollIntoView({ behavior: 'smooth' }), 450);
        return () => clearTimeout(timer);
    }, []);

    // Mensajes del servidor (guardado, errores)
    useEffect(() => {
        const msg = flash?.success || flash?.error;
        if (!msg) return undefined;
        setToast({ msg, error: !flash?.success });
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [flash?.success, flash?.error]);

    const onHeroMove = (e) => {
        const el = heroRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    const heroMedia = s.hero_media ? mediaUrl(s.hero_media) : DEFAULT_HERO;
    const heroIsVideo = s.hero_media ? s.hero_media_type === 'video' || isVideoUrl(s.hero_media) : false;

    const open = (section, item = null) => setItemModal({ section, item });
    const show = (section) => isEditing || items[section]?.length > 0;

    const navLinks = [
        ['acerca', 'Nosotros'],
        ['recursos', 'Recursos'],
        ['pasos', 'Pasos'],
        ['riesgos', 'Riesgos'],
        ['normativa', 'Normativa'],
        ['galeria', 'Galería'],
        ['videos', 'Videos'],
        ['faq', 'Preguntas'],
        ['ayuda', 'Ayuda'],
    ].filter(([k]) => show(k));

    const photos = items.galeria ?? [];

    // Orden de las secciones (editable por el admin)
    const stored = String(s.section_order || '').split(',').filter((k) => DEFAULT_ORDER.includes(k));
    const order = [...new Set([...stored, ...DEFAULT_ORDER])];
    const ord = (id) => order.indexOf(id);

    const moveSection = (id, dir) => {
        const i = order.indexOf(id);
        const j = dir === 'up' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= order.length) return;
        const next = [...order];
        [next[i], next[j]] = [next[j], next[i]];
        router.post('/portal/sections/order', { order: next }, {
            preserveScroll: true,
            onSuccess: () => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150),
        });
    };

    const mover = (id) =>
        isEditing && (
            <div className="absolute top-3 left-[7%] z-30 flex items-center gap-1 rounded-xl bg-slate-950/90 backdrop-blur border border-amber-400/40 p-1 shadow-xl">
                <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-amber-300">Mover sección</span>
                <ToolBtn title="Subir sección" disabled={ord(id) === 0} onClick={() => moveSection(id, 'up')}>
                    <ArrowUp className="w-4 h-4" />
                </ToolBtn>
                <ToolBtn title="Bajar sección" disabled={ord(id) === order.length - 1} onClick={() => moveSection(id, 'down')}>
                    <ArrowDown className="w-4 h-4" />
                </ToolBtn>
            </div>
        );

    return (
        <div className="relative w-full min-h-screen bg-[#070d1a] text-white overflow-x-hidden font-sans">
            <Head title="Higiene y Seguridad" />
            <PortalStyles />

            {/* Progreso de lectura */}
            <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-transparent">
                <div ref={progress} className="h-full w-0 bg-gradient-to-r from-amber-400 to-emerald-400" />
            </div>

            {/* Barra superior */}
            <nav className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-[5%] border-b transition-colors duration-300 ${scrolled ? 'bg-[#070d1a]/85 backdrop-blur-xl border-white/10' : 'bg-transparent border-transparent'}`}>
                <a href="#inicio" className="flex items-center gap-3 font-extrabold tracking-wider">
                    <span className="w-10 h-10 grid place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-900 shadow-lg shadow-amber-500/20">
                        <ShieldCheck className="w-6 h-6" />
                    </span>
                    <span className="hidden sm:block text-sm">{s.brand_name}</span>
                </a>

                <div className="hidden xl:flex items-center gap-0.5">
                    {navLinks.map(([id, label]) => (
                        <a key={id} href={`#${id}`} className="px-2.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition">
                            {label}
                        </a>
                    ))}
                </div>

                {user ? (
                    <UserMenu user={user} />
                ) : (
                    <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-amber-400/60 bg-amber-400/10 text-amber-200 hover:bg-amber-400 hover:text-slate-900 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20 transition">
                        <LogIn className="w-4 h-4" />
                        Iniciar sesión
                    </Link>
                )}
            </nav>

            {/* Portada */}
            <header id="inicio" ref={heroRef} onMouseMove={onHeroMove} className="hys-noise relative min-h-screen flex items-center px-[7%] pt-32 pb-24 overflow-hidden">
                <div ref={heroBg} className="absolute inset-0 will-change-transform">
                    {heroIsVideo ? (
                        <video key={heroMedia} className="w-full h-full object-cover" src={heroMedia} autoPlay muted loop playsInline />
                    ) : (
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${heroMedia}")` }} />
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#050a14]/95 via-[#050a14]/80 to-[#050a14]/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070d1a] via-transparent to-transparent" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(420px circle at var(--mx, 70%) var(--my, 40%), rgba(251,191,36,.16), transparent 60%)' }} />

                <div className="hys-hero-in relative z-10 max-w-3xl">
                    {s.hero_kicker && (
                        <div className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.22em] text-amber-200 mb-6">
                            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_14px_#fbbf24]" style={{ animation: 'hys-pulse 1.8s infinite' }} />
                            {s.hero_kicker}
                        </div>
                    )}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[84px] font-extrabold leading-[1.02] tracking-tight whitespace-pre-line">
                        {s.hero_title}
                        {s.hero_title && s.hero_highlight ? <br /> : null}
                        <span className="text-amber-400 [text-shadow:0_0_40px_rgba(251,191,36,.25)]">{s.hero_highlight}</span>
                    </h1>
                    {s.hero_text && <p className="mt-6 text-lg leading-relaxed text-slate-300 max-w-2xl whitespace-pre-line">{s.hero_text}</p>}

                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <a href={navLinks[0] ? `#${navLinks[0][0]}` : '#inicio'} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/25 transition">
                            {s.hero_cta || 'Ver más'}
                            <ChevronDown className="w-4 h-4" />
                        </a>
                        {show('videos') && (items.videos?.length > 0 || isEditing) && (
                            <a href="#videos" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur transition">
                                <Play className="w-4 h-4" fill="currentColor" />
                                Ver videos
                            </a>
                        )}
                    </div>

                    <div className="mt-14 hidden sm:flex items-center gap-3 text-xs tracking-[0.2em] text-slate-400" style={{ animation: 'hys-bob 2.4s ease-in-out infinite' }}>
                        <span className="w-8 h-px bg-amber-400" /> DESLIZÁ PARA DESCUBRIR
                    </div>
                </div>

                {/* Datos destacados */}
                {(items.stats?.length > 0 || isEditing) && (
                    <div className="relative z-10 mt-12 lg:mt-0 lg:absolute lg:right-[7%] lg:bottom-[8%] flex flex-wrap gap-3">
                        {(items.stats ?? []).map((st, i, arr) => (
                            <div key={st.id} className={`relative min-w-[140px] px-5 py-4 rounded-2xl border border-white/15 bg-slate-950/60 backdrop-blur-md hover:border-amber-400/50 hover:-translate-y-1 transition ${!st.is_active ? 'opacity-50' : ''}`}>
                                {isEditing && <ItemTools item={st} first={i === 0} last={i === arr.length - 1} onEdit={() => open('stats', st)} />}
                                <div className="text-2xl font-extrabold text-amber-400">
                                    <CountUp value={st.title} />
                                </div>
                                <div className="text-xs text-slate-400">{st.text}</div>
                            </div>
                        ))}
                        {isEditing && (
                            <button type="button" onClick={() => open('stats')} className="min-w-[140px] px-5 py-4 rounded-2xl border-2 border-dashed border-amber-400/40 text-amber-300 text-sm font-semibold hover:bg-amber-400/10 transition flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Dato
                            </button>
                        )}
                    </div>
                )}
            </header>

            <div className="flex flex-col">
            {/* Quiénes somos */}
            {show('acerca') && (
                <section id="acerca" style={{ order: ord('acerca') }} className="relative px-[7%] py-24 scroll-mt-16">
                    {mover('acerca')}
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-12">
                        <div className="lg:sticky lg:top-28 self-start">
                            <SectionHead left eyebrow={s.acerca_eyebrow} title={s.acerca_title} text={s.acerca_text} editing={isEditing} addLabel="Agregar texto" onAdd={() => open('acerca')} />
                        </div>
                        <div className="space-y-6">
                            {items.acerca.map((it, i, arr) => (
                                <Reveal key={it.id} delay={i * 90}>
                                    <article className={`relative rounded-3xl border border-white/10 bg-[#0c1626] p-7 md:p-9 hover:border-amber-400/40 transition ${!it.is_active ? 'opacity-50' : ''}`}>
                                        {isEditing && <ItemTools item={it} first={i === 0} last={i === arr.length - 1} onEdit={() => open('acerca', it)} />}
                                        {isEditing && !it.is_active && <HiddenBadge />}
                                        <div className="text-xs font-extrabold tracking-[0.25em] text-amber-400 mb-3">{String(i + 1).padStart(2, '0')}</div>
                                        <h3 className="text-2xl font-extrabold mb-3">{it.title}</h3>
                                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">{it.text}</p>
                                    </article>
                                </Reveal>
                            ))}
                            {isEditing && <AddTile label="Agregar texto" onClick={() => open('acerca')} />}
                        </div>
                    </div>
                </section>
            )}

            {/* Recursos */}
            {show('recursos') && (
                <section id="recursos" style={{ order: ord('recursos') }} className="relative px-[7%] py-24 scroll-mt-16">
                    {mover('recursos')}
                    <SectionHead eyebrow={s.recursos_eyebrow} title={s.recursos_title} text={s.recursos_text} editing={isEditing} addLabel="Agregar recurso" onAdd={() => open('recursos')} />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {items.recursos.map((it, i, arr) => (
                            <Reveal key={it.id} delay={i * 90} className="h-full">
                                <Tilt className="h-full">
                                    <article className={`relative group h-full overflow-hidden rounded-3xl border border-white/10 bg-[#0c1626] hover:border-amber-400/40 hover:shadow-2xl hover:shadow-black/40 transition ${!it.is_active ? 'opacity-50' : ''}`}>
                                        {isEditing && <ItemTools item={it} first={i === 0} last={i === arr.length - 1} onEdit={() => open('recursos', it)} />}
                                        {isEditing && !it.is_active && <HiddenBadge />}
                                        {it.image && (
                                            <div className="h-48 overflow-hidden bg-slate-800">
                                                <SafeImg src={mediaUrl(it.image)} alt={it.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            {ICON_MAP[it.icon] && (
                                                <div className="w-11 h-11 grid place-items-center rounded-xl bg-amber-400/10 text-amber-300 mb-4 group-hover:scale-110 group-hover:rotate-6 transition">
                                                    <Icon name={it.icon} className="w-5 h-5" />
                                                </div>
                                            )}
                                            <h3 className="text-lg font-bold mb-2">{it.title}</h3>
                                            <p className="text-sm leading-relaxed text-slate-400">{it.text}</p>
                                        </div>
                                    </article>
                                </Tilt>
                            </Reveal>
                        ))}
                        {isEditing && <AddTile label="Agregar recurso" onClick={() => open('recursos')} className="min-h-[300px]" />}
                    </div>
                </section>
            )}

            {/* Pasos interactivos */}
            {show('pasos') && (
                <section id="pasos" style={{ order: ord('pasos') }} className="relative px-[7%] py-24 bg-gradient-to-br from-[#0e1a2d] to-[#0a1220] border-y border-white/5 scroll-mt-16">
                    {mover('pasos')}
                    <SectionHead eyebrow={s.pasos_eyebrow} title={s.pasos_title} text={s.pasos_text} editing={isEditing} addLabel="Agregar paso" onAdd={() => open('pasos')} />
                    <Reveal>
                        <Steps list={items.pasos} editing={isEditing} onEdit={(it) => open('pasos', it)} />
                    </Reveal>
                </section>
            )}

            {/* Riesgos */}
            {show('riesgos') && (
                <section id="riesgos" style={{ order: ord('riesgos') }} className="relative px-[7%] py-24 scroll-mt-16">
                    {mover('riesgos')}
                    <SectionHead eyebrow={s.riesgos_eyebrow} title={s.riesgos_title} text={s.riesgos_text} editing={isEditing} addLabel="Agregar riesgo" onAdd={() => open('riesgos')} />
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {items.riesgos.map((it, i, arr) => (
                            <Reveal key={it.id} delay={(i % 3) * 80} className="h-full">
                                <article className={`relative group h-full rounded-3xl border border-white/10 bg-[#0c1626] p-6 hover:border-amber-400/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40 transition ${!it.is_active ? 'opacity-50' : ''}`}>
                                    {isEditing && <ItemTools item={it} first={i === 0} last={i === arr.length - 1} onEdit={() => open('riesgos', it)} />}
                                    {isEditing && !it.is_active && <HiddenBadge />}
                                    <span className="w-12 h-12 grid place-items-center rounded-2xl bg-amber-400/10 text-amber-300 mb-4 group-hover:bg-amber-400 group-hover:text-slate-900 group-hover:rotate-6 transition">
                                        <Icon name={it.icon} fallback={TriangleAlert} className="w-6 h-6" />
                                    </span>
                                    <h3 className="text-lg font-extrabold mb-2">{it.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{it.text}</p>
                                </article>
                            </Reveal>
                        ))}
                        {isEditing && <AddTile label="Agregar riesgo" onClick={() => open('riesgos')} className="min-h-[200px]" />}
                    </div>
                </section>
            )}

            {/* Normativa */}
            {show('normativa') && (
                <section id="normativa" style={{ order: ord('normativa') }} className="relative px-[7%] py-24 scroll-mt-16">
                    {mover('normativa')}
                    <SectionHead eyebrow={s.normativa_eyebrow} title={s.normativa_title} text={s.normativa_text} editing={isEditing} addLabel="Agregar norma" onAdd={() => open('normativa')} />
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
                        {items.normativa.map((it, i, arr) => (
                            <Reveal key={it.id} delay={(i % 2) * 90}>
                                <Tilt className="h-full">
                                    <article className={`relative h-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-7 hover:border-amber-400/40 transition ${!it.is_active ? 'opacity-50' : ''}`}>
                                        {isEditing && <ItemTools item={it} first={i === 0} last={i === arr.length - 1} onEdit={() => open('normativa', it)} />}
                                        {isEditing && !it.is_active && <HiddenBadge />}
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="w-12 h-12 shrink-0 grid place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
                                                <Icon name={it.icon} fallback={Scale} className="w-6 h-6" />
                                            </span>
                                            <h3 className="text-xl font-extrabold">{it.title}</h3>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">{it.text}</p>
                                    </article>
                                </Tilt>
                            </Reveal>
                        ))}
                        {isEditing && <AddTile label="Agregar norma" onClick={() => open('normativa')} />}
                    </div>
                </section>
            )}

            {/* Galería */}
            {show('galeria') && (
                <section id="galeria" style={{ order: ord('galeria') }} className="relative px-[7%] py-24 scroll-mt-16">
                    {mover('galeria')}
                    <SectionHead eyebrow={s.galeria_eyebrow} title={s.galeria_title} text={s.galeria_text} editing={isEditing} addLabel="Agregar foto" onAdd={() => open('galeria')} />
                    <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-4">
                        {photos.map((p, i) => (
                            <Reveal key={p.id} delay={(i % 3) * 90} className="break-inside-avoid mb-4">
                                <div className={`relative group overflow-hidden rounded-2xl border border-white/10 bg-slate-800 cursor-zoom-in ${!p.is_active ? 'opacity-50' : ''}`} onClick={() => setLightbox(i)}>
                                    {isEditing && <ItemTools item={p} first={i === 0} last={i === photos.length - 1} onEdit={() => open('galeria', p)} />}
                                    {isEditing && !p.is_active && <HiddenBadge />}
                                    <SafeImg src={mediaUrl(p.image)} alt={p.title || ''} className="w-full block transition duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                                        <span className="text-sm font-semibold">{p.title || 'Ver foto'}</span>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                        {isEditing && (
                            <div className="break-inside-avoid mb-4">
                                <AddTile label="Agregar foto" onClick={() => open('galeria')} className="min-h-[200px]" />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Buenas prácticas */}
            {show('practicas') && (
                <section id="practicas" style={{ order: ord('practicas') }} className="relative px-[7%] py-24 bg-gradient-to-br from-[#0e1a2d] to-[#0a1220] border-y border-white/5 scroll-mt-16">
                    {mover('practicas')}
                    <SectionHead eyebrow={s.practicas_eyebrow} title={s.practicas_title} text={s.practicas_text} editing={isEditing} addLabel="Agregar práctica" onAdd={() => open('practicas')} />
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
                        {items.practicas.map((it, i, arr) => (
                            <Reveal key={it.id} delay={(i % 2) * 80}>
                                <div className={`relative group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.07] hover:border-amber-400/40 hover:-translate-y-1 transition ${!it.is_active ? 'opacity-50' : ''}`}>
                                    {isEditing && <ItemTools item={it} first={i === 0} last={i === arr.length - 1} onEdit={() => open('practicas', it)} />}
                                    {isEditing && !it.is_active && <HiddenBadge />}
                                    <span className="w-11 h-11 shrink-0 grid place-items-center rounded-xl bg-amber-400/10 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-900 transition">
                                        <Icon name={it.icon} fallback={CircleCheck} className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <h3 className="font-bold mb-1">{it.title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">{it.text}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                        {isEditing && <AddTile label="Agregar práctica" onClick={() => open('practicas')} className="min-h-[110px]" />}
                    </div>
                </section>
            )}

            {/* Emergencias */}
            {show('emergencia') && (
                <section id="emergencia" style={{ order: ord('emergencia') }} className="relative px-[7%] py-24 scroll-mt-16">
                    {mover('emergencia')}
                    <SectionHead eyebrow={s.emergencia_eyebrow} title={s.emergencia_title} text={s.emergencia_text} editing={isEditing} addLabel="Agregar paso" onAdd={() => open('emergencia')} />
                    <div className="max-w-3xl mx-auto relative">
                        <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-amber-400/60 via-amber-400/20 to-transparent" />
                        <div className="space-y-5">
                            {items.emergencia.map((it, i, arr) => (
                                <Reveal key={it.id} delay={i * 70}>
                                    <div className={`relative flex gap-5 ${!it.is_active ? 'opacity-50' : ''}`}>
                                        <span className="relative z-10 w-12 h-12 shrink-0 grid place-items-center rounded-full bg-amber-400 text-slate-900 font-extrabold shadow-lg shadow-amber-400/20">
                                            {i + 1}
                                        </span>
                                        <div className="relative flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.07] hover:border-amber-400/40 transition">
                                            {isEditing && <ItemTools item={it} first={i === 0} last={i === arr.length - 1} onEdit={() => open('emergencia', it)} />}
                                            {isEditing && !it.is_active && <HiddenBadge />}
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <Icon name={it.icon} className="w-5 h-5 text-amber-300" />
                                                <h3 className="font-extrabold text-lg">{it.title}</h3>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{it.text}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                        {isEditing && <div className="mt-5 ml-16"><AddTile label="Agregar paso" onClick={() => open('emergencia')} className="min-h-[110px]" /></div>}
                    </div>
                </section>
            )}

            {/* Videos */}
            {show('videos') && (
                <section id="videos" style={{ order: ord('videos') }} className="relative px-[7%] py-24 bg-gradient-to-br from-[#0e1a2d] to-[#0a1220] border-t border-white/5 scroll-mt-16">
                    {mover('videos')}
                    <SectionHead eyebrow={s.videos_eyebrow} title={s.videos_title} text={s.videos_text} editing={isEditing} addLabel="Agregar video" onAdd={() => open('videos')} />
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.videos.map((v, i, arr) => (
                            <Reveal key={v.id} delay={(i % 3) * 90}>
                                <VideoCard v={v} editing={isEditing} first={i === 0} last={i === arr.length - 1} onPlay={() => setPlaying(v)} onEdit={() => open('videos', v)} />
                            </Reveal>
                        ))}
                        {isEditing && <AddTile label="Agregar video" onClick={() => open('videos')} className="aspect-video" />}
                    </div>
                </section>
            )}

            {/* Preguntas frecuentes */}
            {show('faq') && (
                <section id="faq" style={{ order: ord('faq') }} className="relative px-[7%] py-24 scroll-mt-16">
                    {mover('faq')}
                    <SectionHead eyebrow={s.faq_eyebrow} title={s.faq_title} text={s.faq_text} editing={isEditing} addLabel="Agregar pregunta" onAdd={() => open('faq')} />
                    <Faq list={items.faq} editing={isEditing} onEdit={(it) => open('faq', it)} />
                </section>
            )}

            {/* Ayuda: manual de usuario */}
            {show('ayuda') && (
                <section id="ayuda" style={{ order: ord('ayuda') }} className="relative px-[7%] py-24 bg-gradient-to-br from-[#0e1a2d] to-[#0a1220] border-t border-white/5 scroll-mt-16">
                    {mover('ayuda')}
                    <SectionHead eyebrow={s.ayuda_eyebrow} title={s.ayuda_title} text={s.ayuda_text} editing={isEditing} addLabel="Agregar capítulo" onAdd={() => open('ayuda')} />
                    <div className="-mt-6 mb-10 text-center">
                        <a href="/manual/Manual-de-usuario-HyS.pdf" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/25 transition">
                            <Download className="w-4 h-4" />
                            Descargar el manual completo (PDF)
                        </a>
                    </div>
                    <Reveal>
                        <Manual list={items.ayuda} editing={isEditing} onEdit={(it) => open('ayuda', it)} />
                    </Reveal>
                </section>
            )}
            </div>

            {/* Cierre */}
            {(s.cta_title || s.cta_text) && (
                <section className="px-[7%] pb-24">
                    <Reveal>
                        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-[2rem] border border-amber-400/30 bg-gradient-to-br from-amber-400/15 via-[#0c1626] to-[#0c1626] p-10 md:p-14 text-center">
                            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
                            <h2 className="relative text-3xl md:text-4xl font-extrabold tracking-tight">{s.cta_title}</h2>
                            {s.cta_text && <p className="relative mt-4 max-w-2xl mx-auto text-slate-300 leading-relaxed whitespace-pre-line">{s.cta_text}</p>}
                            <Link href={user ? '/dashboard' : '/login'} className="relative mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/25 transition">
                                {user ? 'Ir al panel' : 'Iniciar sesión'}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </Reveal>
                </section>
            )}

            <footer className={`px-[7%] py-8 border-t border-white/10 text-xs text-slate-500 flex flex-col sm:flex-row gap-2 justify-between ${canEdit ? 'pb-28' : ''}`}>
                <span>{s.footer_left}</span>
                <span>{s.footer_right}</span>
            </footer>

            {/* Barra flotante del administrador */}
            {canEdit && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[65] flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/90 backdrop-blur-xl px-3 py-2.5 shadow-2xl shadow-black/50 max-w-[94vw]">
                    <button
                        type="button"
                        onClick={() => setEditing((v) => !v)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${editing ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-white hover:bg-white/15'}`}
                    >
                        <Pencil className="w-4 h-4" />
                        {editing ? 'Salir de edición' : 'Modo edición'}
                    </button>
                    {editing && (
                        <button type="button" onClick={() => setSettingsOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/15">
                            <Settings2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Textos y portada</span>
                        </button>
                    )}
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden sm:inline">Panel</span>
                    </Link>
                </div>
            )}

            {/* Aviso */}
            {toast && (
                <div className={`hys-pop fixed top-20 right-5 z-[90] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl ${toast.error ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-900'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Modales */}
            {itemModal && <ItemModal key={`${itemModal.section}-${itemModal.item?.id ?? 'new'}`} section={itemModal.section} item={itemModal.item} onClose={closeItem} />}
            {settingsOpen && <SettingsModal settings={s} onClose={closeSettings} />}
            {lightbox !== null && photos.length > 0 && <Lightbox photos={photos} index={Math.min(lightbox, photos.length - 1)} onIndex={setLightbox} onClose={closeLightbox} />}
            {playing && <VideoModal video={playing} onClose={closeVideo} />}
        </div>
    );
}
