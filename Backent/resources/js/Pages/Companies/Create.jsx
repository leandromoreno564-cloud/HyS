import React, { useState, useRef, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    Building2,
    Save,
    ArrowLeft,
    Users,
    Shield,
    FileUp,
    Loader2,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    X,
    ChevronDown,
    ChevronUp,
    ClipboardPaste,
} from 'lucide-react';

// Campos que vienen del PDF y que van directo a un campo del formulario principal
const MAIN_PDF_FIELDS = [
    { key: 'business_name', label: 'Razón Social' },
    { key: 'tax_id', label: 'CUIT / CUIP' },
    { key: 'industry_sector', label: 'Actividad Económica' },
    { key: 'employee_count', label: 'Cantidad de Trabajadores' },
];

// Campos que se combinan para armar la Dirección del formulario principal
const ADDRESS_PDF_FIELDS = [
    { key: 'domicilio', label: 'Domicilio' },
    { key: 'postal_code', label: 'C.P.' },
    { key: 'locality', label: 'Localidad' },
    { key: 'province', label: 'Provincia' },
];

// Campos solo informativos: el sistema todavía no tiene dónde guardarlos
const INFO_PDF_FIELDS = [
    { key: 'establishment_number', label: 'Nº de Establecimiento' },
    { key: 'surface_m2', label: 'Superficie del Establec. (m²)' },
];

const REQUIRED_FIELDS = [
    { key: 'business_name', label: 'Razón Social' },
    { key: 'tax_id', label: 'CUIT / RUC' },
    { key: 'industry_sector', label: 'Sector Industrial' },
    { key: 'employee_count', label: 'Cantidad de Empleados' },
];

const emptyPdfExtra = { domicilio: '', postal_code: '', locality: '', province: '', establishment_number: '', surface_m2: '' };

