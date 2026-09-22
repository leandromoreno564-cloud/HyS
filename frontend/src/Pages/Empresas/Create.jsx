import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import { Building2, Save, ArrowLeft } from 'lucide-react';

export default function CompaniesCreate({ inspectors = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        // Claves en español (backend primario) y en inglés (retrocompatibilidad)
        razon_social: '',
        business_name: '',
        cuit: '',
        tax_id: '',
        rubro: 'Metalmecánica',
        industry_sector: 'Metalmecánica',
        direccion: '',
        address: '',
        telefono: '',
        phone: '',
        email: '',
        cantidad_empleados: 10,
        employee_count: 10,
        contacto_nombre: '',
        contact_person: '',
        inspectores_ids: [],
        inspector_ids: [],
    });

    const sectors = [
        'Metalmecánica',
        'Construcción y Obra Civil',
        'Agroindustria & Alimentos',
        'Química & Farmacéutica',
        'Minería & Extracción',
        'Logística y Transporte',
        'Servicios de Salud',
        'Comercio y Servicios',
    ];

    const handleChange = (fieldEs, fieldEn, value) => {
        setData((prevData) => ({
            ...prevData,
            [fieldEs]: value,
            [fieldEn]: value,
        }));
    };

    const toggleInspector = (id) => {
        const currentIds = data.inspectores_ids.length > 0 ? data.inspectores_ids : data.inspector_ids;
        const newIds = currentIds.includes(id)
            ? currentIds.filter((i) => i !== id)
            : [...currentIds, id];

        setData((prevData) => ({
            ...prevData,
            inspectores_ids: newIds,
            inspector_ids: newIds,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/empresas');
    };

    return (
        <AuthenticatedLayout title="Registrar Nueva Empresa">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/empresas"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al listado
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="pb-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Datos del Establecimiento / Empresa
                            </h2>
                            <p className="text-xs text-slate-500">
                                Ingrese los datos fiscales y asigne a los inspectores de higiene y seguridad responsables.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Razón Social */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Razón Social / Nombre Comercial *
                                </label>
                                <input
                                    type="text"
                                    value={data.razon_social}
                                    onChange={(e) => handleChange('razon_social', 'business_name', e.target.value)}
                                    placeholder="Ej: Industrias Metalúrgicas del Norte S.A."
                                    required
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                                />
                                {(errors.razon_social || errors.business_name) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.razon_social || errors.business_name}
                                    </p>
                                )}
                            </div>

                            {/* CUIT */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    CUIT / RUC *
                                </label>
                                <input
                                    type="text"
                                    value={data.cuit}
                                    onChange={(e) => handleChange('cuit', 'tax_id', e.target.value)}
                                    placeholder="30-71234567-8"
                                    required
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden font-mono"
                                />
                                {(errors.cuit || errors.tax_id) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.cuit || errors.tax_id}
                                    </p>
                                )}
                            </div>

                            {/* Sector Industrial */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Sector Industrial *
                                </label>
                                <select
                                    value={data.rubro}
                                    onChange={(e) => handleChange('rubro', 'industry_sector', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden bg-white"
                                >
                                    {sectors.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {(errors.rubro || errors.industry_sector) && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.rubro || errors.industry_sector}
                                    </p>
                                )}
                            </div>

                            {/* Dirección */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Dirección del Establecimiento
                                </label>
                                <input
                                    type="text"
                                    value={data.direccion}
                                    onChange={(e) => handleChange('direccion', 'address', e.target.value)}
                                    placeholder="Av. Industrial 1234, Parque Industrial, Palpalá, Jujuy"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                                />
                            </div>

                            {/* Contact Person */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Persona de Contacto / Responsable
                                </label>
                                <input
                                    type="text"
                                    value={data.contacto_nombre}
                                    onChange={(e) => handleChange('contacto_nombre', 'contact_person', e.target.value)}
                                    placeholder="Ing. Carlos Pérez (Jefe de Planta)"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={data.telefono}
                                    onChange={(e) => handleChange('telefono', 'phone', e.target.value)}
                                    placeholder="+54 388 423-4567"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="seguridad@empresa.com"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                                />
                                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                            </div>

                            {/* Employee Count */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Cantidad de Empleados
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.cantidad_empleados}
                                    onChange={(e) => handleChange('cantidad_empleados', 'employee_count', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                                />
                            </div>
                        </div>

                        {/* Asignación de Inspectores */}
                        <div className="pt-6 border-t border-slate-100">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                                Inspectores Asignados (Permisos de Inspección)
                            </label>
                            <p className="text-xs text-slate-500 mb-4">
                                Seleccione qué inspectores o técnicos tendrán acceso para auditar esta empresa.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {inspectors.map((insp) => {
                                    const nombreInspector = insp.nombre || insp.name;
                                    const matriculaInspector = insp.matricula || insp.license_number;
                                    const selected = data.inspectores_ids.includes(insp.id);

                                    return (
                                        <div
                                            key={insp.id}
                                            onClick={() => toggleInspector(insp.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                                                selected
                                                    ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => {}}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{nombreInspector}</p>
                                                <p className="text-[11px] text-slate-500 font-mono">
                                                    {matriculaInspector ? `Mat. ${matriculaInspector}` : insp.email}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href="/empresas"
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
                                {processing ? 'Guardando...' : 'Registrar Empresa'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}