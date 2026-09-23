import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft,
    FileUp,
    FileDown,
    Loader2,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    X,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    ClipboardPaste,
    Camera,
    Image as ImageIcon,
    Save,
    RotateCcw,
    ClipboardList,
    Pencil,
    Check,
    Plus,
    Trash2,
    ExternalLink,
} from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'SI', label: 'SI', activeClass: 'bg-emerald-600 text-white border-emerald-600' },
    { value: 'NO', label: 'NO', activeClass: 'bg-rose-600 text-white border-rose-600' },
    { value: 'NO_APLICA', label: 'N/A', activeClass: 'bg-slate-500 text-white border-slate-500' },
];

const NO_CATEGORY = 'Sin categoría';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const jsonHeaders = { headers: { Accept: 'application/json' } };

const inputClass =
    'text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none';

// Extrae un mensaje legible de un error de axios (incluye errores de validación de Laravel)
function errMsg(err, fallback = 'Ocurrió un error. Probá de nuevo.') {
    const data = err?.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first) && first[0]) return first[0];
    }
    return data?.message || fallback;
}

// Valida una imagen antes de aceptarla (mismas reglas que el server: jpeg/png/webp, máx. 5 MB)
function validateImage(file) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Formato no soportado. Usá JPG, PNG o WEBP.';
    }
    if (file.size > MAX_IMAGE_BYTES) {
        return 'La foto pesa más de 5 MB. Probá con una más liviana.';
    }
    return null;
}

