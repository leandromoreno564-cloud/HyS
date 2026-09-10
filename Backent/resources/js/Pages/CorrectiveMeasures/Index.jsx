import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import StatCard from '@/Components/StatCard';
import { Link, router } from '@inertiajs/react';
import { 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    Building2, 
    Filter, 
    Calendar, 
    Trash2,
    ArrowUpRight
} from 'lucide-react';

export default function CorrectiveMeasuresIndex({ 
    measures, 
    totalCount = 0, 
    pendingCount = 0, 
    overdueCount = 0 
}) {
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [overdue, setOverdue] = useState(false);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/corrective-measures', {
            status: status || undefined,
            priority: priority || undefined,
            overdue: overdue ? 1 : undefined,
        }, { preserveState: true });
    };

    const handleStatusUpdate = (measureId, newStatus) => {
        router.post(`/corrective-measures/${measureId}/status`, {
            status: newStatus,
        }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout title="Plan de Medidas Correctivas">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Seguimiento de Medidas Correctivas
                        </h2>
                        <p className="text-xs text-slate-500">
                            Control de plazos, asignación de responsables y verificación de subsanación de riesgos
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                    <StatCard
                        title="Total de Medidas"
                        value={totalCount}
                        subtitle="Generadas en inspecciones"
                        icon={AlertTriangle}
                        color="blue"
                    />
                    <StatCard
                        title="Medidas Pendientes"
                        value={pendingCount}
                        subtitle="En proceso de implementación"
                        icon={Clock}
                        color="amber"
                    />
                    <StatCard
                        title="Medidas Vencidas"
                        value={overdueCount}
                        subtitle="Plazo superado sin resolver"
                        icon={AlertTriangle}
                        color={overdueCount > 0 ? 'rose' : 'emerald'}
                    />
                </div>

                {/* Filter Bar */}
                <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center">
                    <div className="w-full md:w-48">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white text-slate-700"
                        >
                            <option value="">Todos los estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Progreso">En Progreso</option>
                            <option value="Completada">Completada</option>
                            <option value="Vencida">Vencida</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white text-slate-700"
                        >
                            <option value="">Todas las prioridades</option>
                            <option value="Crítica">Crítica</option>
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Baja">Baja</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-rose-700 font-semibold cursor-pointer whitespace-nowrap">
                        <input
                            type="checkbox"
                            checked={overdue}
                            onChange={(e) => setOverdue(e.target.checked)}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <span>Ver únicamente vencidas</span>
                    </label>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ml-auto"
                    >
                        Aplicar Filtros
                    </button>
                </form>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Acción Correctiva</th>
                                    <th className="py-3.5 px-4">Empresa / Inspección</th>
                                    <th className="py-3.5 px-4">Prioridad</th>
                                    <th className="py-3.5 px-4">Responsable</th>
                                    <th className="py-3.5 px-4">Fecha Límite</th>
                                    <th className="py-3.5 px-4">Estado</th>
                                    <th className="py-3.5 px-4 text-right">Ver</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {measures?.data?.length > 0 ? (
                                    measures.data.map((measure) => (
                                        <tr key={measure.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-medium text-slate-900 max-w-sm">
                                                <p className="line-clamp-2">{measure.description}</p>
                                                {measure.estimated_cost && (
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        Costo: ${Number(measure.estimated_cost).toLocaleString('es-AR')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-800 block">
                                                    {measure.inspection?.company?.business_name || 'N/A'}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Insp. #{measure.inspection_id}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge>{measure.priority}</Badge>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600">
                                                {measure.responsible_person || 'Sin asignar'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-mono text-slate-600 block">
                                                    {measure.deadline ? new Date(measure.deadline).toLocaleDateString('es-AR') : 'Sin fecha'}
                                                </span>
                                                {measure.is_overdue && (
                                                    <span className="text-[10px] font-bold text-rose-600 uppercase">
                                                        Vencida
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <select
                                                    value={measure.status}
                                                    onChange={(e) => handleStatusUpdate(measure.id, e.target.value)}
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
                                                <Link
                                                    href={`/inspections/${measure.inspection_id}`}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-block"
                                                    title="Ir a Inspección"
                                                >
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                                            No se encontraron medidas correctivas registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {measures?.links?.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                Mostrando {measures.from || 0} a {measures.to || 0} de {measures.total || 0} medidas
                            </span>
                            <div className="flex gap-1">
                                {measures.links.map((link, idx) => (
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
