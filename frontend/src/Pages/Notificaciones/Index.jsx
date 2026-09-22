import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import { Bell, CheckCheck, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function NotificationsIndex({ notifications }) {
    // Normalización de lista (soporta paginación Inertia o arrays simples)
    const notificationList = Array.isArray(notifications) 
        ? notifications 
        : (notifications?.data || []);

    const handleMarkAllRead = () => {
        router.post('/notificaciones/marcar-todas-leidas', {}, {
            preserveScroll: true,
        });
    };

    const handleRead = (n) => {
        const targetLink = n.enlace || n.link || n.url || n.data?.enlace || n.data?.link || n.data?.url;

        router.post(`/notificaciones/${n.id}/marcar-leida`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (targetLink) {
                    router.visit(targetLink);
                }
            }
        });
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                    >
                        <CheckCheck className="w-4 h-4 text-blue-600" />
                        Marcar todas como leídas
                    </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
                    {notificationList.length > 0 ? (
                        notificationList.map((n) => {
                            // Adaptabilidad de estructura de datos (Español / Inglés / DatabaseNotification Data)
                            const isRead = n.leida ?? n.is_read ?? (n.read_at !== null && n.read_at !== undefined);
                            const tipo = n.tipo || n.type || n.data?.tipo || n.data?.type || 'info';
                            const titulo = n.titulo || n.title || n.data?.titulo || n.data?.title || 'Notificación';
                            const mensaje = n.mensaje || n.message || n.data?.mensaje || n.data?.message || '';
                            const enlace = n.enlace || n.link || n.url || n.data?.enlace || n.data?.link || n.data?.url;
                            const fechaBruta = n.creado_el || n.created_at;

                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleRead(n)}
                                    className={`p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                                        isRead 
                                            ? 'hover:bg-slate-50/80' 
                                            : 'bg-blue-50/40 hover:bg-blue-50/70'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        tipo === 'danger' || tipo === 'critico' ? 'bg-rose-100 text-rose-700' :
                                        tipo === 'warning' || tipo === 'alerta' ? 'bg-amber-100 text-amber-700' : 
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        <Bell className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`text-xs ${isRead ? 'font-bold text-slate-800' : 'font-extrabold text-blue-950'}`}>
                                                {titulo}
                                            </h4>
                                            {fechaBruta && (
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                                                    {new Date(fechaBruta).toLocaleDateString('es-AR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                            {mensaje}
                                        </p>
                                    </div>

                                    {enlace && (
                                        <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 self-center" />
                                    )}
                                </div>
                            );
                        })
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