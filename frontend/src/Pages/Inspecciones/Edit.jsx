import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import { ClipboardCheck, ArrowLeft, Save } from 'lucide-react';

export default function InspectionsEdit({ inspection, companies = [] }) {
    // Extracción adaptativa de datos iniciales
    const fechaInicial = inspection?.fecha_inicio || inspection?.inspection_date || '';
    const fechaFormateada = fechaInicial ? fechaInicial.split('T')[0] : '';
    const tipoInicial = inspection?.tipo || inspection?.type || 'General';
    const estadoInicial = inspection?.estado || inspection?.status || 'En Progreso';
    const horaInicioInicial = inspection?.hora_inicio || inspection?.start_time || '';
    const horaFinInicial = inspection?.hora_fin || inspection?.end_time || '';
    const obsInicial = inspection?.observaciones_generales || inspection?.general_observations || '';
    
    const empresaObj = inspection?.empresa || inspection?.company;
    const razonSocial = empresaObj?.razon_social || empresaObj?.business_name || 'Empresa';

    const { data, setData, put, processing, errors } = useForm({
        // Sincronización de campos en español e inglés
        fecha_inicio: fechaFormateada,
        inspection_date: fechaFormateada,
        tipo: tipoInicial,
        type: tipoInicial,
        estado: estadoInicial,
        status: estadoInicial,
        hora_inicio: horaInicioInicial,
        start_time: horaInicioInicial,
        hora_fin: horaFinInicial,
        end_time: horaFinInicial,
        observaciones_generales: obsInicial,
        general_observations: obsInicial,
    });

    const handleChange = (fieldEs, fieldEn, value) => {
        setData((prev) => ({
            ...prev,
            [fieldEs]: value,
            [fieldEn]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/inspecciones/${inspection.id}`);
    };

    return (
        <AuthenticatedLayout title={`Editar Metadatos: Inspección #${inspection.id}`}>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/inspecciones/${inspection.id}`}
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
                                Modificar Inspección en {razonSocial}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Ajuste la fecha, horarios de auditoría o estado global de la inspección.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Fecha */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Fecha de Inspección *
                                </label>
                                <input
                                    type="date"
                                    value={data.fecha_inicio}
                                    onChange={(e) => handleChange('fecha_inicio', 'inspection_date', e.target.value)}
                                    required
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden"
                                />
                                {(errors.fecha_inicio || errors.inspection_date) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.fecha_inicio || errors.inspection_date}
                                    </p>
                                )}
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Tipo de Inspección *
                                </label>
                                <select
                                    value={data.tipo}
                                    onChange={(e) => handleChange('tipo', 'type', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden bg-white cursor-pointer"
                                >
                                    <option value="General">General</option>
                                    <option value="Específica">Específica</option>
                                    <option value="Seguimiento">Seguimiento</option>
                                </select>
                                {(errors.tipo || errors.type) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.tipo || errors.type}
                                    </p>
                                )}
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Estado de la Inspección *
                                </label>
                                <select
                                    value={data.estado}
                                    onChange={(e) => handleChange('estado', 'status', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden bg-white cursor-pointer"
                                >
                                    <option value="Borrador">Borrador</option>
                                    <option value="En Progreso">En Progreso</option>
                                    <option value="Completada">Completada</option>
                                    <option value="Cancelada">Cancelada</option>
                                </select>
                                {(errors.estado || errors.status) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.estado || errors.status}
                                    </p>
                                )}
                            </div>

                            {/* Horarios */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Horarios (Inicio y Cierre)
                                </label>
                                <div className="grid grid-cols-2 gap-2 mt-1.5">
                                    <input
                                        type="time"
                                        value={data.hora_inicio}
                                        onChange={(e) => handleChange('hora_inicio', 'start_time', e.target.value)}
                                        className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden"
                                    />
                                    <input
                                        type="time"
                                        value={data.hora_fin}
                                        onChange={(e) => handleChange('hora_fin', 'end_time', e.target.value)}
                                        className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden"
                                    />
                                </div>
                                {(errors.hora_inicio || errors.start_time || errors.hora_fin || errors.end_time) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.hora_inicio || errors.start_time || errors.hora_fin || errors.end_time}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Observaciones generales */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Observaciones Generales
                            </label>
                            <textarea
                                rows={3}
                                value={data.observaciones_generales}
                                onChange={(e) => handleChange('observaciones_generales', 'general_observations', e.target.value)}
                                className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden"
                            />
                            {(errors.observaciones_generales || errors.general_observations) && (
                                <p className="mt-1 text-xs text-rose-600">
                                    {errors.observaciones_generales || errors.general_observations}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href={`/inspecciones/${inspection.id}`}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
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