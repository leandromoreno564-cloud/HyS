import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    Building2, 
    Edit, 
    Trash2, 
    ArrowLeft, 
    ClipboardCheck, 
    Plus, 
    Users, 
    MapPin, 
    Phone, 
    Mail, 
    Calendar,
    CheckCircle2,
    FileText
} from 'lucide-react';

export default function CompaniesShow({ company, inspectors = [] }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

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
                            href={`/inspections/create?company_id=${company.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nueva Inspección
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

                {/* Inspection History */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Historial de Inspecciones de Seguridad
                            </h3>
                            <p className="text-xs text-slate-500">
                                Registro cronológico de auditorías técnicas y seguimiento de medidas
                            </p>
                        </div>
                        <Link
                            href={`/inspections/create?company_id=${company.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Nueva Inspección
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200/80 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50">
                                    <th className="py-3 px-4">Fecha</th>
                                    <th className="py-3 px-4">Tipo</th>
                                    <th className="py-3 px-4">Inspector a Cargo</th>
                                    <th className="py-3 px-4">Estado</th>
                                    <th className="py-3 px-4">Avance</th>
                                    <th className="py-3 px-4 text-center">Observaciones</th>
                                    <th className="py-3 px-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {company.inspections?.length > 0 ? (
                                    company.inspections.map((ins) => (
                                        <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-slate-800">
                                                {ins.inspection_date ? new Date(ins.inspection_date).toLocaleDateString('es-AR') : '-'}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600">
                                                {ins.type}
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-slate-800">
                                                {ins.user?.name || 'N/A'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge>{ins.status}</Badge>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                        <div 
                                                            style={{ width: `${ins.progress_percentage}%` }} 
                                                            className="bg-blue-600 h-full rounded-full" 
                                                        />
                                                    </div>
                                                    <span className="font-bold text-slate-700">
                                                        {ins.progress_percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                                                    {ins.observations?.length || 0}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={`/inspections/${ins.id}/pdf`}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="Descargar PDF"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </a>
                                                    <Link
                                                        href={`/inspections/${ins.id}`}
                                                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition-colors"
                                                    >
                                                        Abrir
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                                            No se registran inspecciones para esta empresa aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
