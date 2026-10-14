import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    Building2, 
    Edit, 
    Trash2, 
    ArrowLeft, 
    Users, 
    MapPin, 
    Phone, 
    Mail, 
    Calendar,
    CheckCircle2,
    ClipboardList,
    ExternalLink
} from 'lucide-react';
import LeafletMap from '@/Components/LeafletMap';

export default function CompaniesShow({ company, inspectors = [] }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    const hasLocation = company.latitude != null && company.longitude != null;
    const mapsUrl = hasLocation
        ? `https://www.google.com/maps?q=${company.latitude},${company.longitude}`
        : null;

    const handleDelete = () => {
        if (confirm(`¿Está seguro de enviar a la papelera a ${company.business_name}?`)) {
            router.delete(`/companies/${company.id}`);
        }
    };

    return (
        <AuthenticatedLayout title={company.business_name}>
            <div className="space-y-6">
                {/* Navigation and Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Link
                        href="/companies"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a empresas
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/companies/${company.id}/checklist`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                            <ClipboardList className="w-3.5 h-3.5" />
                            Relevamiento
                        </Link>
                        <Link
                            href={`/companies/${company.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            Editar
                        </Link>
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>

                {/* Company Profile Header Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-xs">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                                    {company.business_name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                        CUIT: {company.tax_id}
                                    </span>
                                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                        {company.industry_sector}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xl font-bold text-slate-900 block">
                                    {company.inspections?.length || 0}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                    Inspecciones
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xl font-bold text-slate-900 block">
                                    {company.employee_count || 1}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                    Empleados
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
                                <span className="text-xl font-bold text-slate-900 block">
                                    {company.inspectors?.length || 0}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                    Inspectores
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs text-slate-600">
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                                Información de Contacto
                            </h4>
                            <p className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span>{company.contact_person || 'Contacto no especificado'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>{company.phone || 'Sin teléfono'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>{company.email || 'Sin correo registrado'}</span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                                Ubicación de Planta
                            </h4>
                            <p className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <span>{company.address || 'Sin dirección especificada'}</span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                                Inspectores Habilitados
                            </h4>
                            {company.inspectors?.length > 0 ? (
                                <div className="space-y-1.5">
                                    {company.inspectors.map((insp) => (
                                        <div key={insp.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                                            <span className="font-semibold text-slate-800">{insp.name}</span>
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {insp.license_number ? `Mat. ${insp.license_number}` : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 italic">No hay inspectores asignados.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ubicación GPS y foto del lugar */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                            Ubicación GPS y foto del lugar
                        </h4>
                        {mapsUrl && (
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Abrir en Google Maps
                            </a>
                        )}
                    </div>

                    {hasLocation || company.location_photo_url ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                {hasLocation ? (
                                    <>
                                        <LeafletMap
                                            lat={Number(company.latitude)}
                                            lng={Number(company.longitude)}
                                            readOnly
                                            height="h-64"
                                        />
                                        <p className="text-[11px] text-slate-500 font-mono">
                                            {Number(company.latitude).toFixed(6)}, {Number(company.longitude).toFixed(6)}
                                            {company.location_accuracy ? ` · ±${Math.round(company.location_accuracy)} m` : ''}
                                        </p>
                                        {company.location_captured_at && (
                                            <p className="text-[11px] text-slate-400">
                                                Registrada el {new Date(company.location_captured_at).toLocaleString('es-AR')}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Sin ubicación GPS registrada.</p>
                                )}
                            </div>

                            <div>
                                {company.location_photo_url ? (
                                    <a href={company.location_photo_url} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={company.location_photo_url}
                                            alt={`Foto de ${company.business_name}`}
                                            className="w-full h-64 object-cover rounded-xl border border-slate-200 shadow-xs hover:opacity-90 transition-opacity"
                                        />
                                    </a>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Sin foto del lugar.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">
                            Todavía no se registró la ubicación GPS ni una foto de este establecimiento. Podés
                            agregarlas desde “Editar”.
                        </p>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
