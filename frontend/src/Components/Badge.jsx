import React from 'react';

export default function Badge({ children, variant = 'default' }) {
    const variants = {
        default: 'bg-blue-50 text-blue-700 border-blue-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-rose-50 text-rose-700 border-rose-200',
        Completada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'En Progreso': 'bg-blue-50 text-blue-700 border-blue-200',
        Borrador: 'bg-slate-100 text-slate-700 border-slate-200',
        Cancelada: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    const style = variants[children] || variants[variant] || variants.default;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
            {children}
        </span>
    );
}