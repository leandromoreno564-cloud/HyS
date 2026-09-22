import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import { 
    AlertTriangle, 
    Clock, 
    ArrowUpRight
} from 'lucide-react';

// Componente local auxiliar para Tarjetas KPI
function TarjetaEstadistica({ titulo, valor, subtitulo, icon: Icon, color = 'blue' }) {
    const colores = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-slate-500">{titulo}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{valor}</h3>
                {subtitulo && <p className="text-[11px] text-slate-400 mt-0.5">{subtitulo}</p>}
            </div>
            <div className={`p-3 rounded-xl border ${colores[color] || colores.blue}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
    );
}

// Componente local auxiliar para Badges de Prioridad
function InsigniaPrioridad({ children }) {
    const prio = String(children || '').toLowerCase();
    let estilo = 'bg-slate-100 text-slate-700 border-slate-200';

    if (prio.includes('critic')) {
        estilo = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (prio.includes('alta')) {
        estilo = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (prio.includes('media')) {
        estilo = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (prio.includes('baja')) {
        estilo = 'bg-slate-50 text-slate-600 border-slate-200';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${estilo}`}>
            {children}
        </span>
    );
}

export default function CorrectiveMeasuresIndex({ 
    measures, 
    totalCount = 0, 
    pendingCount = 0, 
    overdueCount = 0,
    total_medidas,
    medidas_pendientes,
    medidas_vencidas
}) {
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [overdue, setOverdue] = useState(false);

    // Totales adaptativos (compatibilidad con props de backend en español e inglés)
    const total = totalCount || total_medidas || 0;
    const pendientes = pendingCount || medidas_pendientes || 0;
    const vencidas = overdueCount || medidas_vencidas || 0;

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/medidas-correctivas', {
            estado: status || undefined,
            prioridad: priority || undefined,
            vencidas: overdue ? 1 : undefined,
            status: status || undefined,
            priority: priority || undefined,
            overdue: overdue ? 1 : undefined,
        }, { preserveState: true });
    };

    const handleStatusUpdate = (measureId, newStatus) => {
        router.post(`/medidas-correctivas/${measureId}/estado`, {
            estado: newStatus,
            status: newStatus,
        }, { preserveScroll: true });
    };

    const listData = measures?.data || (Array.isArray(measures) ? measures : []);

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
                    <TarjetaEstadistica
                        titulo="Total de Medidas"
                        valor={total}
                        subtitulo="Generadas en inspecciones"
                        icon={AlertTriangle}
                        color="blue"
                    />
                    <TarjetaEstadistica
                        titulo="Medidas Pendientes"
                        valor={pendientes}
                        subtitulo="En proceso de implementación"
                        icon={Clock}
                        color="amber"
                    />
                    <TarjetaEstadistica
                        titulo="Medidas Vencidas"
                        valor={vencidas}
                        subtitulo="Plazo superado sin resolver"
                        icon={AlertTriangle}
                        color={vencidas > 0 ? 'rose' : 'emerald'}
                    />
                </div>

                {/* Filter Bar */}
                <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center">
                    <div className="w-full md:w-48">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden bg-white text-slate-700"
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
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden bg-white text-slate-700"
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
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Ver únicamente vencidas</span>
                    </label>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ml-auto cursor-pointer"
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
                                {listData.length > 0 ? (
                                    listData.map((measure) => {
                                        const descripcion = measure.descripcion || measure.description;
                                        const costoEstimado = measure.costo_estimado || measure.estimated_cost;
                                        const inspeccionObj = measure.inspeccion || measure.inspection;
                                        const empresaObj = inspeccionObj?.empresa || inspeccionObj?.company;
                                        const razonSocial = empresaObj?.razon_social || empresaObj?.business_name || 'N/A';
                                        const inspeccionId = measure.inspeccion_id || measure.inspection_id;
                                        const prioridad = measure.prioridad || measure.priority || 'Media';
                                        const responsable = measure.responsable || measure.persona_responsable || measure.responsible_person || 'Sin asignar';
                                        const fechaLimite = measure.fecha_limite || measure.deadline;
                                        const estaVencida = Boolean(measure.esta_vencida || measure.is_overdue);
                                        const estado = measure.estado || measure.status || 'Pendiente';

                                        return (
                                            <tr key={measure.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3.5 px-4 font-medium text-slate-900 max-w-sm">
                                                    <p className="line-clamp-2">{descripcion}</p>
                                                    {costoEstimado && (
                                                        <span className="text-[11px] text-slate-400 font-mono">
                                                            Costo: ${Number(costoEstimado).toLocaleString('es-AR')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-bold text-slate-800 block">
                                                        {razonSocial}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                        Insp. #{inspeccionId}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <InsigniaPrioridad>{prioridad}</InsigniaPrioridad>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600">
                                                    {responsable}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-mono text-slate-600 block">
                                                        {fechaLimite ? new Date(fechaLimite).toLocaleDateString('es-AR') : 'Sin fecha'}
                                                    </span>
                                                    {estaVencida && (
                                                        <span className="text-[10px] font-bold text-rose-600 uppercase">
                                                            Vencida
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <select
                                                        value={estado}
                                                        onChange={(e) => handleStatusUpdate(measure.id, e.target.value)}
                                                        className="text-xs font-semibold py-1 px-2 border border-slate-200 rounded-lg bg-white cursor-pointer outline-hidden"
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
                                                        href={`/inspecciones/${inspeccionId}`}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-block"
                                                        title="Ir a Inspección"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
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