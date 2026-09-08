import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import Modal from '@/Components/Modal';
import SignatureCanvas from '@/Components/SignatureCanvas';
import LeafletMap from '@/Components/LeafletMap';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    ClipboardCheck, 
    CheckCircle2, 
    XCircle, 
    MinusCircle, 
    Clock, 
    AlertTriangle, 
    Camera, 
    FileText, 
    PenTool, 
    MapPin, 
    Plus, 
    Trash2, 
    ArrowLeft, 
    Calendar, 
    Building2, 
    User, 
    ExternalLink,
    DollarSign,
    Save,
    Upload,
    QrCode
} from 'lucide-react';

export default function InspectionsShow({ 
    inspection, 
    groupedChecklist = {}, 
    stats = {} 
}) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('checklist'); // checklist | observations | measures | signature | map

    // Modals
    const [customItemModal, setCustomItemModal] = useState(false);
    const [observationModal, setObservationModal] = useState(false);
    const [measureModal, setMeasureModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    // Form states
    const [customCategory, setCustomCategory] = useState(Object.keys(groupedChecklist)[0] || 'General');
    const [customTitle, setCustomTitle] = useState('');
    const [customNormative, setCustomNormative] = useState('');
    const [customMethod, setCustomMethod] = useState('');

    // Observation Form
    const [obsType, setObsType] = useState('Hallazgo');
    const [obsSeverity, setObsSeverity] = useState('Moderado');
    const [obsLocation, setObsLocation] = useState('');
    const [obsDescription, setObsDescription] = useState('');
    const [obsPhotos, setObsPhotos] = useState([]);
    const [obsLinkedItemId, setObsLinkedItemId] = useState('');
    const [obsCreateMeasure, setObsCreateMeasure] = useState(false);
    const [obsMeasureDesc, setObsMeasureDesc] = useState('');
    const [obsMeasurePriority, setObsMeasurePriority] = useState('Media');
    const [obsMeasureDeadline, setObsMeasureDeadline] = useState('');
    const [obsMeasureResponsible, setObsMeasureResponsible] = useState('');
    const [obsMeasureCost, setObsMeasureCost] = useState('');

    // Measure Form
    const [measureDesc, setMeasureDesc] = useState('');
    const [measurePriority, setMeasurePriority] = useState('Media');
    const [measureDeadline, setMeasureDeadline] = useState('');
    const [measureResponsible, setMeasureResponsible] = useState('');
    const [measureCost, setMeasureCost] = useState('');

    // Signatures
    const [inspectorSignature, setInspectorSignature] = useState(inspection.signature_inspector || null);
    const [companySignature, setCompanySignature] = useState(inspection.signature_company || null);
    const [companySignerName, setCompanySignerName] = useState(inspection.signature_company_name || '');

    // Checklist Item Status update
    const updateItemStatus = (item, newStatus) => {
        router.post(`/inspections/${inspection.id}/checklist/${item.id}`, {
            status: newStatus,
            risk_level: item.risk_level,
            notes: item.notes,
        }, {
            preserveScroll: true,
        });
    };

    const updateItemRisk = (item, newRisk) => {
        router.post(`/inspections/${inspection.id}/checklist/${item.id}`, {
            status: item.status,
            risk_level: newRisk,
            notes: item.notes,
        }, {
            preserveScroll: true,
        });
    };

    const updateItemNotes = (item, notes) => {
        router.post(`/inspections/${inspection.id}/checklist/${item.id}`, {
            status: item.status,
            risk_level: item.risk_level,
            notes: notes,
        }, {
            preserveScroll: true,
        });
    };

    const handleDeleteItem = (itemId) => {
        if (confirm('¿Eliminar este ítem del checklist?')) {
            router.delete(`/inspections/${inspection.id}/checklist/${itemId}`, {
                preserveScroll: true,
            });
        }
    };

    // Add custom item
    const handleAddCustomItem = (e) => {
        e.preventDefault();
        router.post(`/inspections/${inspection.id}/checklist-custom`, {
            category_name: customCategory,
            title: customTitle,
            normative_reference: customNormative,
            verification_method: customMethod,
            status: 'Pendiente',
            risk_level: 'Medio',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setCustomItemModal(false);
                setCustomTitle('');
                setCustomNormative('');
                setCustomMethod('');
            }
        });
    };

    // Add observation
    const handleAddObservation = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('type', obsType);
        formData.append('severity', obsSeverity);
        formData.append('location', obsLocation);
        formData.append('description', obsDescription);
        if (obsLinkedItemId) formData.append('inspection_checklist_item_id', obsLinkedItemId);

        for (let i = 0; i < obsPhotos.length; i++) {
            formData.append('photos[]', obsPhotos[i]);
        }

        if (obsCreateMeasure) {
            formData.append('create_measure', '1');
            formData.append('measure_description', obsMeasureDesc);
            formData.append('measure_priority', obsMeasurePriority);
            if (obsMeasureDeadline) formData.append('measure_deadline', obsMeasureDeadline);
            if (obsMeasureResponsible) formData.append('measure_responsible', obsMeasureResponsible);
            if (obsMeasureCost) formData.append('measure_cost', obsMeasureCost);
        }

        router.post(`/inspections/${inspection.id}/observations`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setObservationModal(false);
                setObsDescription('');
                setObsLocation('');
                setObsPhotos([]);
                setObsCreateMeasure(false);
                setObsMeasureDesc('');
            }
        });
    };

    // Add measure
    const handleAddMeasure = (e) => {
        e.preventDefault();
        router.post(`/inspections/${inspection.id}/measures`, {
            description: measureDesc,
            priority: measurePriority,
            deadline: measureDeadline || null,
            responsible_person: measureResponsible || null,
            estimated_cost: measureCost || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setMeasureModal(false);
                setMeasureDesc('');
                setMeasureDeadline('');
                setMeasureResponsible('');
                setMeasureCost('');
            }
        });
    };

    // Save signatures
    const handleSaveSignatures = () => {
        router.post(`/inspections/${inspection.id}/sign`, {
            signature_inspector: inspectorSignature,
            signature_company: companySignature,
            signature_company_name: companySignerName,
        }, {
            preserveScroll: true,
        });
    };

    // Change status
    const handleStatusChange = (newStatus, force = false) => {
        router.post(`/inspections/${inspection.id}/status`, {
            status: newStatus,
            force: force ? 1 : undefined,
        }, {
            preserveScroll: true,
        });
    };

    const categories = Object.keys(groupedChecklist);

    return (
        <AuthenticatedLayout title={`Inspección #${inspection.id}: ${inspection.company?.business_name}`}>
            <div className="space-y-6">
                {/* Back Link & Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/inspections"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a inspecciones
                    </Link>

                    <div className="flex items-center gap-2">
                        <a
                            href={`/inspections/${inspection.id}/pdf`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs"
                        >
                            <FileText className="w-4 h-4 text-blue-600" />
                            Descargar Informe PDF
                        </a>

                        {/* Status Quick Toggle */}
                        {inspection.status !== 'Completada' ? (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('Completada')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Finalizar y Cerrar
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('En Progreso')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                            >
                                Reabrir Inspección
                            </button>
                        )}
                    </div>
                </div>

                {/* Hero Summary Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                                    {inspection.company?.business_name}
                                </h1>
                                <Badge>{inspection.status}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-1">
                                <span>CUIT: <strong className="font-mono text-slate-700">{inspection.company?.tax_id}</strong></span>
                                <span>•</span>
                                <span>Sector: <strong className="text-slate-700">{inspection.company?.industry_sector}</strong></span>
                                <span>•</span>
                                <span>Fecha: <strong className="text-slate-700">{inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString('es-AR') : '-'}</strong></span>
                                <span>•</span>
                                <span>Inspector: <strong className="text-slate-700">{inspection.user?.name}</strong></span>
                            </p>
                        </div>

                        {/* Progress Bar and Stat Pill */}
                        <div className="lg:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-700">Progreso Evaluación</span>
                                <span className="font-bold text-blue-700">{inspection.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${inspection.progress_percentage}%` }}
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        inspection.progress_percentage === 100
                                            ? 'bg-emerald-500'
                                            : 'bg-blue-600'
                                    }`}
                                />
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                                <span>{stats.evaluated_count || 0} de {stats.total_items || 0} evaluados</span>
                                <span>{stats.compliance_rate || 0}% de conformidad</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 text-center">
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                            <span className="text-lg font-bold text-emerald-700 block">{stats.cumple || 0}</span>
                            <span className="text-[10px] font-semibold uppercase text-emerald-800 tracking-wider">Cumple</span>
                        </div>
                        <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl">
                            <span className="text-lg font-bold text-rose-700 block">{stats.no_cumple || 0}</span>
                            <span className="text-[10px] font-semibold uppercase text-rose-800 tracking-wider">No Cumple</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-lg font-bold text-slate-700 block">{stats.no_aplica || 0}</span>
                            <span className="text-[10px] font-semibold uppercase text-slate-600 tracking-wider">No Aplica</span>
                        </div>
                        <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl">
                            <span className="text-lg font-bold text-amber-700 block">{stats.pendiente || 0}</span>
                            <span className="text-[10px] font-semibold uppercase text-amber-800 tracking-wider">Pendientes</span>
                        </div>
                        <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                            <span className="text-lg font-bold text-blue-700 block">{inspection.observations?.length || 0}</span>
                            <span className="text-[10px] font-semibold uppercase text-blue-800 tracking-wider">Hallazgos</span>
                        </div>
                        <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                            <span className="text-lg font-bold text-indigo-700 block">{inspection.corrective_measures?.length || 0}</span>
                            <span className="text-[10px] font-semibold uppercase text-indigo-800 tracking-wider">Medidas</span>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-slate-200 flex gap-2 sm:gap-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('checklist')}
                        className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'checklist'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Checklist Técnico ({stats.total_items || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('observations')}
                        className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'observations'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Camera className="w-4 h-4" />
                        <span>Observaciones & Fotos ({inspection.observations?.length || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('measures')}
                        className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'measures'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Medidas Correctivas ({inspection.corrective_measures?.length || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('signature')}
                        className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'signature'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <PenTool className="w-4 h-4" />
                        <span>Firma Digital & Cierre</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('map')}
                        className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'map'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <MapPin className="w-4 h-4" />
                        <span>Geolocalización GPS</span>
                    </button>
                </div>

                {/* TAB 1: CHECKLIST */}
                {activeTab === 'checklist' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                Evalúe cada ítem haciendo clic en el estado correspondiente. El cálculo de avance y porcentaje de cumplimiento se actualiza en tiempo real.
                            </p>
                            <button
                                type="button"
                                onClick={() => setCustomItemModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Agregar Ítem
                            </button>
                        </div>

                        {categories.map((category) => {
                            const items = groupedChecklist[category];
                            return (
                                <div key={category} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/80 flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            {category}
                                        </h3>
                                        <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                            {items.length} ítems
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-100">
                                        {items.map((item) => (
                                            <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-semibold text-slate-900">
                                                                {item.title}
                                                            </h4>
                                                            {item.is_custom && (
                                                                <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-md font-semibold">
                                                                    Personalizado
                                                                </span>
                                                            )}
                                                        </div>
                                                        {(item.normative_reference || item.verification_method) && (
                                                            <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-2">
                                                                {item.normative_reference && (
                                                                    <span>Norma: <strong className="text-slate-600">{item.normative_reference}</strong></span>
                                                                )}
                                                                {item.verification_method && (
                                                                    <span>• Método: <strong className="text-slate-600">{item.verification_method}</strong></span>
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Risk Level Selector */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-slate-400">Riesgo:</span>
                                                        <select
                                                            value={item.risk_level}
                                                            onChange={(e) => updateItemRisk(item, e.target.value)}
                                                            className="text-xs font-semibold py-1 px-2 border border-slate-200 rounded-lg bg-white text-slate-700"
                                                        >
                                                            <option value="Bajo">Bajo</option>
                                                            <option value="Medio">Medio</option>
                                                            <option value="Alto">Alto</option>
                                                        </select>
                                                        {item.is_custom && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteItem(item.id)}
                                                                className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                                                                title="Eliminar ítem"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Mobile-Friendly Tactile Status Buttons */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemStatus(item, 'Cumple')}
                                                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                                            item.status === 'Cumple'
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs shadow-emerald-500/30'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                                                        }`}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Cumple
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemStatus(item, 'No Cumple')}
                                                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                                            item.status === 'No Cumple'
                                                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs shadow-rose-500/30'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                                        }`}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        No Cumple
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemStatus(item, 'No Aplica')}
                                                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                                            item.status === 'No Aplica'
                                                                ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                                                        }`}
                                                    >
                                                        <MinusCircle className="w-4 h-4" />
                                                        No Aplica
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemStatus(item, 'Pendiente')}
                                                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                                            item.status === 'Pendiente'
                                                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs shadow-amber-500/30'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                                                        }`}
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                        Pendiente
                                                    </button>
                                                </div>

                                                {/* Shortcut to create finding */}
                                                {item.status === 'No Cumple' && (
                                                    <div className="pt-2 flex items-center justify-between bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                                                        <span className="text-[11px] text-rose-800 font-medium">
                                                            No conformidad detectada: ¿desea documentar con fotografías y generar medida correctiva?
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setObsLinkedItemId(item.id);
                                                                setObsDescription(`Hallazgo en: ${item.title}`);
                                                                setObservationModal(true);
                                                            }}
                                                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            <Camera className="w-3.5 h-3.5" />
                                                            Cargar Hallazgo
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* TAB 2: OBSERVACIONES & EVIDENCIAS */}
                {activeTab === 'observations' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                Registro fotográfico de hallazgos, actos inseguros, condiciones peligrosas y buenas prácticas.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setObsLinkedItemId('');
                                    setObservationModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Observación
                            </button>
                        </div>

                        {inspection.observations?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {inspection.observations.map((obs) => (
                                    <div key={obs.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <Badge>{obs.type}</Badge>
                                                <Badge>{obs.severity}</Badge>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm('¿Eliminar esta observación y sus fotos?')) {
                                                        router.delete(`/observations/${obs.id}`);
                                                    }
                                                }}
                                                className="text-slate-300 hover:text-rose-600 p-1"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">
                                            {obs.description}
                                        </p>

                                        {obs.location && (
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Ubicación: <strong>{obs.location}</strong></span>
                                            </p>
                                        )}

                                        {/* Photos Gallery */}
                                        {obs.photos?.length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                                    Evidencia Fotográfica ({obs.photos.length})
                                                </span>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {obs.photos.map((photo, pIdx) => (
                                                        <div
                                                            key={pIdx}
                                                            onClick={() => setSelectedPhoto(`/storage/${photo}`)}
                                                            className="aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 group relative"
                                                        >
                                                            <img
                                                                src={`/storage/${photo}`}
                                                                alt={`Evidencia ${pIdx + 1}`}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
                                <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-sm font-bold text-slate-800">No hay observaciones registradas</h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    Cargue hallazgos con fotografías de evidencia tomadas en el establecimiento.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: MEDIDAS CORRECTIVAS */}
                {activeTab === 'measures' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                Plan de acción correctiva y preventiva derivado de las no conformidades.
                            </p>
                            <button
                                type="button"
                                onClick={() => setMeasureModal(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Medida
                            </button>
                        </div>

                        {inspection.corrective_measures?.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                                                <th className="py-3.5 px-4">Descripción de la Medida</th>
                                                <th className="py-3.5 px-4">Prioridad</th>
                                                <th className="py-3.5 px-4">Responsable</th>
                                                <th className="py-3.5 px-4">Fecha Límite</th>
                                                <th className="py-3.5 px-4">Costo Est.</th>
                                                <th className="py-3.5 px-4">Estado</th>
                                                <th className="py-3.5 px-4 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {inspection.corrective_measures.map((measure) => (
                                                <tr key={measure.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                                                        {measure.description}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <Badge>{measure.priority}</Badge>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-600">
                                                        {measure.responsible_person || 'A definir'}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono text-slate-600">
                                                        {measure.deadline ? new Date(measure.deadline).toLocaleDateString('es-AR') : 'Sin plazo'}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono text-slate-600">
                                                        {measure.estimated_cost ? `$${Number(measure.estimated_cost).toLocaleString('es-AR')}` : '-'}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <select
                                                            value={measure.status}
                                                            onChange={(e) => {
                                                                router.post(`/corrective-measures/${measure.id}/status`, {
                                                                    status: e.target.value,
                                                                }, { preserveScroll: true });
                                                            }}
                                                            className="text-xs font-semibold py-1 px-2 border border-slate-200 rounded-lg bg-white"
                                                        >
                                                            <option value="Pendiente">Pendiente</option>
                                                            <option value="En Progreso">En Progreso</option>
                                                            <option value="Completada">Completada</option>
                                                            <option value="Vencida">Vencida</option>
                                                            <option value="Cancelada">Cancelada</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm('¿Eliminar esta medida correctiva?')) {
                                                                    router.delete(`/corrective-measures/${measure.id}`, { preserveScroll: true });
                                                                }
                                                            }}
                                                            className="text-slate-300 hover:text-rose-600 p-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
                                <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-sm font-bold text-slate-800">No hay medidas correctivas registradas</h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    Agregue medidas de mitigación para subsanar los desvíos y condiciones de riesgo encontradas.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: FIRMA DIGITAL & CIERRE */}
                {activeTab === 'signature' && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Cierre de Inspección y Firmas de Conformidad
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Capture la firma manuscrita digital del inspector y del representante del establecimiento en pantalla táctil o con el cursor.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                            {/* Firma Inspector */}
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Inspector Responsable
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        {inspection.user?.name} {inspection.user?.license_number ? `(Mat. ${inspection.user.license_number})` : ''}
                                    </p>
                                </div>

                                <SignatureCanvas
                                    label="Firma Manuscrita del Inspector"
                                    initialData={inspection.signature_inspector}
                                    onSave={(data) => setInspectorSignature(data)}
                                />
                            </div>

                            {/* Firma Representante */}
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Representante de la Empresa
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Toma de conocimiento de las observaciones y plazos
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                        Nombre y Apellido del Firmante
                                    </label>
                                    <input
                                        type="text"
                                        value={companySignerName}
                                        onChange={(e) => setCompanySignerName(e.target.value)}
                                        placeholder="Ej: Ing. Jorge Morales (Gerente de Planta)"
                                        className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                                    />
                                </div>

                                <SignatureCanvas
                                    label="Firma Manuscrita de la Empresa"
                                    initialData={inspection.signature_company}
                                    onSave={(data) => setCompanySignature(data)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleSaveSignatures}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Guardar y Estampar Firmas en Informe
                            </button>
                        </div>

                        {/* QR Code Validation Section */}
                        <div className="mt-8 p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
                            <div className="bg-white p-3 rounded-2xl flex-shrink-0 shadow-lg">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/verify/${inspection.token}` : `/verify/${inspection.token}`)}`}
                                    alt="Código QR de Verificación"
                                    className="w-28 h-28 sm:w-32 sm:h-32 block rounded-lg"
                                />
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-2">
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <QrCode className="w-5 h-5 text-emerald-400" />
                                    <h4 className="text-sm font-bold text-white">
                                        Código QR de Verificación Oficial
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Este código QR se estampa automáticamente al pie del <strong>Informe Técnico Oficial en PDF</strong>. Puedes escanearlo directamente desde esta pantalla con la cámara de cualquier teléfono celular para abrir el <strong>Certificado Digital de Autenticidad</strong>.
                                </p>
                                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
                                    <a
                                        href={`/verify/${inspection.token}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-xs transition-colors"
                                    >
                                        <span>Abrir Certificado de Autenticidad</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                        Token: {inspection.token?.substring(0, 18)}...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: GEOLOCALIZACION GPS */}
                {activeTab === 'map' && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Geolocalización Satelital del Establecimiento
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Verificación en mapa interactivo de las coordenadas de la inspección.
                            </p>
                        </div>

                        <LeafletMap height="h-96" />
                    </div>
                )}
            </div>

            {/* MODAL: AGREGAR ITEM PERSONALIZADO */}
            <Modal
                isOpen={customItemModal}
                onClose={() => setCustomItemModal(false)}
                title="Agregar Ítem Personalizado al Checklist"
            >
                <form onSubmit={handleAddCustomItem} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                            Categoría *
                        </label>
                        <select
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                            <option value="Condiciones Específicas">Condiciones Específicas</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                            Pregunta o Aspecto a Evaluar *
                        </label>
                        <textarea
                            rows={2}
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            placeholder="Ej: Verificación de sistema de parada de emergencia en torno CNC..."
                            required
                            className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                            Referencia Normativa
                        </label>
                        <input
                            type="text"
                            value={customNormative}
                            onChange={(e) => setCustomNormative(e.target.value)}
                            placeholder="Ej: Ley 19.587 / Dec. 351/79 Cap. 15"
                            className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setCustomItemModal(false)}
                            className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                        >
                            Agregar al Checklist
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: NUEVA OBSERVACION / FOTOS */}
            <Modal
                isOpen={observationModal}
                onClose={() => setObservationModal(false)}
                title="Registrar Observación / Hallazgo Técnico"
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleAddObservation} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Tipo de Observación *
                            </label>
                            <select
                                value={obsType}
                                onChange={(e) => setObsType(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                            >
                                <option value="Hallazgo">Hallazgo (No Conformidad)</option>
                                <option value="Buena práctica">Buena Práctica Detectada</option>
                                <option value="Mejora">Oportunidad de Mejora</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Nivel de Severidad *
                            </label>
                            <select
                                value={obsSeverity}
                                onChange={(e) => setObsSeverity(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                            >
                                <option value="Menor">Menor</option>
                                <option value="Moderado">Moderado</option>
                                <option value="Mayor">Mayor</option>
                                <option value="Crítico">Crítico (Peligro Inminente)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                            Ubicación Textual en Planta
                        </label>
                        <input
                            type="text"
                            value={obsLocation}
                            onChange={(e) => setObsLocation(e.target.value)}
                            placeholder="Ej: Nave 2 - Sector Maquinado junto al tablero principal"
                            className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                            Descripción Técnica del Hallazgo *
                        </label>
                        <textarea
                            rows={3}
                            value={obsDescription}
                            onChange={(e) => setObsDescription(e.target.value)}
                            placeholder="Detalle el riesgo detectado, condiciones de peligro o incumplimiento observado..."
                            required
                            className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>

                    {/* Subida de Fotos */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                            Fotografías de Evidencia
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setObsPhotos(Array.from(e.target.files))}
                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {/* Generar medida correctiva vinculada */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                            <input
                                type="checkbox"
                                checked={obsCreateMeasure}
                                onChange={(e) => setObsCreateMeasure(e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span>Generar Medida Correctiva Inmediata para este hallazgo</span>
                        </label>

                        {obsCreateMeasure && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase">
                                        Acción Correctiva Propuesta *
                                    </label>
                                    <input
                                        type="text"
                                        value={obsMeasureDesc}
                                        onChange={(e) => setObsMeasureDesc(e.target.value)}
                                        placeholder="Ej: Instalar protecciones fijas en correas y poleas..."
                                        className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 uppercase">
                                            Fecha Límite
                                        </label>
                                        <input
                                            type="date"
                                            value={obsMeasureDeadline}
                                            onChange={(e) => setObsMeasureDeadline(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 uppercase">
                                            Responsable Asignado
                                        </label>
                                        <input
                                            type="text"
                                            value={obsMeasureResponsible}
                                            onChange={(e) => setObsMeasureResponsible(e.target.value)}
                                            placeholder="Jefe de Mantenimiento"
                                            className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setObservationModal(false)}
                            className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                        >
                            Guardar Observación
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: NUEVA MEDIDA CORRECTIVA */}
            <Modal
                isOpen={measureModal}
                onClose={() => setMeasureModal(false)}
                title="Registrar Medida Correctiva"
            >
                <form onSubmit={handleAddMeasure} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                            Descripción de la Acción Requerida *
                        </label>
                        <textarea
                            rows={3}
                            value={measureDesc}
                            onChange={(e) => setMeasureDesc(e.target.value)}
                            placeholder="Acción necesaria para subsanar la no conformidad..."
                            required
                            className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Prioridad *
                            </label>
                            <select
                                value={measurePriority}
                                onChange={(e) => setMeasurePriority(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                            >
                                <option value="Baja">Baja</option>
                                <option value="Media">Media</option>
                                <option value="Alta">Alta</option>
                                <option value="Crítica">Crítica</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Plazo de Ejecución
                            </label>
                            <input
                                type="date"
                                value={measureDeadline}
                                onChange={(e) => setMeasureDeadline(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Responsable Asignado
                            </label>
                            <input
                                type="text"
                                value={measureResponsible}
                                onChange={(e) => setMeasureResponsible(e.target.value)}
                                placeholder="Ej: Ing. Mantenimiento"
                                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Costo Estimado ($ ARS)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={measureCost}
                                onChange={(e) => setMeasureCost(e.target.value)}
                                placeholder="50000"
                                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setMeasureModal(false)}
                            className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                        >
                            Registrar Medida
                        </button>
                    </div>
                </form>
            </Modal>

            {/* LIGHTBOX PHOTO MODAL */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-3xl max-h-full">
                        <img
                            src={selectedPhoto}
                            alt="Foto de Evidencia"
                            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
                        />
                        <button
                            type="button"
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/80 text-white text-xs font-bold rounded-xl hover:bg-slate-900"
                        >
                            Cerrar [ESC]
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