export default function CompaniesCreate({ inspectors = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        tax_id: '',
        industry_sector: 'Metalmecánica',
        address: '',
        phone: '',
        email: '',
        employee_count: 10,
        website: '',
        contact_person: '',
        inspector_ids: [],
    });

    const sectors = [
        'Metalmecánica',
        'Construcción y Obra Civil',
        'Agroindustria & Alimentos',
        'Química & Farmacéutica',
        'Minería & Extracción',
        'Logística y Transporte',
        'Servicios de Salud',
        'Comercio y Servicios',
    ];

    const [pdfState, setPdfState] = useState('idle'); // idle | loading | success | empty | error
    const [pdfFileName, setPdfFileName] = useState(null);
    const [pdfMessage, setPdfMessage] = useState('');
    const [pdfExtra, setPdfExtra] = useState(emptyPdfExtra);
    const [showPdfDetail, setShowPdfDetail] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Recalcula la Dirección combinando las partes que vienen del PDF (o que el
    // usuario haya editado en el panel de detalle)
    const recomputeAddress = (extra) => {
        const parts = [
            extra.domicilio,
            extra.postal_code ? `CP ${extra.postal_code}` : '',
            extra.locality,
            extra.province,
        ].filter(Boolean);
        if (parts.length > 0) {
            setData('address', parts.join(', '));
        }
    };

    const updatePdfExtra = (key, value) => {
        const next = { ...pdfExtra, [key]: value };
        setPdfExtra(next);
        if (ADDRESS_PDF_FIELDS.some((f) => f.key === key)) {
            recomputeAddress(next);
        }
    };

    const processFile = useCallback(async (file) => {
        if (!file || file.type !== 'application/pdf') {
            setPdfState('error');
            setPdfMessage('Eso no parece ser un PDF. Probá con el archivo del relevamiento.');
            return;
        }

        setPdfFileName(file.name);
        setPdfState('loading');
        setPdfMessage('');
        setShowPdfDetail(false);

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const res = await axios.post('/companies/extract-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const { found, fields } = res.data;

            if (!found) {
                setPdfState('empty');
                setPdfMessage('No encontramos datos reconocibles en el PDF. Completá el formulario a mano.');
                return;
            }

            // Campos que van directo al formulario principal
            MAIN_PDF_FIELDS.forEach(({ key }) => {
                if (fields[key]) {
                    setData(key, key === 'employee_count' ? Number(fields[key]) : fields[key]);
                }
            });

            // Campos que arman la Dirección + los solo informativos
            const nextExtra = { ...emptyPdfExtra };
            [...ADDRESS_PDF_FIELDS, ...INFO_PDF_FIELDS].forEach(({ key }) => {
                nextExtra[key] = fields[key] || '';
            });
            setPdfExtra(nextExtra);
            recomputeAddress(nextExtra);

            setPdfState('success');
            setShowPdfDetail(true);
            setPdfMessage('Encontramos estos datos en el PDF. Revisalos y completá lo que falte antes de guardar.');
        } catch (err) {
            setPdfState('error');
            setPdfMessage(
                err.response?.data?.message || 'No se pudo procesar el PDF. Probá con otro archivo o cargalo a mano.'
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // Detecta cuando el usuario pega (Ctrl+V) un PDF copiado, en cualquier parte de la página
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

    const clearPdf = () => {
        setPdfState('idle');
        setPdfFileName(null);
        setPdfMessage('');
        setPdfExtra(emptyPdfExtra);
        setShowPdfDetail(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Campos obligatorios que todavía están vacíos (se muestra sobre todo después de usar el PDF)
    const missingRequired = REQUIRED_FIELDS.filter((f) => {
        const val = data[f.key];
        return f.key === 'employee_count' ? !val || Number(val) <= 0 : !val || String(val).trim() === '';
    });

    const toggleInspector = (id) => {
        if (data.inspector_ids.includes(id)) {
            setData('inspector_ids', data.inspector_ids.filter((i) => i !== id));
        } else {
            setData('inspector_ids', [...data.inspector_ids, id]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/companies');
    };

    return (
        <AuthenticatedLayout title="Registrar Nueva Empresa">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/companies"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al listado
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="pb-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Datos del Establecimiento / Empresa
                            </h2>
                            <p className="text-xs text-slate-500">
                                Ingrese los datos fiscales y asigne a los inspectores de higiene y seguridad responsables.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        {/* Carga de Relevamiento (PDF) para autocompletar */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`rounded-2xl border border-dashed p-5 transition-colors ${
                                isDragging ? 'border-blue-500 bg-blue-50/60' : 'border-slate-300 bg-slate-50/60'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <FileUp className="w-4 h-4 text-blue-600" />
                                <p className="text-xs font-bold text-slate-800">
                                    Autocompletar desde Relevamiento (PDF)
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 flex-wrap">
                                <span>
                                    Arrastrá el PDF acá, pegalo con <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Ctrl+V</kbd> o elegilo del disco.
                                </span>
                            </p>

                            <div className="flex items-center gap-3 flex-wrap">
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 cursor-pointer transition-colors shadow-xs">
                                    <FileUp className="w-3.5 h-3.5" />
                                    {pdfFileName ? 'Cambiar PDF' : 'Elegir PDF'}
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

                                {pdfFileName && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <span className="font-medium truncate max-w-[200px]">{pdfFileName}</span>
                                        <button
                                            type="button"
                                            onClick={clearPdf}
                                            className="text-slate-400 hover:text-slate-600"
                                            title="Quitar"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                {pdfState === 'loading' && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Extrayendo datos...
                                    </span>
                                )}
                            </div>

                            {pdfState === 'success' && (
                                <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-emerald-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    {pdfMessage}
                                </p>
                            )}
                            {(pdfState === 'empty' || pdfState === 'error') && (
                                <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-amber-700">
                                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    {pdfMessage}
                                </p>
                            )}

                            {/* Panel opcional: ver / editar todo lo que se detectó en el PDF */}
                            {pdfState === 'success' && (
                                <div className="mt-4 pt-4 border-t border-slate-200/80">
                                    <button
                                        type="button"
                                        onClick={() => setShowPdfDetail((v) => !v)}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        {showPdfDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        {showPdfDetail ? 'Ocultar' : 'Ver'} todos los datos detectados en el PDF
                                    </button>

                                    {showPdfDetail && (
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {MAIN_PDF_FIELDS.map(({ key, label }) => (
                                                <div key={key}>
                                                    <label className="block text-[11px] font-semibold text-slate-500">
                                                        {label}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data[key] ?? ''}
                                                        onChange={(e) =>
                                                            setData(key, key === 'employee_count' ? e.target.value : e.target.value)
                                                        }
                                                        className="mt-1 block w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                                    />
                                                </div>
                                            ))}
                                            {ADDRESS_PDF_FIELDS.map(({ key, label }) => (
                                                <div key={key}>
                                                    <label className="block text-[11px] font-semibold text-slate-500">
                                                        {label}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={pdfExtra[key]}
                                                        onChange={(e) => updatePdfExtra(key, e.target.value)}
                                                        className="mt-1 block w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                                    />
                                                </div>
                                            ))}
                                            {INFO_PDF_FIELDS.map(({ key, label }) => (
                                                <div key={key}>
                                                    <label className="block text-[11px] font-semibold text-slate-500">
                                                        {label}
                                                        <span className="ml-1 font-normal text-slate-400">(solo informativo)</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={pdfExtra[key]}
                                                        onChange={(e) => updatePdfExtra(key, e.target.value)}
                                                        className="mt-1 block w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                                    />
                                                </div>
                                            ))}
                                            <p className="sm:col-span-2 text-[11px] text-slate-400">
                                                Razón Social, CUIT, Sector y Cant. de Empleados están enlazados con el
                                                formulario de abajo. Domicilio / C.P. / Localidad / Provincia arman la
                                                Dirección. El sistema todavía no guarda Nº de Establecimiento ni Superficie.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Advertencia de campos obligatorios que faltan completar */}
                            {(pdfState === 'success' || pdfState === 'empty') && missingRequired.length > 0 && (
                                <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700">
                                        Todavía falta completar: <strong>{missingRequired.map((f) => f.label).join(', ')}</strong>.
                                        El PDF no traía esos datos (o no se pudieron leer) — completalos a mano antes de guardar.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Razón Social */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Razón Social / Nombre Comercial *
                                </label>
                                <input
                                    type="text"
                                    value={data.business_name}
                                    onChange={(e) => setData('business_name', e.target.value)}
                                    placeholder="Ej: Industrias Metalúrgicas del Norte S.A."
                                    required
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                                {errors.business_name && <p className="mt-1 text-xs text-rose-600">{errors.business_name}</p>}
                            </div>

                            {/* CUIT */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    CUIT / RUC *
                                </label>
                                <input
                                    type="text"
                                    value={data.tax_id}
                                    onChange={(e) => setData('tax_id', e.target.value)}
                                    placeholder="30-71234567-8"
                                    required
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-mono"
                                />
                                {errors.tax_id && <p className="mt-1 text-xs text-rose-600">{errors.tax_id}</p>}
                            </div>

                            {/* Sector Industrial */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Sector Industrial *
                                </label>
                                <select
                                    value={data.industry_sector}
                                    onChange={(e) => setData('industry_sector', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white"
                                >
                                    {sectors.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dirección */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Dirección del Establecimiento
                                </label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Av. Industrial 1234, Parque Industrial, Palpalá, Jujuy"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                            </div>

                            {/* Contact Person */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Persona de Contacto / Responsable
                                </label>
                                <input
                                    type="text"
                                    value={data.contact_person}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                    placeholder="Ing. Carlos Pérez (Jefe de Planta)"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+54 388 423-4567"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="seguridad@empresa.com"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                            </div>

                            {/* Employee Count */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Cantidad de Empleados
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.employee_count}
                                    onChange={(e) => setData('employee_count', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                            </div>
                        </div>

                        {/* Asignación de Inspectores */}
                        <div className="pt-6 border-t border-slate-100">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                                Inspectores Asignados (Permisos de Inspección)
                            </label>
                            <p className="text-xs text-slate-500 mb-4">
                                Seleccione qué inspectores o técnicos tendrán acceso para auditar esta empresa.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {inspectors.map((insp) => {
                                    const selected = data.inspector_ids.includes(insp.id);
                                    return (
                                        <div
                                            key={insp.id}
                                            onClick={() => toggleInspector(insp.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                                                selected
                                                    ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => {}}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{insp.name}</p>
                                                <p className="text-[11px] text-slate-500 font-mono">
                                                    {insp.license_number ? `Mat. ${insp.license_number}` : insp.email}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href="/companies"
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Guardando...' : 'Registrar Empresa'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
