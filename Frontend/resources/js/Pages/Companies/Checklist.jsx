import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import axios from 'axios';

const isDocFile = (f) => /\.(pdf|docx|odt|txt)$/i.test(f?.name || '');

// Convierte una imagen "data:" que vino del servidor en un archivo para subirlo al guardar
const dataUrlToFile = (dataUrl, name) => {
    if (!dataUrl) return null;
    try {
        const [head, b64] = dataUrl.split(',');
        const mime = (head.match(/:(.*?);/) || [])[1] || 'image/jpeg';
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new File([bytes], name, { type: mime });
    } catch (e) {
        return null;
    }
};

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
    Calendar as CalendarIcon,
    CalendarCheck,
    Clock,
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

// Usa el contenedor de avisos global para que las acciones AJAX también tengan
// una confirmación visible, sin necesidad de recargar la página.
function showToast(message, type = 'success') {
    window.dispatchEvent(new CustomEvent('hys:toast', { detail: { message, type } }));
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

export default function CompaniesChecklist({ company, checklist, items }) {
    const [stage, setStage] = useState(items && items.length > 0 ? 'saved' : 'upload'); // upload | draft | saved
    const [draftItems, setDraftItems] = useState([]);
    const [savedItems, setSavedItems] = useState(items || []);
    const [activeChecklist, setActiveChecklist] = useState(checklist || null);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null); // { done, total }
    const [pageError, setPageError] = useState('');
    const [pageNotice, setPageNotice] = useState('');
    const [sync, setSync] = useState('idle'); // idle | saving | saved | error
    const [viewer, setViewer] = useState(null); // { title, images: [{src,label}], index }
    const [downloading, setDownloading] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);

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
            if (!file || !isDocFile(file)) {
                setPdfState('error');
                setPdfMessage('Ese archivo no se puede leer. Subí un PDF o un documento Word (.docx).');
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
                    status: it.status ?? null,
                    description: it.description ?? '',
                    regulation_date: it.regulation_date ? it.regulation_date.substring(0, 10) : '',
                    correction_notes: it.correction_notes ?? '',
                    review_status: it.review_status ?? null,
                    // Fotos encontradas en el archivo: [{file, url}, {file, url}] — se suben al guardar
                    photos: [0, 1].map((i) => {
                        const f = dataUrlToFile(it.photos?.[i], `foto-${it.item_number}-${i + 1}.jpg`);
                        return f ? { file: f, url: URL.createObjectURL(f) } : null;
                    }),
                }));
                setDraftItems(parsed);
                setStage('draft');
                setPdfState('idle');
                setPageError('');
            } catch (err) {
                setPdfState('error');
                setPdfMessage(err.response?.data?.message || 'No se pudo procesar el archivo. Probá con otro.');
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
            const file = Array.from(e.clipboardData?.files || []).find((f) => isDocFile(f));
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
                regulation_date: '',
                correction_notes: '',
                review_status: null,
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
            setActiveChecklist(res.data.checklist);
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
            const message = failed > 0
                ? `Relevamiento guardado, pero ${failed} foto(s) no se pudieron subir. Podés volver a agregarlas desde cada ítem.`
                : 'Relevamiento guardado correctamente.';
            setPageNotice(message);
            showToast(message, failed > 0 ? 'warning' : 'success');
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
                showToast('Cambios del relevamiento guardados.');
            })
            .catch((err) => {
                setSync('error');
                setPageError(errMsg(err, 'No se pudo guardar el cambio.'));
            });
        return track(p);
    };

    // El asistente de chat ya guardó estos ítems del lado del server (Laravel valida y aplica
    // los cambios); acá solo reflejamos ese resultado en el estado local.
    const applyChatUpdates = (updatedItems) => {
        setSavedItems((prev) => {
            const byId = new Map(prev.map((it) => [it.id, it]));
            updatedItems.forEach((it) => byId.set(it.id, { ...byId.get(it.id), ...it }));
            return Array.from(byId.values()).sort((a, b) => a.item_number - b.item_number);
        });
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
        if (!activeChecklist?.id) {
            setPageError('Primero guardá el relevamiento antes de agregar ítems nuevos.');
            return;
        }

        try {
            const res = await track(
                axios.post(
                    `/companies/${company.id}/checklist/items`,
                    {
                        checklist_id: activeChecklist.id,
                        category: category === NO_CATEGORY ? null : category,
                        question: 'Nuevo ítem',
                    },
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
            if (!activeChecklist?.id) {
                setPageError('No se encontró el relevamiento que querés editar. Recargá la página e intentá de nuevo.');
                return;
            }

            try {
                await track(
                    axios.patch(
                        `/companies/${company.id}/checklist/category`,
                        { checklist_id: activeChecklist.id, from: fromValue, to },
                        jsonHeaders
                    )
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
            const checklistQuery = activeChecklist?.id ? `?checklist_id=${activeChecklist.id}` : '';
            const res = await axios.get(`/companies/${company.id}/checklist/pdf${checklistQuery}`, {
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

    const scrollToItem = (item) => {
        // Aseguramos que la categoría del ítem esté abierta
        const cat = item.category || NO_CATEGORY;
        setOpenCategories((prev) => new Set([...prev, cat]));
        setShowCalendarModal(false);

        // Hacemos scroll hacia el elemento y le aplicamos un efecto de highlight
        setTimeout(() => {
            const el = document.getElementById(`checklist-item-${item.id}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-amber-400', 'bg-amber-50/50');
                setTimeout(() => {
                    el.classList.remove('ring-4', 'ring-amber-400', 'bg-amber-50/50');
                }, 3000);
            }
        }, 150);
    };

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
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setShowCalendarModal(true)}
                                    className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                                    title="Ver panel y calendario de fechas de regulación"
                                >
                                    <CalendarIcon className="w-4 h-4" />
                                    Calendario de Regulaciones
                                    {savedItems.filter((i) => i.regulation_date).length > 0 && (
                                        <span className="ml-0.5 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                                            {savedItems.filter((i) => i.regulation_date).length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={downloadPdf}
                                    disabled={downloading}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-60"
                                >
                                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                    {downloading ? 'Generando PDF...' : 'Descargar PDF'}
                                </button>
                            </div>
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
                                Subí el Relevamiento (PDF o Word) para extraer el checklist
                            </p>
                            <p className="text-xs text-slate-500 mb-4 flex items-center justify-center gap-1.5 flex-wrap">
                                Arrastrá el archivo (PDF o Word) acá, pegalo con{' '}
                                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Ctrl+V</kbd> o elegilo
                                del disco.
                            </p>

                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 cursor-pointer transition-colors shadow-xs">
                                    <FileUp className="w-3.5 h-3.5" />
                                    Elegir archivo
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.odt,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                                    const completedCount = rows.filter((r) => !!r.status).length;
                                    const catStatus =
                                        completedCount === 0 ? 'empty' : completedCount === rows.length ? 'full' : 'partial';
                                    const catColors = {
                                        empty: 'text-rose-600',
                                        partial: 'text-amber-600',
                                        full: 'text-emerald-600',
                                    };
                                    const catDot = {
                                        empty: 'bg-rose-500',
                                        partial: 'bg-amber-500',
                                        full: 'bg-emerald-500',
                                    };
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
                                                            className="flex items-center gap-2 text-[11px] shrink-0"
                                                            title={`${completedCount}/${rows.length} respondidos`}
                                                        >
                                                            <span className={`w-2 h-2 rounded-full shrink-0 ${catDot[catStatus]}`} />
                                                            <span className={`font-semibold ${catColors[catStatus]}`}>
                                                                {completedCount}/{rows.length} ítems
                                                            </span>
                                                            {isOpen ? (
                                                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                                            ) : (
                                                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                            )}
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
                                Reemplazar desde un nuevo archivo
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

            {showCalendarModal && (
                <RegulationCalendarModal
                    company={company}
                    items={savedItems}
                    onClose={() => setShowCalendarModal(false)}
                    onSelectItem={scrollToItem}
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

            {/* Fecha de regulación y seguimiento de corrección (Borrador) */}
            {row.status === 'NO' ? (
                <div className="pl-8 pt-2 border-t border-dashed border-slate-100 animate-in fade-in duration-200">
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-[11px] font-bold text-amber-900">Fecha de Regulación / Próxima Revisión:</span>
                                <input
                                    type="date"
                                    value={row.regulation_date || ''}
                                    onChange={(e) => onChange('regulation_date', e.target.value)}
                                    className="text-xs px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-slate-500">Estado de revisión:</span>
                                <button
                                    type="button"
                                    onClick={() => onChange('review_status', row.review_status === 'en_revision' ? null : 'en_revision')}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                                        row.review_status === 'en_revision'
                                            ? 'bg-amber-500 text-white border-amber-500'
                                            : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-100/50'
                                    }`}
                                >
                                    En Revisión
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onChange('review_status', row.review_status === 'revisado' ? null : 'revisado')}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                                        row.review_status === 'revisado'
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
                                    }`}
                                >
                                    Revisado
                                </button>
                            </div>
                        </div>
                        <div>
                            <input
                                type="text"
                                value={row.correction_notes || ''}
                                onChange={(e) => onChange('correction_notes', e.target.value)}
                                placeholder="¿Qué es lo que se tiene que corregir para esta regulación?..."
                                className="w-full text-xs px-3 py-1.5 bg-white border border-amber-200 rounded-lg placeholder:text-amber-800/40 text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                row.regulation_date && (
                    <div className="pl-8 pt-1">
                        <span className="text-[10px] text-slate-400 italic">
                            * Se marcó previamente una fecha ({row.regulation_date}), pero el ítem no está en estado "NO". Seleccioná "NO" para editar su regulación.
                        </span>
                    </div>
                )
            )}
        </div>
    );
}

/** Ítem ya guardado: se edita en vivo y las fotos se muestran como enlaces que abren el visor grande. */
function SavedRow({ row, onPatch, onUploadPhoto, onDeletePhoto, onDelete, onView }) {
    const [question, setQuestion] = useState(row.question);
    const [reference, setReference] = useState(row.reference || '');
    const [description, setDescription] = useState(row.description || '');
    const [regulationDate, setRegulationDate] = useState(row.regulation_date ? row.regulation_date.substring(0, 10) : '');
    const [correctionNotes, setCorrectionNotes] = useState(row.correction_notes || '');
    const [reviewStatus, setReviewStatus] = useState(row.review_status || null);
    const [busySlot, setBusySlot] = useState(null);
    const [rowSaveState, setRowSaveState] = useState('idle'); // idle | saving | saved

    useEffect(() => {
        setQuestion(row.question);
        setReference(row.reference || '');
        setDescription(row.description || '');
        setRegulationDate(row.regulation_date ? row.regulation_date.substring(0, 10) : '');
        setCorrectionNotes(row.correction_notes || '');
        setReviewStatus(row.review_status || null);
    }, [row]);

    const title = `#${row.item_number} ${row.question}`;
    const images = [1, 2]
        .filter((slot) => row[`photo_${slot}`])
        .map((slot) => ({ src: `/storage/${row[`photo_${slot}`]}`, label: `Foto ${slot}`, slot }));

    const handleFile = async (slot, file) => {
        setBusySlot(slot);
        await onUploadPhoto(slot, file);
        setBusySlot(null);
    };

    // Guardado manual explícito: por si el usuario prefiere no depender del guardado automático al salir del campo
    const handleManualSave = async () => {
        setRowSaveState('saving');
        const fields = {};
        if (question !== row.question) fields.question = question.trim() === '' ? row.question : question;
        if (reference !== (row.reference || '')) fields.reference = reference;
        if (description !== (row.description || '')) fields.description = description;
        const formattedDate = regulationDate ? regulationDate.substring(0, 10) : null;
        const rowFormattedDate = row.regulation_date ? row.regulation_date.substring(0, 10) : null;
        if (formattedDate !== rowFormattedDate) fields.regulation_date = formattedDate;
        if (correctionNotes !== (row.correction_notes || '')) fields.correction_notes = correctionNotes;
        if (reviewStatus !== (row.review_status || null)) fields.review_status = reviewStatus;

        if (Object.keys(fields).length > 0) await onPatch(fields);
        setRowSaveState('saved');
        setTimeout(() => setRowSaveState('idle'), 1500);
    };

    const handleToggleReviewStatus = (targetStatus) => {
        const next = reviewStatus === targetStatus ? null : targetStatus;
        setReviewStatus(next);
        onPatch({ review_status: next });
    };

    return (
        <div id={`checklist-item-${row.id}`} className="p-4 space-y-2.5 transition-all duration-300 rounded-xl">
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

                {/* Sección de Fecha de Regulación y Seguimiento de Corrección (Solo si el ítem es 'NO') */}
                {row.status === 'NO' ? (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-2 mt-2 animate-in fade-in duration-200">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-[11px] font-bold text-amber-900">Fecha de Regulación / Próxima Revisión:</span>
                                <input
                                    type="date"
                                    value={regulationDate}
                                    onChange={(e) => setRegulationDate(e.target.value)}
                                    onBlur={() => {
                                        const next = regulationDate ? regulationDate.substring(0, 10) : null;
                                        const curr = row.regulation_date ? row.regulation_date.substring(0, 10) : null;
                                        if (next !== curr) onPatch({ regulation_date: next });
                                    }}
                                    className="text-xs px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                />
                                {regulationDate && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRegulationDate('');
                                            onPatch({ regulation_date: null });
                                        }}
                                        className="text-[10px] text-amber-700 hover:text-amber-900 underline"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-slate-500">Estado de revisión:</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggleReviewStatus('en_revision')}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                                        reviewStatus === 'en_revision'
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                            : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-100/50'
                                    }`}
                                >
                                    En Revisión
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleReviewStatus('revisado')}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                                        reviewStatus === 'revisado'
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                            : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
                                    }`}
                                >
                                    Revisado
                                </button>
                            </div>
                        </div>
                        <div>
                            <input
                                type="text"
                                value={correctionNotes}
                                onChange={(e) => setCorrectionNotes(e.target.value)}
                                onBlur={() => {
                                    if (correctionNotes !== (row.correction_notes || '')) {
                                        onPatch({ correction_notes: correctionNotes });
                                    }
                                }}
                                placeholder="¿Qué es lo que se tiene que corregir para esta regulación?..."
                                className="w-full text-xs px-3 py-1.5 bg-white border border-amber-200 rounded-lg placeholder:text-amber-800/40 text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            />
                        </div>
                    </div>
                ) : (
                    row.regulation_date && (
                        <div className="pt-1">
                            <span className="text-[10px] text-slate-400 italic">
                                * Tiene fecha de regulación registrada ({row.regulation_date.substring(0, 10)}), pero el ítem no está marcado con "NO". Marcalo con "NO" para editar su regulación.
                            </span>
                        </div>
                    )
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
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

                    <button
                        type="button"
                        onClick={handleManualSave}
                        disabled={rowSaveState === 'saving'}
                        className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-60 ${
                            rowSaveState === 'saved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                        title="Guardar los cambios de este ítem"
                    >
                        {rowSaveState === 'saving' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : rowSaveState === 'saved' ? (
                            <Check className="w-3.5 h-3.5" />
                        ) : (
                            <Save className="w-3.5 h-3.5" />
                        )}
                        {rowSaveState === 'saving' ? 'Guardando...' : rowSaveState === 'saved' ? 'Guardado' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function RegulationCalendarModal({ company, items, onClose, onSelectItem }) {
    const today = new Date().toISOString().substring(0, 10);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
    const [selectedItemDetail, setSelectedItemDetail] = useState(null);

    // Mes inicial: mes actual o el mes del primer ítem con fecha
    const initialMonth = useMemo(() => {
        const withDate = items.find((it) => it.regulation_date);
        return withDate ? withDate.regulation_date.substring(0, 7) : today.substring(0, 7);
    }, [items, today]);

    const [currentMonth, setCurrentMonth] = useState(initialMonth);

    const regulationItems = useMemo(() => {
        return items
            .filter((it) => it.regulation_date)
            .sort((a, b) => (a.regulation_date > b.regulation_date ? 1 : -1));
    }, [items]);

    const stats = useMemo(() => {
        const total = regulationItems.length;
        const revisados = regulationItems.filter((i) => i.review_status === 'revisado').length;
        const enRevision = regulationItems.filter((i) => i.review_status === 'en_revision').length;
        const sinDefinir = total - revisados - enRevision;
        const vencidos = regulationItems.filter(
            (i) => i.review_status !== 'revisado' && i.regulation_date && i.regulation_date.substring(0, 10) < today
        ).length;
        return { total, revisados, enRevision, sinDefinir, vencidos };
    }, [regulationItems, today]);

    // Agrupar ítems por fecha "YYYY-MM-DD"
    const byDate = useMemo(() => {
        const map = {};
        regulationItems.forEach((it) => {
            const d = it.regulation_date.substring(0, 10);
            if (!map[d]) map[d] = [];
            map[d].push(it);
        });
        return map;
    }, [regulationItems]);

    // Generar días del mes para la vista mensual del calendario (con semanas lunes a domingo)
    const calendarDays = useMemo(() => {
        const [yearStr, monthStr] = currentMonth.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);

        // Primer día del mes
        const firstDay = new Date(year, month - 1, 1);
        // Día de la semana (0: Domingo, 1: Lunes... adaptado a lunes=0)
        let firstDayOfWeek = firstDay.getDay() - 1;
        if (firstDayOfWeek === -1) firstDayOfWeek = 6;

        // Último día del mes
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();

        const days = [];
        // Días del mes anterior para rellenar
        const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const pDay = prevMonthLastDay - i;
            const pDate = new Date(year, month - 2, pDay);
            const key = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
            days.push({ key, dayNumber: pDay, isCurrentMonth: false });
        }

        // Días del mes actual
        for (let d = 1; d <= daysInMonth; d++) {
            const key = `${currentMonth}-${String(d).padStart(2, '0')}`;
            days.push({ key, dayNumber: d, isCurrentMonth: true });
        }

        // Rellenar hasta completar semanas
        const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
        for (let next = 1; next <= remaining; next++) {
            const nDate = new Date(year, month, next);
            const key = `${nDate.getFullYear()}-${String(nDate.getMonth() + 1).padStart(2, '0')}-${String(next).padStart(2, '0')}`;
            days.push({ key, dayNumber: next, isCurrentMonth: false });
        }

        return days;
    }, [currentMonth]);

    const changeMonth = (delta) => {
        const [y, m] = currentMonth.split('-').map(Number);
        const d = new Date(y, m - 1 + delta, 1);
        setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    };

    const monthTitle = useMemo(() => {
        const [y, m] = currentMonth.split('-').map(Number);
        const d = new Date(y, m - 1, 1);
        const name = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
        return name.charAt(0).toUpperCase() + name.slice(1);
    }, [currentMonth]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                            <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">Calendario de Fechas de Regulación</h3>
                            <p className="text-[11px] text-slate-400">
                                Relevamiento de {company.business_name} &bull; Fechas de revisión programadas
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Selector de Vista: Calendario / Lista */}
                        <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
                            <button
                                type="button"
                                onClick={() => setViewMode('calendar')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                                    viewMode === 'calendar' ? 'bg-amber-500 text-white' : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                Calendario
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                                    viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                Lista ({regulationItems.length})
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Resumen de estados de regulación */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                        <span className="block text-base font-black text-slate-800">{stats.total}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Total con fecha</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200 text-center">
                        <span className="block text-base font-black text-amber-600">{stats.enRevision}</span>
                        <span className="text-[10px] text-amber-800 uppercase font-semibold">En revisión</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-200 text-center">
                        <span className="block text-base font-black text-emerald-600">{stats.revisados}</span>
                        <span className="text-[10px] text-emerald-800 uppercase font-semibold">Revisados</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-rose-200 text-center">
                        <span className="block text-base font-black text-rose-600">{stats.vencidos}</span>
                        <span className="text-[10px] text-rose-800 uppercase font-semibold">Vencidos s/revisar</span>
                    </div>
                </div>

                {/* CUERPO DEL MODAL */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {regulationItems.length === 0 ? (
                        <div className="py-16 text-center">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-700">No hay ítems con Fecha de Regulación asignada.</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                                En los ítems marcados con "NO", asigná una fecha de regulación y qué corregir para visualizarlos acá.
                            </p>
                        </div>
                    ) : viewMode === 'calendar' ? (
                        <div className="space-y-4">
                            {/* Navegación del mes */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => changeMonth(-1)}
                                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <h4 className="text-sm font-bold text-slate-800 min-w-[130px] text-center">{monthTitle}</h4>
                                    <button
                                        type="button"
                                        onClick={() => changeMonth(1)}
                                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonth(today.substring(0, 7))}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                                >
                                    Mes actual
                                </button>
                            </div>

                            {/* Grilla Calendario */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <div>Lun</div>
                                    <div>Mar</div>
                                    <div>Mié</div>
                                    <div>Jue</div>
                                    <div>Vie</div>
                                    <div>Sáb</div>
                                    <div>Dom</div>
                                </div>
                                <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                                    {calendarDays.map(({ key, dayNumber, isCurrentMonth }) => {
                                        const dayItems = byDate[key] || [];
                                        const isToday = key === today;
                                        return (
                                            <div
                                                key={key}
                                                className={`min-h-[75px] sm:min-h-[90px] p-1.5 flex flex-col transition-colors ${
                                                    !isCurrentMonth
                                                        ? 'bg-slate-50/50 text-slate-300'
                                                        : isToday
                                                        ? 'bg-amber-50/30'
                                                        : 'bg-white'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span
                                                        className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                                                            isToday
                                                                ? 'bg-amber-500 text-white'
                                                                : isCurrentMonth
                                                                ? 'text-slate-700'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {dayNumber}
                                                    </span>
                                                    {dayItems.length > 0 && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-white">
                                                            {dayItems.length}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-1 overflow-y-auto max-h-[60px] flex-1">
                                                    {dayItems.map((it) => {
                                                        const isExp = it.review_status !== 'revisado' && key < today;
                                                        const isRev = it.review_status === 'revisado';
                                                        return (
                                                            <button
                                                                key={it.id}
                                                                type="button"
                                                                onClick={() => setSelectedItemDetail(it)}
                                                                className={`w-full text-left px-1.5 py-1 rounded text-[10px] font-semibold truncate transition-transform hover:scale-[1.02] block border ${
                                                                    isExp
                                                                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                                                                        : isRev
                                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 line-through opacity-80'
                                                                        : 'bg-amber-100 text-amber-800 border-amber-300'
                                                                }`}
                                                                title={`#${it.item_number}: ${it.question}`}
                                                            >
                                                                #{it.item_number} {it.question}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* VISTA LISTA */
                        <div className="space-y-2.5">
                            {regulationItems.map((it) => {
                                const dateStr = it.regulation_date ? it.regulation_date.substring(0, 10) : '';
                                const isExpired = it.review_status !== 'revisado' && dateStr && dateStr < today;
                                const isToday = dateStr === today;
                                const [year, month, day] = dateStr ? dateStr.split('-') : ['', '', ''];

                                return (
                                    <div
                                        key={it.id}
                                        onClick={() => setSelectedItemDetail(it)}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                            isExpired
                                                ? 'bg-rose-50/60 border-rose-200'
                                                : it.review_status === 'revisado'
                                                ? 'bg-emerald-50/40 border-emerald-200'
                                                : 'bg-white border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`shrink-0 w-12 text-center rounded-xl p-1.5 border ${
                                                    isExpired
                                                        ? 'bg-rose-600 text-white border-rose-600'
                                                        : it.review_status === 'revisado'
                                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                                        : 'bg-slate-800 text-white border-slate-800'
                                                }`}
                                            >
                                                <span className="block text-[10px] uppercase font-bold tracking-wider">
                                                    {month && `${month}`}
                                                </span>
                                                <span className="block text-base font-black leading-tight">
                                                    {day || '--'}
                                                </span>
                                                <span className="block text-[8px] opacity-80">{year}</span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-bold text-slate-900">
                                                        #{it.item_number} &bull; {it.category || NO_CATEGORY}
                                                    </span>
                                                    {isExpired && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" /> ¡Fecha vencida!
                                                        </span>
                                                    )}
                                                    {isToday && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                            Vence Hoy
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 line-clamp-2">{it.question}</p>
                                                {it.correction_notes && (
                                                    <div className="mt-1 text-xs text-amber-900 bg-amber-100/60 px-2.5 py-1 rounded-lg border border-amber-200 inline-block font-medium">
                                                        <strong>A corregir:</strong> {it.correction_notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="sm:self-center shrink-0 flex items-center gap-2">
                                            {it.review_status === 'revisado' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Revisado
                                                </span>
                                            ) : it.review_status === 'en_revision' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                    <Clock className="w-3.5 h-3.5" /> En Revisión
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                    Pendiente
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* MODAL SECUNDARIO: Detalle del Ítem clickeado con redirección */}
                {selectedItemDetail && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                        Detalle de Regulación
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Ítem #{selectedItemDetail.item_number} &bull; {selectedItemDetail.category || NO_CATEGORY}
                                    </h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedItemDetail(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="font-semibold text-slate-500 block mb-0.5">Condición / Pregunta:</span>
                                    <p className="text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                        {selectedItemDetail.question}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Fecha de Regulación</span>
                                        <span className="font-bold text-slate-900 text-sm">
                                            {selectedItemDetail.regulation_date?.substring(0, 10)}
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Estado de Revisión</span>
                                        <div className="mt-0.5">
                                            {selectedItemDetail.review_status === 'revisado' ? (
                                                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[11px]">
                                                    <CheckCircle2 className="w-3 h-3" /> Revisado
                                                </span>
                                            ) : selectedItemDetail.review_status === 'en_revision' ? (
                                                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[11px]">
                                                    <Clock className="w-3 h-3" /> En Revisión
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                                                    Pendiente
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {selectedItemDetail.correction_notes ? (
                                    <div>
                                        <span className="font-semibold text-amber-900 block mb-0.5">¿Qué se tiene que corregir?</span>
                                        <p className="text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                                            {selectedItemDetail.correction_notes}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic">No se especificaron notas de corrección.</p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedItemDetail(null)}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Volver al calendario
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSelectItem(selectedItemDetail)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Ir a este ítem en el checklist
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                        Hacé clic en cualquier fecha o ítem para ver el detalle e ir directamente a él.
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
