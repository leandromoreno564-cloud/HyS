import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import { ClipboardCheck, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function InspectionsCreate({ 
    companies = [], 
    empresas = [], 
    selectedCompanyId = '', 
    empresaId = '' 
}) {
    const today = new Date().toISOString().split('T')[0];
    const listaEmpresas = empresas.length > 0 ? empresas : companies;
    const initialCompanyId = selectedCompanyId || empresaId || (listaEmpresas[0]?.id || '');

    const { data, setData, post, processing, errors } = useForm({
        // Sincronización de atributos en español e inglés
        empresa_id: initialCompanyId,
        company_id: initialCompanyId,
        fecha_inicio: today,
        inspection_date: today,
        tipo: 'General',
        type: 'General',
        hora_inicio: '09:00',
        start_time: '09:00',
        hora_fin: '',
        end_time: '',
        observaciones_generales: '',
        general_observations: '',
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
        post('/inspecciones');
    };

    return (
        <AuthenticatedLayout title="Nueva Inspección Técnica">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/inspecciones"
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
                                value={data.empresa_id}
                                onChange={(e) => handleChange('empresa_id', 'company_id', e.target.value)}
                                required
                                className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden bg-white font-medium text-slate-900 cursor-pointer"
                            >
                                <option value="">Seleccione una empresa</option>
                                {listaEmpresas.map((comp) => {
                                    const razonSocial = comp.razon_social || comp.business_name || 'Sin nombre';
                                    const rubro = comp.rubro || comp.sector_industrial || comp.industry_sector || 'General';
                                    const cuit = comp.cuit || comp.tax_id || '-';

                                    return (
                                        <option key={comp.id} value={comp.id}>
                                            {razonSocial} (Sector: {rubro}) - CUIT: {cuit}
                                        </option>
                                    );
                                })}
                            </select>
                            {(errors.empresa_id || errors.company_id) && (
                                <p className="mt-1 text-xs text-rose-600">
                                    {errors.empresa_id || errors.company_id}
                                </p>
                            )}
                        </div>

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
                                    <option value="General">General (Integral de Establecimiento)</option>
                                    <option value="Específica">Específica (Riesgo puntual / Incendio / Máquinas)</option>
                                    <option value="Seguimiento">Seguimiento (Verificación de Medidas)</option>
                                </select>
                                {(errors.tipo || errors.type) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.tipo || errors.type}
                                    </p>
                                )}
                            </div>

                            {/* Hora Inicio */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Hora de Inicio
                                </label>
                                <input
                                    type="time"
                                    value={data.hora_inicio}
                                    onChange={(e) => handleChange('hora_inicio', 'start_time', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden"
                                />
                                {(errors.hora_inicio || errors.start_time) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.hora_inicio || errors.start_time}
                                    </p>
                                )}
                            </div>

                            {/* Hora Fin */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Hora Estimada de Cierre
                                </label>
                                <input
                                    type="time"
                                    value={data.hora_fin}
                                    onChange={(e) => handleChange('hora_fin', 'end_time', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden"
                                />
                                {(errors.hora_fin || errors.end_time) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.hora_fin || errors.end_time}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Observaciones generales */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Alcance u Observaciones Preliminares
                            </label>
                            <textarea
                                rows={3}
                                value={data.observaciones_generales}
                                onChange={(e) => handleChange('observaciones_generales', 'general_observations', e.target.value)}
                                placeholder="Objetivo de la auditoría en terreno, áreas a recorrer, acompañantes..."
                                className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden"
                            />
                            {(errors.observaciones_generales || errors.general_observations) && (
                                <p className="mt-1 text-xs text-rose-600">
                                    {errors.observaciones_generales || errors.general_observations}
                                </p>
                            )}
                        </div>

                        {/* Notice Banner */}
                        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900 leading-relaxed">
                                <strong>Automatización de Checklists:</strong> El motor del sistema inicializará los ítems normativos (seguridad edilicia, instalaciones eléctricas, protección contra incendios, ergonomía, EPP y orden/limpieza) para que puedas evaluarlos de inmediato en pantalla.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href="/inspecciones"
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
                                {processing ? 'Generando...' : 'Crear e Iniciar Evaluación'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}