import React, { useCallback, useEffect, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Check,
    CheckCircle2,
    Download,
    FileText,
    Film,
    LayoutDashboard,
    LogOut,
    Paperclip,
    Pencil,
    ShieldCheck,
    Upload,
    X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Utilidades y normalización de textos por defecto                    */
/* ------------------------------------------------------------------ */

const isUrl = (v) => /^https?:\/\//i.test(v || '');
const mediaUrl = (v) => (!v ? null : isUrl(v) || String(v).startsWith('/') ? v : `/storage/${v}`);
const isVideoUrl = (v) => /\.(mp4|webm|mov)(\?.*)?$/i.test(v || '');

// Si en la base quedaron los textos viejos de plantilla, usamos los textos técnicos sobrios
const LEGACY_TEXTS = {
    brand_name: ['HIGIENE Y SEGURIDAD'],
    hero_kicker: ['Prevención · Protección · Concientización'],
    hero_title: ['Seguridad que'],
    hero_highlight: ['empieza con vos.'],
    hero_text: [
        "Información, recursos y buenas prácticas para construir ambientes de trabajo más seguros, saludables y responsables.\n\nPrevenir los riesgos, cuidar a las personas y cumplir con la normativa es una tarea de todos los días, y empieza por cada uno de nosotros.",
        'Plataforma integral de Higiene y Seguridad para la gestión de establecimientos, relevamientos técnicos y seguimiento de actividades.',
    ],
    hero_cta: ['Descubrí nuestros recursos'],
    footer_left: ['© 2026 Higiene y Seguridad'],
    footer_right: ['Prevención · Protección · Bienestar'],
};

const TECHNICAL_DEFAULTS = {
    brand_name: 'HyS Control',
    hero_kicker: 'GESTIÓN TÉCNICA · LEY 19.587 / DEC. 351/79',
    hero_title: 'Control de relevamientos e inspecciones',
    hero_highlight: 'de Higiene y Seguridad.',
    hero_text:
        'Registro de establecimientos, actas de verificación por categoría normativa, seguimiento de desvíos con fechas de regulación y emisión de informes técnicos en PDF.',
    hero_cta: 'Ingresar al sistema',
    footer_left: '© 2026 HyS Control — Sistema de Higiene y Seguridad Laboral',
    footer_right: 'Ley 19.587 · Decreto 351/79',
};

function resolveSetting(settings, key) {
    const raw = settings?.[key];
    if (!raw || (LEGACY_TEXTS[key] && LEGACY_TEXTS[key].includes(raw))) {
        return TECHNICAL_DEFAULTS[key] ?? '';
    }
    return raw;
}

const inputCls =
    'w-full rounded-lg bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition';

const PORTAL_FIELDS = [
    ['brand_name', 'Nombre del sistema'],
    ['hero_kicker', 'Encabezado normativo'],
    ['hero_title', 'Título principal'],
    ['hero_highlight', 'Segunda línea del título'],
    ['hero_text', 'Descripción operativa', true],
    ['hero_cta', 'Texto del botón de acceso'],
    ['footer_left', 'Pie de página (izquierda)'],
    ['footer_right', 'Pie de página (derecha)'],
];

const SAMPLE_CHECKLIST = [
    {
        code: '01.04',
        category: 'Instalaciones Eléctricas',
        item: 'Protección diferencial y puesta a tierra con protocolo vigente',
        status: 'ok',
        statusLabel: 'SÍ · CUMPLE',
    },
    {
        code: '03.02',
        category: 'Protección contra Incendios',
        item: 'Dotación y control de carga de extintores manuales según riesgo',
        status: 'no',
        statusLabel: 'NO · REGULARIZAR',
        note: 'Recarga pendiente de 2 unidades ABC 5 kg en sector depósito.',
        dueDate: 'Regulación: 18/11/2026',
        agreed: true,
    },
    {
        code: '04.01',
        category: 'Medios de Escape y Evacuación',
        item: 'Señalización reglamentaria y salidas de emergencia libres de obstrucción',
        status: 'ok',
        statusLabel: 'SÍ · CUMPLE',
    },
    {
        code: '06.03',
        category: 'Elementos de Protección Personal',
        item: 'Constancia firmada de entrega de calzado de seguridad y protección auditiva',
        status: 'ok',
        statusLabel: 'SÍ · CUMPLE',
    },
];

/* ------------------------------------------------------------------ */
/* Modal de edición de portada (solo Admin)                            */
/* ------------------------------------------------------------------ */

function Field({ label, error, hint, children }) {
    return (
        <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {label}
            </label>
            {children}
            {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
            {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
        </div>
    );
}

function SettingsModal({ settings, onClose }) {
    const initial = {
        hero_media_file: null,
        hero_media_url: isUrl(settings.hero_media) ? settings.hero_media : '',
        remove_hero_media: false,
    };
    PORTAL_FIELDS.forEach(([k]) => {
        initial[k] = resolveSetting(settings, k);
    });

    const { data, setData, post, processing, errors } = useForm(initial);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const submit = (e) => {
        e.preventDefault();
        post('/portal/settings', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const heroSrc = settings.hero_media && !data.remove_hero_media ? mediaUrl(settings.hero_media) : null;

    return (
        <div
            className="fixed inset-0 z-[70] grid place-items-center p-4 bg-slate-900/50 backdrop-blur-xs"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl">
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                        Configuración de portada
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6">
                    <div className="grid sm:grid-cols-2 gap-x-4">
                        {PORTAL_FIELDS.map(([key, label, area]) => (
                            <div key={key} className={area || key.startsWith('hero_') ? 'sm:col-span-2' : ''}>
                                <Field label={label} error={errors[key]}>
                                    {area ? (
                                        <textarea
                                            rows={3}
                                            className={inputCls}
                                            value={data[key]}
                                            onChange={(e) => setData(key, e.target.value)}
                                        />
                                    ) : (
                                        <input
                                            className={inputCls}
                                            value={data[key]}
                                            onChange={(e) => setData(key, e.target.value)}
                                        />
                                    )}
                                </Field>
                            </div>
                        ))}
                    </div>

                    <Field
                        label="Imagen de fondo (opcional)"
                        error={errors.hero_media_file || errors.hero_media_url}
                        hint="Si se deja vacío, se mantiene el fondo técnico limpio."
                    >
                        {heroSrc && (
                            <div className="mb-2.5 flex items-center gap-3">
                                {settings.hero_media_type === 'video' ? (
                                    <span className="w-20 h-14 grid place-items-center rounded-lg bg-slate-100 border border-slate-200">
                                        <Film className="w-5 h-5 text-slate-700" />
                                    </span>
                                ) : (
                                    <img
                                        src={heroSrc}
                                        alt=""
                                        className="w-20 h-14 rounded-lg object-cover border border-slate-200"
                                    />
                                )}
                                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remove_hero_media}
                                        onChange={(e) => setData('remove_hero_media', e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Quitar fondo personalizado
                                </label>
                            </div>
                        )}
                        <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 px-3 py-2 text-sm text-slate-600 transition">
                            <Upload className="w-4 h-4 text-slate-600 shrink-0" />
                            <span className="truncate">
                                {data.hero_media_file ? data.hero_media_file.name : 'Seleccionar imagen o video'}
                            </span>
                            <input
                                type="file"
                                accept="image/*,video/mp4,video/webm,video/quicktime"
                                className="hidden"
                                onChange={(e) => setData('hero_media_file', e.target.files?.[0] ?? null)}
                            />
                        </label>
                        <input
                            className={`${inputCls} mt-2`}
                            value={data.hero_media_url}
                            onChange={(e) => setData('hero_media_url', e.target.value)}
                            placeholder="URL externa opcional (https://...)"
                        />
                    </Field>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            <Check className="w-4 h-4" />
                            {processing ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Portada Principal — Diseño Técnico Profesional                      */
/* ------------------------------------------------------------------ */

export default function Index({ settings: s = {}, canEdit = false }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const closeSettings = useCallback(() => setSettingsOpen(false), []);

    useEffect(() => {
        const msg = flash?.success || flash?.error;
        if (!msg) return undefined;
        setToast({ msg, error: !flash?.success });
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [flash?.success, flash?.error]);

    const brandName = resolveSetting(s, 'brand_name');
    const heroKicker = resolveSetting(s, 'hero_kicker');
    const heroTitle = resolveSetting(s, 'hero_title');
    const heroHighlight = resolveSetting(s, 'hero_highlight');
    const heroText = resolveSetting(s, 'hero_text');
    const heroCta = resolveSetting(s, 'hero_cta');
    const footerLeft = resolveSetting(s, 'footer_left');
    const footerRight = resolveSetting(s, 'footer_right');

    const customMedia = s.hero_media ? mediaUrl(s.hero_media) : null;
    const heroIsVideo = customMedia ? s.hero_media_type === 'video' || isVideoUrl(s.hero_media) : false;

    return (
        <div className="relative w-full min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Higiene y Seguridad" />

            {/* Línea institucional superior de 4px */}
            <div className="w-full h-1 bg-slate-900 flex">
                <div className="w-48 h-full bg-blue-600" />
            </div>

            {/* Medio de fondo opcional si el admin subió uno */}
            {customMedia && (
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    {heroIsVideo ? (
                        <video
                            key={customMedia}
                            className="w-full h-full object-cover"
                            src={customMedia}
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url("${customMedia}")` }}
                        />
                    )}
                </div>
            )}

            {/* Controles discretos en esquina superior derecha (solo con sesión activa o admin) */}
            {(canEdit || user) && (
                <div className="fixed top-5 right-6 z-40 flex items-center gap-2">
                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => setSettingsOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition"
                            title="Editar textos de portada"
                        >
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                            <span>Configurar portada</span>
                        </button>
                    )}

                    {user && (
                        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-white border border-slate-300 shadow-2xs">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900 text-white hover:bg-blue-700 transition"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                Panel ({user.name?.split(' ')[0]})
                            </Link>
                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                title="Cerrar sesión"
                                className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Contenido Principal */}
            <main className="relative z-10 flex-1 flex items-center px-6 sm:px-10 lg:px-16 py-10">
                <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                    {/* Columna Izquierda */}
                    <div className="lg:col-span-6">
                        {/* Marca institucional sobria */}
                        <div className="inline-flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="font-bold text-base tracking-tight text-slate-900 leading-none">
                                    {brandName}
                                </div>
                                <div className="font-mono text-[11px] text-slate-500 mt-1">
                                    {heroKicker}
                                </div>
                            </div>
                        </div>

                        {/* Título sólido sin degradados artificiales */}
                        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 leading-[1.15] tracking-tight">
                            {heroTitle}{' '}
                            <span className="text-blue-700">
                                {heroHighlight}
                            </span>
                        </h1>

                        {heroText && (
                            <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-xl">
                                {heroText}
                            </p>
                        )}

                        {/* Acciones principales */}
                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <Link
                                href={user ? '/dashboard' : '/login'}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-blue-700 transition"
                            >
                                {user ? 'Ir al panel de control' : heroCta}
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <a
                                id="ayuda"
                                href="/manual/Manual-de-usuario-HyS.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition"
                            >
                                <Download className="w-4 h-4 text-slate-500" />
                                Manual de usuario (PDF)
                            </a>
                        </div>

                        {/* Especificaciones operativas en texto limpio (sin tarjetas repetitivas) */}
                        <dl className="mt-9 pt-6 border-t border-slate-200 grid sm:grid-cols-3 gap-5 text-xs">
                            <div>
                                <dt className="font-bold text-slate-900">Importación documental</dt>
                                <dd className="mt-1 text-slate-500 leading-normal">
                                    Lectura de actas previas en formato PDF y Word (.docx).
                                </dd>
                            </div>
                            <div>
                                <dt className="font-bold text-slate-900">Seguimiento de desvíos</dt>
                                <dd className="mt-1 text-slate-500 leading-normal">
                                    Plazos de regulación vinculados a la agenda de inspectores.
                                </dd>
                            </div>
                            <div>
                                <dt className="font-bold text-slate-900">Salidas y reportes</dt>
                                <dd className="mt-1 text-slate-500 leading-normal">
                                    Emisión de formularios en PDF con fotos y planillas CSV.
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Columna Derecha: Vista previa de una Planilla / Acta de Relevamiento real */}
                    <div className="lg:col-span-6">
                        <div className="rounded-xl bg-white border border-slate-300 shadow-sm overflow-hidden">
                            {/* Encabezado técnico de planilla */}
                            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                    <span className="text-xs font-bold uppercase tracking-wider truncate">
                                        Planilla de Relevamiento General
                                    </span>
                                </div>
                                <span className="font-mono text-[11px] text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 shrink-0">
                                    DECRETO 351/79
                                </span>
                            </div>

                            {/* Datos del establecimiento de muestra */}
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3 text-xs">
                                <div>
                                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                                        Establecimiento
                                    </span>
                                    <span className="font-semibold text-slate-800 truncate block">
                                        Metalúrgica del Sur S.A.
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                                        CUIT
                                    </span>
                                    <span className="font-mono text-slate-700 block">
                                        30-71429810-4
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                                        Estado general
                                    </span>
                                    <span className="font-semibold text-amber-700 block">
                                        1 ítem en seguimiento
                                    </span>
                                </div>
                            </div>

                            {/* Filas reales del checklist */}
                            <div className="divide-y divide-slate-200">
                                {SAMPLE_CHECKLIST.map((row) => (
                                    <div key={row.code} className="px-5 py-3 text-xs">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[11px] font-semibold text-slate-400">
                                                        #{row.code}
                                                    </span>
                                                    <span className="text-[11px] font-semibold text-slate-500">
                                                        {row.category}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 font-medium text-slate-900">
                                                    {row.item}
                                                </p>
                                            </div>

                                            {row.status === 'ok' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {row.statusLabel}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {row.statusLabel}
                                                </span>
                                            )}
                                        </div>

                                        {row.note && (
                                            <div className="mt-2 pl-3 border-l-2 border-amber-400 bg-amber-50/50 py-1.5 px-2.5 rounded-r text-[11px] text-slate-700">
                                                <div className="font-medium text-slate-800">
                                                    Recomendación: {row.note}
                                                </div>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-3 text-slate-500 font-mono text-[10px]">
                                                    <span>{row.dueDate}</span>
                                                    {row.agreed && <span>· Acordado con titular</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pie de planilla */}
                            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                                <span className="inline-flex items-center gap-1.5 text-slate-500">
                                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                                    Evidencia fotográfica y firma digital
                                </span>
                                <Link
                                    href={user ? '/dashboard' : '/login'}
                                    className="font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
                                >
                                    {user ? 'Abrir panel' : 'Acceder al sistema'}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Pie de página sobrio */}
            <footer className="relative z-10 px-6 sm:px-10 lg:px-16 py-4 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row gap-2 items-center justify-between">
                <span>{footerLeft}</span>
                <span className="font-mono text-[11px] text-slate-400">{footerRight}</span>
            </footer>

            {/* Notificación */}
            {toast && (
                <div
                    className={`fixed top-16 right-6 z-[90] px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg ${
                        toast.error ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
                    }`}
                >
                    {toast.msg}
                </div>
            )}

            {/* Modal de edición */}
            {settingsOpen && <SettingsModal settings={s} onClose={closeSettings} />}
        </div>
    );
}
