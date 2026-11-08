import React, { useState } from 'react';
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
    UserPlus,
} from 'lucide-react';

export default function CompaniesShow({ company, inspectors = [], canManageCompany = false }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';
    const isInspector = auth?.user?.role === 'inspector';
    const checklists = company.checklists || [];
    const [requestingAssignment, setRequestingAssignment] = useState(false);

    const formatSurveyDate = (date) => {
        if (!date) return 'Sin fecha';
        const normalizedDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? `${date}T00:00:00`
            : date;
        const parsedDate = new Date(normalizedDate);
        if (Number.isNaN(parsedDate.getTime())) return 'Sin fecha';

        return new Intl.DateTimeFormat('es-AR', {
            dateStyle: 'long',
        }).format(parsedDate);
    };

    const handleDelete = () => {
        if (confirm(`¿Está seguro de enviar a la papelera a ${company.business_name}?`)) {
            router.delete(`/companies/${company.id}`);
        }
    };

    const handleRequestAssignment = () => {
        setRequestingAssignment(true);
        router.post(`/companies/${company.id}/request-inspector`, {}, {
            preserveScroll: true,
            onFinish: () => setRequestingAssignment(false),
        });
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
                        {canManageCompany && (
                            <>
                                <Link
                                    href={`/companies/${company.id}/checklist?new=1`}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                                >
                                    <ClipboardList className="w-3.5 h-3.5" />
                                    Nuevo Relevamiento
                                </Link>
                                <Link
                                    href={`/companies/${company.id}/edit`}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                    Editar
                                </Link>
                            </>
                        )}
                        {isInspector && !canManageCompany && (
                            <button
                                type="button"
                                onClick={handleRequestAssignment}
                                disabled={requestingAssignment}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                {requestingAssignment ? 'Enviando...' : 'Solicitar asignación'}
                            </button>
                        )}
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

                {/* Historial de relevamientos */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Historial de relevamientos</h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Consultá los relevamientos guardados para esta empresa.
                            </p>
                        </div>
                        {canManageCompany && (
                            <Link
                                href={`/companies/${company.id}/checklist?new=1`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                            >
                                <ClipboardList className="w-3.5 h-3.5" />
                                Nuevo relevamiento
                            </Link>
                        )}
                    </div>

                    {checklists.length > 0 ? (
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                            {checklists.map((checklist) => (
                                <Link
                                    key={checklist.id}
                                    href={`/companies/${company.id}/checklist?checklist_id=${checklist.id}`}
                                    className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">{checklist.name}</p>
                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                {formatSurveyDate(checklist.surveyed_at)} · {checklist.items_count || 0} ítems
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 whitespace-nowrap">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Ver
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
                            <ClipboardList className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                            <p className="text-xs font-semibold text-slate-600">Todavía no hay relevamientos guardados.</p>
                            <p className="mt-1 text-[11px] text-slate-400">Creá el primero para que quede registrado en este historial.</p>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