export default function CompaniesChecklist({ company, items }) {
    const [stage, setStage] = useState(items && items.length > 0 ? 'saved' : 'upload'); // upload | draft | saved
    const [draftItems, setDraftItems] = useState([]);
    const [savedItems, setSavedItems] = useState(items || []);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null); // { done, total }
    const [pageError, setPageError] = useState('');
    const [pageNotice, setPageNotice] = useState('');
    const [sync, setSync] = useState('idle'); // idle | saving | saved | error
    const [viewer, setViewer] = useState(null); // { title, images: [{src,label}], index }
    const [downloading, setDownloading] = useState(false);

    const keyCounter = useRef(0);
    const newKey = () => `d${++keyCounter.current}`;
    const pendingSaves = useRef(new Set());

    // Registra una promesa de guardado para poder esperarla antes de descargar el PDF
    const track = (promise) => {
        pendingSaves.current.add(promise);
        promise.finally(() => pendingSaves.current.delete(promise)).catch(() => {});
        return promise;
    };

    // Sincroniza con props frescas del server
    useEffect(() => {
        if (items && items.length > 0) {
            setSavedItems(items);
            setStage('saved');
            setDraftItems([]);
        }
    }, [items]);

    // Si se borraron todos los ítems guardados, volvemos a la pantalla de carga
    const effectiveStage = stage === 'saved' && savedItems.length === 0 ? 'upload' : stage;

    // Liberar previews locales al salir
    const draftRef = useRef(draftItems);
    draftRef.current = draftItems;
    useEffect(
        () => () => {
            draftRef.current.forEach((d) => d.photos.forEach((p) => p && URL.revokeObjectURL(p.url)));
        },
        []
    );

    // --- Carga y extracción del PDF ---
    const [pdfState, setPdfState] = useState('idle'); // idle | loading | error
    const [pdfFileName, setPdfFileName] = useState(null);
    const [pdfMessage, setPdfMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const processFile = useCallback(
        async (file) => {
            if (!file || file.type !== 'application/pdf') {
                setPdfState('error');
                setPdfMessage('Eso no parece ser un PDF.');
                return;
            }
            setPdfFileName(file.name);
            setPdfState('loading');
            setPdfMessage('');

            const formData = new FormData();
            formData.append('pdf', file);

            try {
                const res = await axios.post(`/companies/${company.id}/checklist/extract`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const parsed = res.data.items.map((it) => ({
                    _key: `d${++keyCounter.current}`,
                    item_number: it.item_number,
                    category: it.category,
                    question: it.question,
                    reference: it.reference,
                    status: null,
                    description: '',
                    photos: [null, null], // [{file, url}, {file, url}] — se suben al guardar
                }));
                setDraftItems(parsed);
                setStage('draft');
                setPdfState('idle');
                setPageError('');
            } catch (err) {
                setPdfState('error');
                setPdfMessage(err.response?.data?.message || 'No se pudo procesar el PDF. Probá con otro archivo.');
            }
        },
        [company.id]
    );

    const handlePdfChange = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };
    useEffect(() => {
        const handlePaste = (e) => {
            const file = Array.from(e.clipboardData?.files || []).find((f) => f.type === 'application/pdf');
            if (file) {
                e.preventDefault();
                processFile(file);
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [processFile]);

    const revokeDraftUrls = (list) => list.forEach((d) => d.photos.forEach((p) => p && URL.revokeObjectURL(p.url)));

    const cancelDraft = () => {
        revokeDraftUrls(draftItems);
        setDraftItems([]);
        setPdfFileName(null);
        setPdfState('idle');
        setPageError('');
        setStage(savedItems.length > 0 ? 'saved' : 'upload');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startReplace = () => {
        setStage('upload');
        setPdfFileName(null);
        setPdfState('idle');
    };

    // ---------- BORRADOR (todavía sin guardar) ----------
    const updateDraft = (key, field, value) =>
        setDraftItems((prev) => prev.map((it) => (it._key === key ? { ...it, [field]: value } : it)));

    const setDraftPhoto = (key, slotIdx, file) => {
        const problem = validateImage(file);
        if (problem) {
            setPageError(problem);
            return;
        }
        setPageError('');
        setDraftItems((prev) =>
            prev.map((it) => {
                if (it._key !== key) return it;
                const photos = [...it.photos];
                if (photos[slotIdx]) URL.revokeObjectURL(photos[slotIdx].url);
                photos[slotIdx] = { file, url: URL.createObjectURL(file) };
                return { ...it, photos };
            })
        );
    };

    const removeDraftPhoto = (key, slotIdx) =>
        setDraftItems((prev) =>
            prev.map((it) => {
                if (it._key !== key) return it;
                const photos = [...it.photos];
                if (photos[slotIdx]) URL.revokeObjectURL(photos[slotIdx].url);
                photos[slotIdx] = null;
                return { ...it, photos };
            })
        );

    const addDraftItem = (category) => {
        const nextNumber = draftItems.reduce((m, it) => Math.max(m, it.item_number), 0) + 1;
        setDraftItems((prev) => [
            ...prev,
            {
                _key: newKey(),
                item_number: nextNumber,
                category: category === NO_CATEGORY ? null : category,
                question: 'Nuevo ítem',
                reference: '',
                status: null,
                description: '',
                photos: [null, null],
            },
        ]);
    };

    const deleteDraftItem = (key) => {
        setDraftItems((prev) => {
            const target = prev.find((it) => it._key === key);
            if (target) revokeDraftUrls([target]);
            return prev.filter((it) => it._key !== key);
        });
    };

    // Guarda el relevamiento y DESPUÉS sube las fotos que ya se habían adjuntado
    const saveChecklist = async () => {
        setSaving(true);
        setPageError('');
        setPageNotice('');
        try {
            const payload = [...draftItems]
                .sort((a, b) => a.item_number - b.item_number)
                .map(({ _key, photos, ...rest }) => rest);

            const res = await axios.post(`/companies/${company.id}/checklist`, { items: payload }, jsonHeaders);
            let saved = res.data.items;
            const byNumber = new Map(saved.map((i) => [i.item_number, i]));

            const pending = [];
            draftItems.forEach((d) =>
                d.photos.forEach((p, idx) => {
                    const target = byNumber.get(d.item_number);
                    if (p && target) pending.push({ id: target.id, slot: idx + 1, file: p.file, number: d.item_number });
                })
            );

            let failed = 0;
            if (pending.length > 0) setUploadProgress({ done: 0, total: pending.length });
            for (let i = 0; i < pending.length; i++) {
                const job = pending[i];
                try {
                    const fd = new FormData();
                    fd.append('slot', job.slot);
                    fd.append('photo', job.file);
                    const r = await axios.post(`/checklist-items/${job.id}/photo`, fd, {
                        headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
                    });
                    saved = saved.map((it) => (it.id === job.id ? r.data.item : it));
                } catch {
                    failed++;
                }
                setUploadProgress({ done: i + 1, total: pending.length });
            }

            revokeDraftUrls(draftItems);
            setSavedItems(saved);
            setDraftItems([]);
            setStage('saved');
            setPageNotice(
                failed > 0
                    ? `Relevamiento guardado, pero ${failed} foto(s) no se pudieron subir. Podés volver a agregarlas desde cada ítem.`
                    : 'Relevamiento guardado correctamente.'
            );
        } catch (err) {
            setPageError(errMsg(err, 'No se pudo guardar el relevamiento.'));
        } finally {
            setSaving(false);
            setUploadProgress(null);
        }
    };

    // ---------- GUARDADO (edición en vivo contra el server) ----------
    const patchSavedItem = (id, fields) => {
        setSync('saving');
        const p = axios
            .patch(`/checklist-items/${id}`, fields, jsonHeaders)
            .then((res) => {
                setSavedItems((prev) => prev.map((it) => (it.id === id ? res.data.item : it)));
                setSync('saved');
            })
            .catch((err) => {
                setSync('error');
                setPageError(errMsg(err, 'No se pudo guardar el cambio.'));
            });
        return track(p);
    };

    const uploadPhoto = async (id, slot, file) => {
        const problem = validateImage(file);
        if (problem) {
            setPageError(problem);
            return;
        }
        setPageError('');
        const fd = new FormData();
        fd.append('slot', slot);
        fd.append('photo', file);
        try {
            const res = await track(
                axios.post(`/checklist-items/${id}/photo`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
                })
            );
            setSavedItems((prev) => prev.map((it) => (it.id === id ? res.data.item : it)));
        } catch (err) {
            setPageError(errMsg(err, 'No se pudo subir la foto.'));
        }
    };

    const deletePhoto = async (id, slot) => {
        try {
            const res = await track(axios.delete(`/checklist-items/${id}/photo`, { data: { slot }, ...jsonHeaders }));
            setSavedItems((prev) => prev.map((it) => (it.id === id ? res.data.item : it)));
        } catch (err) {
            setPageError(errMsg(err, 'No se pudo quitar la foto.'));
        }
    };

    const addSavedItem = async (category) => {
        try {
            const res = await track(
                axios.post(
                    `/companies/${company.id}/checklist/items`,
                    { category: category === NO_CATEGORY ? null : category, question: 'Nuevo ítem' },
                    jsonHeaders
                )
            );
            setSavedItems((prev) => [...prev, res.data.item]);
        } catch (err) {
            setPageError(errMsg(err, 'No se pudo agregar el ítem.'));
        }
    };

    const deleteSavedItem = async (id) => {
        if (!window.confirm('¿Eliminar este ítem y sus fotos? No se puede deshacer.')) return;
        try {
            await track(axios.delete(`/checklist-items/${id}`, jsonHeaders));
            setSavedItems((prev) => prev.filter((it) => it.id !== id));
        } catch (err) {
            setPageError(errMsg(err, 'No se pudo eliminar el ítem.'));
        }
    };

    // ---------- Categorías: renombrar ----------
    const [catEdit, setCatEdit] = useState(null); // { from, value }

    const commitCategoryRename = async () => {
        if (!catEdit) return;
        const from = catEdit.from;
        const to = catEdit.value.trim();
        setCatEdit(null);
        if (!to || to === from) return;

        const fromValue = from === NO_CATEGORY ? null : from;
        const matches = (it) => (it.category || null) === fromValue;

        if (effectiveStage === 'draft') {
            setDraftItems((prev) => prev.map((it) => (matches(it) ? { ...it, category: to } : it)));
        } else {
            try {
                await track(
                    axios.patch(`/companies/${company.id}/checklist/category`, { from: fromValue, to }, jsonHeaders)
                );
                setSavedItems((prev) => prev.map((it) => (matches(it) ? { ...it, category: to } : it)));
            } catch (err) {
                setPageError(errMsg(err, 'No se pudo renombrar la categoría.'));
                return;
            }
        }
        setOpenCategories((prev) => {
            const next = new Set(prev);
            if (next.delete(from)) next.add(to);
            return next;
        });
    };

    // ---------- Descargar PDF con los cambios ----------
    const downloadPdf = async () => {
        setDownloading(true);
        setPageError('');
        // Si hay un campo con foco, forzamos el blur para que se guarde lo último que se escribió
        document.activeElement?.blur?.();
        try {
            await Promise.allSettled([...pendingSaves.current]);
            const res = await axios.get(`/companies/${company.id}/checklist/pdf`, {
                responseType: 'blob',
                headers: { Accept: 'application/pdf' },
            });
            const disposition = res.headers['content-disposition'] || '';
            const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
            const filename = match ? decodeURIComponent(match[1]) : `Relevamiento-${company.id}.pdf`;

            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } catch (err) {
            setPageError('No se pudo generar el PDF. Probá de nuevo en unos segundos.');
        } finally {
            setDownloading(false);
        }
    };

    // ---------- Visor de fotos ----------
    const openViewer = (title, images, index = 0) => setViewer({ title, images, index });

    // ---------- Agrupado por categoría ----------
    const currentItems = effectiveStage === 'draft' ? draftItems : savedItems;
    const grouped = useMemo(() => {
        const map = new Map();
        currentItems.forEach((it) => {
            const cat = it.category || NO_CATEGORY;
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat).push(it);
        });
        return Array.from(map.entries());
    }, [currentItems]);

    const [openCategories, setOpenCategories] = useState(new Set());
    const toggleCategory = (cat) => {
        setOpenCategories((prev) => {
            const next = new Set(prev);
            next.has(cat) ? next.delete(cat) : next.add(cat);
            return next;
        });
    };
    const expandAll = () => setOpenCategories(new Set(grouped.map(([c]) => c)));
    const collapseAll = () => setOpenCategories(new Set());

    const stats = useMemo(() => {
        const total = currentItems.length;
        const answered = currentItems.filter((it) => it.status).length;
        const si = currentItems.filter((it) => it.status === 'SI').length;
        const no = currentItems.filter((it) => it.status === 'NO').length;
        return { total, answered, si, no };
    }, [currentItems]);

    return (
        <AuthenticatedLayout title={`Relevamiento — ${company.business_name}`}>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/companies/${company.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a {company.business_name}
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="pb-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Relevamiento de Riesgos Laborales</h2>
                                <p className="text-xs text-slate-500">
                                    {company.business_name} — CUIT {company.tax_id}
                                </p>
                            </div>
                        </div>

                        {effectiveStage === 'saved' && (
                            <button
                                type="button"
                                onClick={downloadPdf}
                                disabled={downloading}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-60"
                            >
                                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                {downloading ? 'Generando PDF...' : 'Descargar PDF'}
                            </button>
                        )}
                    </div>

                    {/* Mensajes globales */}
                    {pageError && (
                        <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-rose-700 font-medium flex-1">{pageError}</p>
                            <button type="button" onClick={() => setPageError('')} className="text-rose-400 hover:text-rose-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {pageNotice && !pageError && (
                        <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-emerald-700 font-medium flex-1">{pageNotice}</p>
                            <button type="button" onClick={() => setPageNotice('')} className="text-emerald-400 hover:text-emerald-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Zona de carga de PDF */}
                    {effectiveStage === 'upload' && (
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`mt-6 rounded-2xl border border-dashed p-8 text-center transition-colors ${
                                isDragging ? 'border-blue-500 bg-blue-50/60' : 'border-slate-300 bg-slate-50/60'
                            }`}
                        >
                            <FileUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-800 mb-1">
                                Subí el Relevamiento (PDF) para extraer el checklist
                            </p>
                            <p className="text-xs text-slate-500 mb-4 flex items-center justify-center gap-1.5 flex-wrap">
                                Arrastrá el PDF acá, pegalo con{' '}
                                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Ctrl+V</kbd> o elegilo
                                del disco.
                            </p>

                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 cursor-pointer transition-colors shadow-xs">
                                    <FileUp className="w-3.5 h-3.5" />
                                    Elegir PDF
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handlePdfChange}
                                        className="hidden"
                                    />
                                </label>
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <ClipboardPaste className="w-3.5 h-3.5" />o pegalo en cualquier parte de esta página
                                </span>
                            </div>

                            {pdfState === 'loading' && (
                                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Leyendo {pdfFileName}...
                                </p>
                            )}
                            {pdfState === 'error' && (
                                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-amber-700">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {pdfMessage}
                                </p>
                            )}
                            {savedItems.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setStage('saved')}
                                    className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-700"
                                >
                                    Cancelar y volver al relevamiento guardado
                                </button>
                            )}
                        </div>
                    )}

                    {/* Aviso de borrador sin guardar */}
                    {effectiveStage === 'draft' && (
                        <div className="mt-6 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-amber-800 font-semibold">
                                    Se detectaron {draftItems.length} ítems de "{pdfFileName}". Todavía no se guardó nada.
                                </p>
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                    Editá lo que haga falta y podés adjuntar fotos ya mismo (hasta 2 por ítem): se suben solas cuando toques
                                    "Guardar Relevamiento".
                                    {savedItems.length > 0 && ' Guardar va a reemplazar el relevamiento anterior de esta empresa.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Barra de progreso / acciones cuando hay ítems */}
                    {(effectiveStage === 'draft' || effectiveStage === 'saved') && currentItems.length > 0 && (
                        <>
                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-4 text-xs flex-wrap">
                                    <span className="font-bold text-slate-700">
                                        {stats.answered}/{stats.total} respondidos
                                    </span>
                                    <span className="text-emerald-600 font-semibold">{stats.si} SI</span>
                                    <span className="text-rose-600 font-semibold">{stats.no} NO</span>
                                    {effectiveStage === 'saved' && <SyncBadge state={sync} />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={expandAll} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                                        Expandir todo
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button type="button" onClick={collapseAll} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                                        Colapsar todo
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                {grouped.map(([category, rows]) => {
                                    const isOpen = openCategories.has(category);
                                    const editing = catEdit?.from === category;
                                    return (
                                        <div key={category} className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50">
                                                {editing ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <input
                                                            autoFocus
                                                            value={catEdit.value}
                                                            onChange={(e) => setCatEdit({ ...catEdit, value: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') commitCategoryRename();
                                                                if (e.key === 'Escape') setCatEdit(null);
                                                            }}
                                                            className={`${inputClass} flex-1 py-1 uppercase font-bold`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={commitCategoryRename}
                                                            className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                                            title="Guardar nombre"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCatEdit(null)}
                                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white"
                                                            title="Cancelar"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCategory(category)}
                                                            className="flex-1 flex items-center gap-2 text-left py-0.5"
                                                        >
                                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{category}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCatEdit({ from: category, value: category })}
                                                            className="p-1 text-slate-400 hover:text-blue-600"
                                                            title="Renombrar categoría"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCategory(category)}
                                                            className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0"
                                                        >
                                                            {rows.length} ítems
                                                            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {isOpen && (
                                                <>
                                                    <div className="divide-y divide-slate-100">
                                                        {rows.map((row) =>
                                                            effectiveStage === 'draft' ? (
                                                                <DraftRow
                                                                    key={row._key}
                                                                    row={row}
                                                                    onChange={(field, value) => updateDraft(row._key, field, value)}
                                                                    onPhoto={(slotIdx, file) => setDraftPhoto(row._key, slotIdx, file)}
                                                                    onRemovePhoto={(slotIdx) => removeDraftPhoto(row._key, slotIdx)}
                                                                    onDelete={() => deleteDraftItem(row._key)}
                                                                    onView={openViewer}
                                                                />
                                                            ) : (
                                                                <SavedRow
                                                                    key={row.id}
                                                                    row={row}
                                                                    onPatch={(fields) => patchSavedItem(row.id, fields)}
                                                                    onUploadPhoto={(slot, file) => uploadPhoto(row.id, slot, file)}
                                                                    onDeletePhoto={(slot) => deletePhoto(row.id, slot)}
                                                                    onDelete={() => deleteSavedItem(row.id)}
                                                                    onView={openViewer}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => (effectiveStage === 'draft' ? addDraftItem(category) : addSavedItem(category))}
                                                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 border-t border-slate-100 transition-colors"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        Agregar ítem a esta categoría
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Acciones finales */}
                    {effectiveStage === 'draft' && (
                        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 flex-wrap">
                            {uploadProgress && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 mr-auto">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Subiendo fotos {uploadProgress.done}/{uploadProgress.total}...
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={cancelDraft}
                                disabled={saving}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Descartar
                            </button>
                            <button
                                type="button"
                                onClick={saveChecklist}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Guardando...' : 'Guardar Relevamiento'}
                            </button>
                        </div>
                    )}
                    {effectiveStage === 'saved' && (
                        <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={startReplace}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reemplazar desde un nuevo PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {viewer && (
                <PhotoLightbox
                    viewer={viewer}
                    onClose={() => setViewer(null)}
                    onIndex={(index) => setViewer((v) => ({ ...v, index }))}
                />
            )}
        </AuthenticatedLayout>
    );
}

function SyncBadge({ state }) {
    if (state === 'saving')
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
            </span>
        );
    if (state === 'saved')
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" /> Cambios guardados
            </span>
        );
    if (state === 'error')
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                <AlertCircle className="w-3 h-3" /> Error al guardar
            </span>
        );
    return null;
}

function StatusButtons({ value, onChange }) {
    return (
        <div className="flex gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(value === opt.value ? null : opt.value)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                        value === opt.value ? opt.activeClass : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

/** Visor a pantalla completa: muestra las fotos del ítem en grande, con navegación. */
function PhotoLightbox({ viewer, onClose, onIndex }) {
    const { images, index, title } = viewer;
    const current = images[index];
    const hasMany = images.length > 1;

    const prev = useCallback(() => onIndex((index - 1 + images.length) % images.length), [index, images.length, onIndex]);
    const next = useCallback(() => onIndex((index + 1) % images.length), [index, images.length, onIndex]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (hasMany && e.key === 'ArrowLeft') prev();
            if (hasMany && e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose, prev, next, hasMany]);

    if (!current) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col" onClick={onClose} role="dialog" aria-modal="true">
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
                <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{title}</p>
                    <p className="text-[11px] text-white/60">
                        {current.label}
                        {hasMany && ` · ${index + 1} de ${images.length}`}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <a
                        href={current.src}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir original
                    </a>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" title="Cerrar (Esc)">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative flex items-center justify-center px-4 sm:px-16">
                {hasMany && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            prev();
                        }}
                        className="absolute left-2 sm:left-4 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white"
                        title="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                <img
                    src={current.src}
                    alt={current.label}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                {hasMany && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            next();
                        }}
                        className="absolute right-2 sm:right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white"
                        title="Siguiente"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {hasMany && (
                <div className="flex items-center justify-center gap-2 py-3" onClick={(e) => e.stopPropagation()}>
                    {images.map((img, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onIndex(i)}
                            className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                                i === index ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                            }`}
                        >
                            <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/** Ítem en modo borrador: todo editable + fotos locales (previsualización, se suben al guardar). */
function DraftRow({ row, onChange, onPhoto, onRemovePhoto, onDelete, onView }) {
    const title = `#${row.item_number} ${row.question}`;
    const localImages = row.photos
        .map((p, i) => (p ? { src: p.url, label: `Foto ${i + 1} (sin subir todavía)`, slot: i } : null))
        .filter(Boolean);

    return (
        <div className="p-4 space-y-2.5">
            <div className="flex items-start gap-2">
                <span className="text-[11px] font-bold text-slate-400 mt-2 w-6 shrink-0">#{row.item_number}</span>
                <textarea
                    value={row.question}
                    onChange={(e) => onChange('question', e.target.value)}
                    rows={2}
                    className={`flex-1 resize-y ${inputClass}`}
                />
                <button type="button" onClick={onDelete} className="mt-1.5 p-1.5 text-slate-300 hover:text-rose-600" title="Eliminar ítem">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <div className="pl-8 flex flex-wrap items-center gap-2">
                <input
                    type="text"
                    value={row.reference || ''}
                    onChange={(e) => onChange('reference', e.target.value)}
                    placeholder="Referencia normativa"
                    className="flex-1 min-w-[160px] text-[11px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                />
                <StatusButtons value={row.status} onChange={(v) => onChange('status', v)} />
            </div>
            <div className="pl-8 flex items-start gap-3">
                <textarea
                    value={row.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder="Descripción / observación..."
                    rows={1}
                    className={`flex-1 py-1.5 resize-y ${inputClass}`}
                />
                {[0, 1].map((slotIdx) => {
                    const photo = row.photos[slotIdx];
                    return photo ? (
                        <div key={slotIdx} className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 group">
                            <button
                                type="button"
                                onClick={() => {
                                    const idx = localImages.findIndex((im) => im.slot === slotIdx);
                                    onView(title, localImages, idx);
                                }}
                                className="w-full h-full"
                                title="Ver en grande"
                            >
                                <img src={photo.url} alt={`Foto ${slotIdx + 1}`} className="w-full h-full object-cover" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemovePhoto(slotIdx)}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Quitar foto"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <label
                            key={slotIdx}
                            className="w-14 h-14 shrink-0 rounded-lg border border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 text-slate-400 hover:text-blue-500 transition-colors"
                            title={`Agregar foto ${slotIdx + 1}`}
                        >
                            <Camera className="w-4 h-4" />
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onPhoto(slotIdx, file);
                                    e.target.value = '';
                                }}
                            />
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

/** Ítem ya guardado: se edita en vivo y las fotos se muestran como enlaces que abren el visor grande. */
function SavedRow({ row, onPatch, onUploadPhoto, onDeletePhoto, onDelete, onView }) {
    const [question, setQuestion] = useState(row.question);
    const [reference, setReference] = useState(row.reference || '');
    const [description, setDescription] = useState(row.description || '');
    const [busySlot, setBusySlot] = useState(null);

    const title = `#${row.item_number} ${row.question}`;
    const images = [1, 2]
        .filter((slot) => row[`photo_${slot}`])
        .map((slot) => ({ src: `/storage/${row[`photo_${slot}`]}`, label: `Foto ${slot}`, slot }));

    const handleFile = async (slot, file) => {
        setBusySlot(slot);
        await onUploadPhoto(slot, file);
        setBusySlot(null);
    };

    return (
        <div className="p-4 space-y-2.5">
            <div className="flex items-start gap-2">
                <span className="text-[11px] font-bold text-slate-400 mt-2 w-6 shrink-0">#{row.item_number}</span>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onBlur={() => {
                        if (question.trim() === '') return setQuestion(row.question);
                        if (question !== row.question) onPatch({ question });
                    }}
                    rows={2}
                    className={`flex-1 resize-y ${inputClass}`}
                />
                <button type="button" onClick={onDelete} className="mt-1.5 p-1.5 text-slate-300 hover:text-rose-600" title="Eliminar ítem">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <div className="pl-8 flex flex-wrap items-center gap-2">
                <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    onBlur={() => reference !== (row.reference || '') && onPatch({ reference })}
                    placeholder="Referencia normativa"
                    className="flex-1 min-w-[160px] text-[11px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                />
                <StatusButtons value={row.status} onChange={(v) => onPatch({ status: v })} />
            </div>
            <div className="pl-8 space-y-2">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => description !== (row.description || '') && onPatch({ description })}
                    placeholder="Descripción / observación..."
                    rows={1}
                    className={`w-full py-1.5 resize-y ${inputClass}`}
                />

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {[1, 2].map((slot) => {
                        const hasPhoto = !!row[`photo_${slot}`];
                        if (busySlot === slot) {
                            return (
                                <span key={slot} className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo foto {slot}...
                                </span>
                            );
                        }
                        return hasPhoto ? (
                            <span key={slot} className="inline-flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => onView(title, images, images.findIndex((im) => im.slot === slot))}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2"
                                    title="Ver en grande"
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Foto {slot}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeletePhoto(slot)}
                                    className="p-0.5 text-slate-300 hover:text-rose-600"
                                    title="Quitar foto"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ) : (
                            <label
                                key={slot}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"
                            >
                                <Camera className="w-3.5 h-3.5" />
                                Agregar foto {slot}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFile(slot, file);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
