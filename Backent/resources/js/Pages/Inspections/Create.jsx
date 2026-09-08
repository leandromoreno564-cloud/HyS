import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import { ClipboardCheck, ArrowLeft, Save, Building2, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function InspectionsCreate({ companies = [], selectedCompanyId = '' }) {
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        company_id: selectedCompanyId || (companies[0]?.id || ''),
        inspection_date: today,
        type: 'General',
        start_time: '09:00',
        end_time: '',
        general_observations: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/inspections');
    };

    return (
        <AuthenticatedLayout title="Nueva Inspección Técnica">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/inspections"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al listado
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="pb-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Iniciar Nueva Inspección de Campo
                            </h2>
                            <p className="text-xs text-slate-500">
                                Al guardar, el sistema generará automáticamente la lista de cotejo técnica según el sector industrial de la empresa.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        {/* Empresa */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Establecimiento / Empresa a Inspeccionar *
                            </label>
                            <select
                                value={data.company_id}
                                onChange={(e) => setData('company_id', e.target.value)}
                                required
                                className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white font-medium text-slate-900"
                            >
                                <option value="">Seleccione una empresa</option>
                                {companies.map((comp) => (
                                    <option key={comp.id} value={comp.id}>
                                        {comp.business_name} (Sector: {comp.industry_sector}) - CUIT: {comp.tax_id}
                                    </option>
                                ))}
                            </select>
                            {errors.company_id && <p className="mt-1 text-xs text-rose-600">{errors.company_id}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Fecha */}
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

                            {/* Tipo */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Tipo de Inspección *
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                                >
                                    <option value="General">General (Integral de Establecimiento)</option>
                                    <option value="Específica">Específica (Riesgo puntual / Incendio / Máquinas)</option>
                                    <option value="Seguimiento">Seguimiento (Verificación de Medidas)</option>
                                </select>
                            </div>

                            {/* Hora Inicio */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Hora de Inicio
                                </label>
                                <input
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>

                            {/* Hora Fin */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Hora Estimada de Cierre
                                </label>
                                <input
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                        </div>

                        {/* Observaciones generales */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Alcance u Observaciones Preliminares
                            </label>
                            <textarea
                                rows={3}
                                value={data.general_observations}
                                onChange={(e) => setData('general_observations', e.target.value)}
                                placeholder="Objetivo de la auditoría en terreno, áreas a recorrer, acompañantes..."
                                className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                            />
                        </div>

                        {/* Notice Banner */}
                        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900 leading-relaxed">
                                <strong>Automatización de Checklists:</strong> El motor del sistema inicializará los ítems normativos (seguridad edilicia, instalaciones eléctricas, protección contra incendios, ergonomía, EPP y orden/limpieza) para que puedas evaluarlos de inmediato en pantalla.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href="/inspections"
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
                                {processing ? 'Generando...' : 'Crear e Iniciar Evaluación'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
