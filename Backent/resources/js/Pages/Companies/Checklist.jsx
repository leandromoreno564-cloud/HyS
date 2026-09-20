import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft,
    FileUp,
    Loader2,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    X,
    ChevronDown,
    ChevronUp,
    ClipboardPaste,
    Camera,
    Save,
    RotateCcw,
    ClipboardList,
} from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'SI', label: 'SI', activeClass: 'bg-emerald-600 text-white border-emerald-600' },
    { value: 'NO', label: 'NO', activeClass: 'bg-rose-600 text-white border-rose-600' },
    { value: 'NO_APLICA', label: 'N/A', activeClass: 'bg-slate-500 text-white border-slate-500' },
];

const jsonHeaders = { headers: { Accept: 'application/json' } };

export default function CompaniesChecklist({ company, items }) {
    const [stage, setStage] = useState(items && items.length > 0 ? 'saved' : 'upload'); // upload | draft | saved
    const [draftItems, setDraftItems] = useState([]);
    const [savedItems, setSavedItems] = useState(items || []);
    const [saving, setSaving] = useState(false);

    // Cuando vuelven props frescas del server (después de guardar), sincronizamos el estado local
    useEffect(() => {
        if (items && items.length > 0) {
            setSavedItems(items);
            setStage('saved');
            setDraftItems([]);
        }
    }, [items]);

    // --- Carga y extracción del PDF (mismo patrón que en Registrar Empresa) ---
    const [pdfState, setPdfState] = useState('idle'); // idle | loading | error
    const [pdfFileName, setPdfFileName] = useState(null);
    const [pdfMessage, setPdfMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const processFile = useCallback(async (file) => {
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
                item_number: it.item_number,
                category: it.category,
                question: it.question,
                reference: it.reference,
                status: null,
                description: '',
            }));
            setDraftItems(parsed);
            setStage('draft');
            setPdfState('idle');
        } catch (err) {
            setPdfState('error');
            setPdfMessage(
                err.response?.data?.message || 'No se pudo procesar el PDF. Probá con otro archivo.'
            );
        }
    }, [company.id]);

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
            if (file) { e.preventDefault(); processFile(file); }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [processFile]);

    const cancelDraft = () => {
        setDraftItems([]);
        setPdfFileName(null);
        setPdfState('idle');
        setStage(savedItems.length > 0 ? 'saved' : 'upload');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startReplace = () => {
        setStage('upload');
        setPdfFileName(null);
        setPdfState('idle');
    };

    // --- Edición del borrador (todavía no guardado) ---
    const updateDraft = (idx, field, value) => {
        setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
    };

    const saveChecklist = () => {
        setSaving(true);
        router.post(`/companies/${company.id}/checklist`, { items: draftItems }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    // --- Edición de ítems ya guardados ---
    const patchSavedItem = async (id, fields) => {
        const res = await axios.patch(`/checklist-items/${id}`, fields, jsonHeaders);
        setSavedItems((prev) => prev.map((it) => (it.id === id ? res.data.item : it)));
    };

    const uploadPhoto = async (id, slot, file) => {
        const fd = new FormData();
        fd.append('slot', slot);
        fd.append('photo', file);
        const res = await axios.post(`/checklist-items/${id}/photo`, fd, {
            headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
        });
        setSavedItems((prev) => prev.map((it) => (it.id === id ? res.data.item : it)));
    };

    const deletePhoto = async (id, slot) => {
        const res = await axios.delete(`/checklist-items/${id}/photo`, { data: { slot }, ...jsonHeaders });
        setSavedItems((prev) => prev.map((it) => (it.id === id ? res.data.item : it)));
    };

    // --- Agrupado por categoría (sirve tanto para borrador como para guardado) ---
    const currentItems = stage === 'draft' ? draftItems : savedItems;
    const grouped = useMemo(() => {
        const map = new Map();
        currentItems.forEach((it, idx) => {
            const cat = it.category || 'Sin categoría';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat).push({ ...it, _idx: idx });
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
                    <div className="pb-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Relevamiento de Riesgos Laborales
                            </h2>
                            <p className="text-xs text-slate-500">
                                {company.business_name} — CUIT {company.tax_id}
                            </p>
                        </div>
                    </div>

                    {/* Zona de carga de PDF */}
                    {stage === 'upload' && (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
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
                                Arrastrá el PDF acá, pegalo con <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Ctrl+V</kbd> o elegilo del disco.
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
                                    <ClipboardPaste className="w-3.5 h-3.5" />
                                    o pegalo en cualquier parte de esta página
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
                    {stage === 'draft' && (
                        <div className="mt-6 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-amber-800 font-semibold">
                                    Se detectaron {draftItems.length} ítems de "{pdfFileName}". Todavía no se guardó nada.
                                </p>
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                    Revisá, editá lo que haga falta y guardá. Las fotos se cargan después de guardar, ítem por ítem.
                                    {savedItems.length > 0 && ' Guardar va a reemplazar el relevamiento anterior de esta empresa.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Barra de progreso / acciones cuando hay ítems (borrador o guardado) */}
                    {(stage === 'draft' || stage === 'saved') && currentItems.length > 0 && (
                        <>
                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="font-bold text-slate-700">
                                        {stats.answered}/{stats.total} respondidos
                                    </span>
                                    <span className="text-emerald-600 font-semibold">{stats.si} SI</span>
                                    <span className="text-rose-600 font-semibold">{stats.no} NO</span>
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
                                    return (
                                        <div key={category} className="border border-slate-200 rounded-xl overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(category)}
                                                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                                            >
                                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                                    {category}
                                                </span>
                                                <span className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                                                    {rows.length} ítems
                                                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                </span>
                                            </button>

                                            {isOpen && (
                                                <div className="divide-y divide-slate-100">
                                                    {rows.map((row) =>
                                                        stage === 'draft' ? (
                                                            <DraftRow
                                                                key={row._idx}
                                                                row={row}
                                                                onChange={(field, value) => updateDraft(row._idx, field, value)}
                                                            />
                                                        ) : (
                                                            <SavedRow
                                                                key={row.id}
                                                                row={row}
                                                                onPatch={(fields) => patchSavedItem(row.id, fields)}
                                                                onUploadPhoto={(slot, file) => uploadPhoto(row.id, slot, file)}
                                                                onDeletePhoto={(slot) => deletePhoto(row.id, slot)}
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Acciones finales */}
                    {stage === 'draft' && (
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={cancelDraft}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Descartar
                            </button>
                            <button
                                type="button"
                                onClick={saveChecklist}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Guardando...' : 'Guardar Relevamiento'}
                            </button>
                        </div>
                    )}
                    {stage === 'saved' && (
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
        </AuthenticatedLayout>
    );
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

function DraftRow({ row, onChange }) {
    return (
        <div className="p-4 space-y-2.5">
            <div className="flex items-start gap-2">
                <span className="text-[11px] font-bold text-slate-400 mt-2 w-6 shrink-0">#{row.item_number}</span>
                <textarea
                    value={row.question}
                    onChange={(e) => onChange('question', e.target.value)}
                    rows={2}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none resize-y"
                />
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
            <div className="pl-8">
                <textarea
                    value={row.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder="Descripción / observación..."
                    rows={1}
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none resize-y"
                />
            </div>
        </div>
    );
}

function SavedRow({ row, onPatch, onUploadPhoto, onDeletePhoto }) {
    const [question, setQuestion] = useState(row.question);
    const [reference, setReference] = useState(row.reference || '');
    const [description, setDescription] = useState(row.description || '');
    const photoInput1 = useRef(null);
    const photoInput2 = useRef(null);

    return (
        <div className="p-4 space-y-2.5">
            <div className="flex items-start gap-2">
                <span className="text-[11px] font-bold text-slate-400 mt-2 w-6 shrink-0">#{row.item_number}</span>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onBlur={() => question !== row.question && onPatch({ question })}
                    rows={2}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none resize-y"
                />
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
            <div className="pl-8 flex items-start gap-3">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => description !== (row.description || '') && onPatch({ description })}
                    placeholder="Descripción / observación..."
                    rows={1}
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none resize-y"
                />

                {[1, 2].map((slot) => {
                    const field = `photo_${slot}`;
                    const inputRef = slot === 1 ? photoInput1 : photoInput2;
                    return row[field] ? (
                        <div key={slot} className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 group">
                            <img src={`/storage/${row[field]}`} alt={`Foto ${slot}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => onDeletePhoto(slot)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                title="Quitar foto"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ) : (
                        <label key={slot} className="w-14 h-14 shrink-0 rounded-lg border border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 text-slate-400 hover:text-blue-500 transition-colors">
                            <Camera className="w-4 h-4" />
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onUploadPhoto(slot, file);
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
