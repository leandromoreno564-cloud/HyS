import React from 'react';
import { Check, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';

const styles = {
    success: { icon: Check, label: 'Cambios guardados', accent: 'bg-emerald-400', iconClass: 'bg-emerald-400/15 text-emerald-300' },
    error: { icon: CircleAlert, label: 'No se pudo completar', accent: 'bg-rose-400', iconClass: 'bg-rose-400/15 text-rose-300' },
    warning: { icon: TriangleAlert, label: 'Atención', accent: 'bg-amber-400', iconClass: 'bg-amber-400/15 text-amber-300' },
    info: { icon: Info, label: 'Información', accent: 'bg-sky-400', iconClass: 'bg-sky-400/15 text-sky-300' },
};

export default function Toast({ message, type = 'success', onClose }) {
    const { icon: Icon, label, accent, iconClass } = styles[type] || styles.success;

    return (
        <div className="fixed right-4 top-20 z-[70] w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-right-8 fade-in duration-300 sm:right-6" role="status" aria-live="polite">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-white shadow-2xl shadow-slate-950/35">
                <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
                <div className="flex items-center gap-3 pl-1">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-100">{message}</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar notificación">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
