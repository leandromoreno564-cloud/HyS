import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatCard from '@/Components/StatCard';
import Badge from '@/Components/Badge';
import { Link } from '@inertiajs/react';
import { 
    Building2, 
    ClipboardCheck, 
    Users, 
    Clock, 
    CheckCircle2, 
    TrendingUp,
    FileText
} from 'lucide-react';

export default function AdminDashboard({
    totalCompanies,
    totalUsers,
    totalInspections,
    completedInspections,
    inProgressInspections,
    months = [],
    monthlyCounts = [],
    statusCounts = {},
    topCompaniesWithObs = [],
    recentInspections = []
}) {
    const maxMonthly = Math.max(...monthlyCounts, 1);

    return (
        <AuthenticatedLayout title="Panel de Control General">
            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-linear-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl shadow-blue-950/10">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                            Gestión Estratégica Institucional
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
                            Seguimiento de Seguridad e Higiene Laboral
                        </h2>
                        <p className="text-xs text-blue-100/80 mt-1">
                            Monitoreo centralizado de empresas, inspectores e inspecciones.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/companies/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-950 text-xs font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
                        >
                            <Building2 className="w-4 h-4" />
                            Registrar Empresa
                        </Link>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    <StatCard
                        title="Empresas Registradas"
                        value={totalCompanies}
                        subtitle="Establecimientos auditables"
                        icon={Building2}
                        color="blue"
                    />
                    <StatCard
                        title="Total de Inspecciones"
                        value={totalInspections}
                        subtitle={`${completedInspections} finalizadas • ${inProgressInspections} en curso`}
                        icon={ClipboardCheck}
                        color="emerald"
                    />
                    <StatCard
                        title="Inspectores & Usuarios"
                        value={totalUsers}
                        subtitle="Cuerpo técnico matriculado"
                        icon={Users}
                        color="indigo"
                    />
                </div>

                {/* Charts & Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Trend Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Evolución Mensual de Inspecciones
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Cantidad de auditorías realizadas en los últimos 6 meses
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                Semestre Actual
                            </span>
                        </div>

                        {/* Interactive Modern Bar Chart */}
                        <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 pt-6 px-2">
                            {months.map((month, idx) => {
                                const count = monthlyCounts[idx] || 0;
                                const heightPercent = Math.max(Math.round((count / maxMonthly) * 100), 8);
                                return (
                                    <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                                        <span className="text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {count}
                                        </span>
                                        <div className="w-full bg-slate-100 rounded-t-xl h-36 flex items-end p-1">
                                            <div
                                                style={{ height: `${heightPercent}%` }}
                                                className="w-full bg-linear-to-t from-blue-600 to-indigo-500 rounded-lg group-hover:from-blue-700 group-hover:to-indigo-600 transition-all duration-300 shadow-xs"
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

                    {/* Inspection Status Breakdown */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Estado de Inspecciones
                            </h3>
                            <p className="text-xs text-slate-500">
                                Proporción por etapa del ciclo
                            </p>

                            <div className="mt-6 space-y-3">
                                {Object.entries(statusCounts).map(([status, count]) => {
                                    const pct = totalInspections > 0 ? Math.round((count / totalInspections) * 100) : 0;
                                    return (
                                        <div key={status} className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-slate-700">{status}</span>
                                                <span className="text-slate-500">{count} ({pct}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${pct}%` }}
                                                    className={`h-full rounded-full ${
                                                        status === 'Completadas' ? 'bg-emerald-500' :
                                                        status === 'En Progreso' ? 'bg-blue-500' :
                                                        status === 'Borradores' ? 'bg-slate-400' : 'bg-rose-500'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Tables Row: Recent Inspections & Critical Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Inspections */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Inspecciones Recientes
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Últimos informes ingresados al sistema
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                                        <th className="pb-3">Empresa</th>
                                        <th className="pb-3">Fecha</th>
                                        <th className="pb-3">Estado</th>
                                        <th className="pb-3 text-right">Avance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentInspections.length > 0 ? (
                                        recentInspections.map((ins) => (
                                            <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 font-semibold text-slate-900">
                                                    {ins.company?.business_name}
                                                    <span className="block text-[11px] font-normal text-slate-400">
                                                        {ins.user?.name}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-slate-500">
                                                    {ins.inspection_date ? new Date(ins.inspection_date).toLocaleDateString('es-AR') : '-'}
                                                </td>
                                                <td className="py-3">
                                                    <Badge>{ins.status}</Badge>
                                                </td>
                                                <td className="py-3 text-right font-bold text-slate-700">
                                                    {ins.progress_percentage}%
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                                                No hay inspecciones recientes registradas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
