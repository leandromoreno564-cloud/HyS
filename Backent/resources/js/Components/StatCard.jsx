import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend = null }) {
    const colorSchemes = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-100',
        },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100',
        },
        rose: {
            bg: 'bg-rose-50',
            text: 'text-rose-600',
            border: 'border-rose-100',
        },
        indigo: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            border: 'border-indigo-100',
        },
    };

    const scheme = colorSchemes[color] || colorSchemes.blue;

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {title}
                </span>
                {Icon && (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scheme.bg} ${scheme.text}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {value}
                </span>
                {trend && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {trend}
                    </span>
                )}
            </div>
            {subtitle && (
                <p className="mt-1 text-xs text-slate-500 truncate">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
