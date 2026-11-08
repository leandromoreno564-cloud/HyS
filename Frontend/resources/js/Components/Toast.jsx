import React, { useEffect, useRef, useState } from 'react';
import { Check, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';

const styles = {
    success: { icon: Check, label: 'Cambios guardados', accent: 'bg-emerald-500', iconClass: 'bg-emerald-50 text-emerald-600' },
    error: { icon: CircleAlert, label: 'No se pudo completar', accent: 'bg-rose-500', iconClass: 'bg-rose-50 text-rose-600' },
    warning: { icon: TriangleAlert, label: 'Atención', accent: 'bg-amber-400', iconClass: 'bg-amber-50 text-amber-700' },
    info: { icon: Info, label: 'Información', accent: 'bg-sky-500', iconClass: 'bg-sky-50 text-sky-600' },
};

export default function Toast({ message, type = 'success', onClose, action }) {
    const { icon: Icon, label, accent, iconClass } = styles[type] || styles.success;
    const [phase, setPhase] = useState('entering');
    const closeTimer = useRef(null);

    const closeToast = () => {
        if (closeTimer.current) return;

        setPhase('leaving');
        closeTimer.current = window.setTimeout(onClose, 360);
    };

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => setPhase('visible'));
        const timer = window.setTimeout(closeToast, 4200);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timer);
            if (closeTimer.current) window.clearTimeout(closeTimer.current);
        };
    }, [message]);

    return (
        <div className={`fixed right-4 top-20 z-[70] w-[calc(100%-2rem)] max-w-sm transition-all duration-300 ease-out sm:right-6 ${phase === 'visible' ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'}`} role="status" aria-live="polite">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-xl shadow-slate-900/10">
                <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
                <div className="flex items-center gap-3 pl-1">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-800">{message}</p>
                        {action && (
                            <a
                                href={action.href}
                                onClick={closeToast}
                                className="mt-2 inline-flex text-xs font-bold text-sky-700 transition hover:text-sky-900 hover:underline"
                            >
                                {action.label}
                            </a>
                        )}
                    </div>
                    <button type="button" onClick={closeToast} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar notificación">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
