import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatCard from '@/Components/StatCard';
import Badge from '@/Components/Badge';
import { Link } from '@inertiajs/react';
import { 
    ClipboardCheck, 
    Clock, 
    Building2, 
    AlertTriangle, 
    Plus, 
    CheckCircle2, 
    Calendar,
    ArrowUpRight
} from 'lucide-react';

export default function InspectorDashboard({
    totalMyInspections,
    inProgressCount,
    completedCount,
    criticalObsCount,
    myPendingMeasures,
    myAlerts = [],
    months = [],
    monthlyCounts = [],
    recentInspections = [],
    myCompanies = []
}) {
    const maxMonthly = Math.max(...monthlyCounts, 1);

    return (
        <AuthenticatedLayout title="Mi Panel de Inspector">
            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-linear-to-r from-slate-900 to-blue-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-950/10">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                            Espacio de Trabajo Operativo
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
                            Mis Inspecciones y Tareas en Terreno
                        </h2>
                        <p className="text-xs text-slate-300 mt-1">
                            Gestiona tus checklists técnicos, observaciones con fotos y medidas correctivas.
                        </p>
                    </div>
                    <div>
                        <Link
                            href="/inspections/create"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                        >
                            <Plus className="w-4 h-4" />
                            Iniciar Inspección en Terreno
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <StatCard
                        title="Mis Inspecciones"
                        value={totalMyInspections}
                        subtitle="Historial total asignado"
                        icon={ClipboardCheck}
                        color="blue"
                    />
                    <StatCard
                        title="En Progreso"
                        value={inProgressCount}
                        subtitle="Evaluaciones abiertas"
                        icon={Clock}
                        color="amber"
                    />
                    <StatCard
                        title="Finalizadas"
                        value={completedCount}
                        subtitle="Con informe PDF generado"
                        icon={CheckCircle2}
                        color="emerald"
                    />
                    <StatCard
                        title="Medidas Pendientes"
                        value={myPendingMeasures}
                        subtitle={`${criticalObsCount} hallazgos críticos`}
                        icon={AlertTriangle}
                        color={criticalObsCount > 0 ? 'rose' : 'indigo'}
                    />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Recent Inspections & Chart */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Inspections list */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Mis Inspecciones Recientes
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Accede rápidamente al checklist para continuar evaluando
                                    </p>
                                </div>
                                <Link
                                    href="/inspections"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Ver todas
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                                            <th className="pb-3">Empresa</th>
                                            <th className="pb-3">Fecha</th>
                                            <th className="pb-3">Estado</th>
                                            <th className="pb-3">Avance</th>
                                            <th className="pb-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentInspections.length > 0 ? (
                                            recentInspections.map((ins) => (
                                                <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-3 font-semibold text-slate-900">
                                                        {ins.company?.business_name}
                                                    </td>
                                                    <td className="py-3 text-slate-500">
                                                        {ins.inspection_date ? new Date(ins.inspection_date).toLocaleDateString('es-AR') : '-'}
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge>{ins.status}</Badge>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                                <div 
                                                                    style={{ width: `${ins.progress_percentage}%` }} 
                                                                    className="bg-blue-600 h-full rounded-full" 
                                                                />
                                                            </div>
                                                            <span className="font-semibold text-slate-700">
                                                                {ins.progress_percentage}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <Link
                                                            href={`/inspections/${ins.id}`}
                                                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                                                        >
                                                            Abrir
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                                                    No tienes inspecciones activas asignadas.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Monthly Bar Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <h3 className="text-sm font-bold text-slate-900 mb-1">
                                Rendimiento Personal en los Últimos 6 Meses
                            </h3>
                            <p className="text-xs text-slate-500 mb-6">
                                Inspecciones completadas o registradas por mes
                            </p>

                            <div className="h-40 flex items-end justify-between gap-2 sm:gap-6 pt-4 px-2">
                                {months.map((month, idx) => {
                                    const count = monthlyCounts[idx] || 0;
                                    const heightPercent = Math.max(Math.round((count / maxMonthly) * 100), 8);
                                    return (
                                        <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                            <span className="text-xs font-bold text-slate-700">{count}</span>
                                            <div className="w-full bg-slate-100 rounded-t-xl h-28 flex items-end p-1">
                                                <div
                                                    style={{ height: `${heightPercent}%` }}
                                                    className="w-full bg-blue-600 rounded-lg shadow-xs"
                                                />
                                            </div>
                                            <span className="text-[11px] font-medium text-slate-500 truncate max-w-[50px]">
                                                {month}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Assigned Companies & Alerts */}
                    <div className="space-y-6">
                        {/* Companies assigned */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Empresas Asignadas
                                </h3>
                                <Link href="/companies" className="text-xs font-semibold text-blue-600">
                                    Ver todas
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {myCompanies.length > 0 ? (
                                    myCompanies.map((comp) => (
                                        <div key={comp.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">
                                                    {comp.business_name}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    {comp.industry_sector} • CUIT: {comp.tax_id}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/inspections/create?company_id=${comp.id}`}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                                                title="Nueva Inspección"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 py-4 text-center">
                                        No tienes empresas asignadas actualmente.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Critical Alerts */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <h3 className="text-sm font-bold text-slate-900 mb-1">
                                Mis Alertas y Próximos Vencimientos
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Medidas con plazo menor a 3 días o críticas
                            </p>

                            <div className="space-y-3">
                                {myAlerts.length > 0 ? (
                                    myAlerts.map((alert) => (
                                        <div key={alert.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-amber-900">
                                                    {alert.inspection?.company?.business_name}
                                                </span>
                                                <Badge>{alert.priority}</Badge>
                                            </div>
                                            <p className="text-xs text-slate-700 line-clamp-2">
                                                {alert.description}
                                            </p>
                                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                                <span>Plazo: {alert.deadline ? new Date(alert.deadline).toLocaleDateString('es-AR') : 'Sin fecha'}</span>
                                                <Link
                                                    href={`/inspections/${alert.inspection_id}`}
                                                    className="font-semibold text-blue-600 hover:underline"
                                                >
                                                    Ver inspección
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 py-4 text-center">
                                        No tienes medidas urgentes por vencer.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
