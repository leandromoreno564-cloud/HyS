import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', dot = true, className = '' }) {
    const variantMap = {
        default: 'bg-slate-100 text-slate-700 border-slate-200',
        primary: 'bg-blue-50 text-blue-700 border-blue-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        danger: 'bg-rose-50 text-rose-700 border-rose-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        // HyS Statuses
        'Cumple': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'No Cumple': 'bg-rose-50 text-rose-700 border-rose-200',
        'No Aplica': 'bg-slate-100 text-slate-600 border-slate-200',
        'Pendiente': 'bg-amber-50 text-amber-700 border-amber-200',
        // Inspection Statuses
        'Borrador': 'bg-slate-100 text-slate-700 border-slate-300',
        'En Progreso': 'bg-blue-50 text-blue-700 border-blue-200',
        'Completada': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Cancelada': 'bg-rose-50 text-rose-700 border-rose-200',
        // Risk / Severity
        'Bajo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Medio': 'bg-amber-50 text-amber-700 border-amber-200',
        'Alto': 'bg-rose-50 text-rose-700 border-rose-200',
        'Menor': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Moderado': 'bg-amber-50 text-amber-700 border-amber-200',
        'Mayor': 'bg-orange-50 text-orange-700 border-orange-200',
        'Crítico': 'bg-rose-50 text-rose-700 border-rose-200',
        'Crítica': 'bg-rose-50 text-rose-700 border-rose-200',
        // Observation Type
        'Hallazgo': 'bg-rose-50 text-rose-700 border-rose-200',
        'Buena práctica': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Mejora': 'bg-blue-50 text-blue-700 border-blue-200',
        // User Status
        'Activo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Inactivo': 'bg-slate-100 text-slate-500 border-slate-200',
    };

    const dotColorMap = {
        'Cumple': 'bg-emerald-500',
        'No Cumple': 'bg-rose-500',
        'No Aplica': 'bg-slate-400',
        'Pendiente': 'bg-amber-500',
        'Borrador': 'bg-slate-400',
        'En Progreso': 'bg-blue-500',
        'Completada': 'bg-emerald-500',
        'Cancelada': 'bg-rose-500',
        'Bajo': 'bg-emerald-500',
        'Medio': 'bg-amber-500',
        'Alto': 'bg-rose-500',
        'Menor': 'bg-emerald-500',
        'Moderado': 'bg-amber-500',
        'Mayor': 'bg-orange-500',
        'Crítico': 'bg-rose-500',
        'Crítica': 'bg-rose-500',
        'success': 'bg-emerald-500',
        'danger': 'bg-rose-500',
        'warning': 'bg-amber-500',
        'primary': 'bg-blue-500',
    };

    const sizeMap = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    const key = variantMap[children] ? children : variant;
    const badgeStyle = variantMap[key] || variantMap.default;
    const dotColor = dotColorMap[key] || 'bg-current';

    return (
        <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${badgeStyle} ${sizeMap[size] || sizeMap.md} ${className}`}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
            {children}
        </span>
    );
}
