import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import { ClipboardCheck, ArrowLeft, Save } from 'lucide-react';

export default function InspectionsEdit({ inspection, companies = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        inspection_date: inspection.inspection_date ? inspection.inspection_date.split('T')[0] : '',
        type: inspection.type || 'General',
        status: inspection.status || 'En Progreso',
        start_time: inspection.start_time || '',
        end_time: inspection.end_time || '',
        general_observations: inspection.general_observations || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/inspections/${inspection.id}`);
    };

    return (
        <AuthenticatedLayout title={`Editar Metadatos: Inspección #${inspection.id}`}>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/inspections/${inspection.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a la inspección
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="pb-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Modificar Inspección en {inspection.company?.business_name}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Ajuste la fecha, horarios de auditoría o estado global de la inspección.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Fecha de Inspección *
                                </label>
                                <input
                                    type="date"
                                    value={data.inspection_date}
                                    onChange={(e) => setData('inspection_date', e.target.value)}
                                    required
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                                {errors.inspection_date && <p className="mt-1 text-xs text-rose-600">{errors.inspection_date}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Tipo de Inspección *
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                                >
                                    <option value="General">General</option>
                                    <option value="Específica">Específica</option>
                                    <option value="Seguimiento">Seguimiento</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Estado de la Inspección *
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                                >
                                    <option value="Borrador">Borrador</option>
                                    <option value="En Progreso">En Progreso</option>
                                    <option value="Completada">Completada</option>
                                    <option value="Cancelada">Cancelada</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Horarios (Inicio y Cierre)
                                </label>
                                <div className="grid grid-cols-2 gap-2 mt-1.5">
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                                    />
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Observaciones Generales
                            </label>
                            <textarea
                                rows={3}
                                value={data.general_observations}
                                onChange={(e) => setData('general_observations', e.target.value)}
                                className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href={`/inspections/${inspection.id}`}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Guardando...' : 'Guardar Modificaciones'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
