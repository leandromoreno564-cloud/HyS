import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import { Bell, CheckCheck, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function NotificationsIndex({ notifications }) {
    const handleMarkAllRead = () => {
        router.post('/notifications/read-all');
    };

    const handleRead = (notification) => {
        router.post(`/notifications/${notification.id}/read`);
    };

    return (
        <AuthenticatedLayout title="Centro de Notificaciones">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Avisos y Alertas del Sistema
                        </h2>
                        <p className="text-xs text-slate-500">
                            Recordatorios de vencimientos, asignaciones de empresas e informes
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                    >
                        <CheckCheck className="w-4 h-4 text-blue-600" />
                        Marcar todas como leídas
                    </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
                    {notifications?.data?.length > 0 ? (
                        notifications.data.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleRead(n)}
                                className={`p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                                    n.is_read ? 'hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    n.type === 'danger' ? 'bg-rose-100 text-rose-700' :
                                    n.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    <Bell className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className={`text-xs font-bold ${n.is_read ? 'text-slate-800' : 'text-blue-950 font-extrabold'}`}>
                                            {n.title}
                                        </h4>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {new Date(n.created_at).toLocaleDateString('es-AR', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">
                                        {n.message}
                                    </p>
                                </div>

                                {n.link && (
                                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 self-center" />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-400 text-xs">
                            No tienes notificaciones pendientes.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
