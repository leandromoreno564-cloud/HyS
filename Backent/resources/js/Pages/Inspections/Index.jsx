import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import { Link, router } from '@inertiajs/react';
import { 
    ClipboardCheck, 
    Plus, 
    Filter, 
    FileText, 
    Building2, 
    User, 
    Calendar,
    ArrowRight,
    Search
} from 'lucide-react';

export default function InspectionsIndex({ inspections, companies = [] }) {
    const [companyId, setCompanyId] = useState('');
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/inspections', {
            company_id: companyId || undefined,
            status: status || undefined,
            type: type || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout title="Registro de Inspecciones">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Inspecciones de Seguridad e Higiene
                        </h2>
                        <p className="text-xs text-slate-500">
                            Planillas técnicas, checklists normativos, evidencias fotográficas y firmas
                        </p>
                    </div>
                    <Link
                        href="/inspections/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Inspección
                    </Link>
                </div>

                {/* Filter Form */}
                <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Empresa
                        </label>
                        <select
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white text-slate-700"
                        >
                            <option value="">Todas las empresas</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>{c.business_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Estado
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white text-slate-700"
                        >
                            <option value="">Todos los estados</option>
                            <option value="Borrador">Borrador</option>
                            <option value="En Progreso">En Progreso</option>
                            <option value="Completada">Completada</option>
                            <option value="Cancelada">Cancelada</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Tipo
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white text-slate-700"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="General">General</option>
                            <option value="Específica">Específica</option>
                            <option value="Seguimiento">Seguimiento</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Desde
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                            Filtrar
                        </button>
                    </div>
                </form>

                {/* Inspections Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Empresa / CUIT</th>
                                    <th className="py-3.5 px-4">Fecha & Horario</th>
                                    <th className="py-3.5 px-4">Tipo</th>
                                    <th className="py-3.5 px-4">Inspector a Cargo</th>
                                    <th className="py-3.5 px-4">Estado</th>
                                    <th className="py-3.5 px-4">Progreso</th>
                                    <th className="py-3.5 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inspections?.data?.length > 0 ? (
                                    inspections.data.map((ins) => (
                                        <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <Link
                                                    href={`/inspections/${ins.id}`}
                                                    className="font-bold text-slate-900 hover:text-blue-600 text-sm block"
                                                >
                                                    {ins.company?.business_name}
                                                </Link>
                                                <span className="font-mono text-slate-400 text-[11px]">
                                                    CUIT: {ins.company?.tax_id}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600">
                                                <span className="font-semibold block">
                                                    {ins.inspection_date ? new Date(ins.inspection_date).toLocaleDateString('es-AR') : '-'}
                                                </span>
                                                {(ins.start_time || ins.end_time) && (
                                                    <span className="text-[11px] text-slate-400">
                                                        {ins.start_time || '--'} a {ins.end_time || '--'} hs
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                                                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                                                    {ins.type}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-semibold text-slate-800 block">
                                                    {ins.user?.name}
                                                </span>
                                                {ins.user?.license_number && (
                                                    <span className="font-mono text-[10px] text-slate-400 block">
                                                        Mat. {ins.user.license_number}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge>{ins.status}</Badge>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            style={{ width: `${ins.progress_percentage}%` }}
                                                            className={`h-full rounded-full transition-all ${
                                                                ins.progress_percentage === 100
                                                                    ? 'bg-emerald-500'
                                                                    : ins.progress_percentage > 50
                                                                    ? 'bg-blue-600'
                                                                    : 'bg-amber-500'
                                                            }`}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-slate-700">
                                                        {ins.progress_percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={`/inspections/${ins.id}/pdf`}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Descargar Informe Ejecutivo PDF"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </a>
                                                    <Link
                                                        href={`/inspections/${ins.id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                                                    >
                                                        <span>Auditar</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                                            No se encontraron inspecciones con los filtros seleccionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {inspections?.links?.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                Mostrando {inspections.from || 0} a {inspections.to || 0} de {inspections.total || 0} inspecciones
                            </span>
                            <div className="flex gap-1">
                                {inspections.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
