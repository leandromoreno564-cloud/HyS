import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import { Building2, Save, ArrowLeft, Users, Shield } from 'lucide-react';

export default function CompaniesCreate({ inspectors = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        tax_id: '',
        industry_sector: 'Metalmecánica',
        address: '',
        phone: '',
        email: '',
        employee_count: 10,
        website: '',
        contact_person: '',
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

    const toggleInspector = (id) => {
        if (data.inspector_ids.includes(id)) {
            setData('inspector_ids', data.inspector_ids.filter((i) => i !== id));
        } else {
            setData('inspector_ids', [...data.inspector_ids, id]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/companies');
    };

    return (
        <AuthenticatedLayout title="Registrar Nueva Empresa">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/companies"
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
                                    value={data.business_name}
                                    onChange={(e) => setData('business_name', e.target.value)}
                                    placeholder="Ej: Industrias Metalúrgicas del Norte S.A."
                                    required
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                                {errors.business_name && <p className="mt-1 text-xs text-rose-600">{errors.business_name}</p>}
                            </div>

                            {/* CUIT */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    CUIT / RUC *
                                </label>
                                <input
                                    type="text"
                                    value={data.tax_id}
                                    onChange={(e) => setData('tax_id', e.target.value)}
                                    placeholder="30-71234567-8"
                                    required
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-mono"
                                />
                                {errors.tax_id && <p className="mt-1 text-xs text-rose-600">{errors.tax_id}</p>}
                            </div>

                            {/* Sector Industrial */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Sector Industrial *
                                </label>
                                <select
                                    value={data.industry_sector}
                                    onChange={(e) => setData('industry_sector', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white"
                                >
                                    {sectors.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dirección */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Dirección del Establecimiento
                                </label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Av. Industrial 1234, Parque Industrial, Palpalá, Jujuy"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                            </div>

                            {/* Contact Person */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Persona de Contacto / Responsable
                                </label>
                                <input
                                    type="text"
                                    value={data.contact_person}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                    placeholder="Ing. Carlos Pérez (Jefe de Planta)"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+54 388 423-4567"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
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
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                            </div>

                            {/* Employee Count */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Cantidad de Empleados
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.employee_count}
                                    onChange={(e) => setData('employee_count', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
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
                                    const selected = data.inspector_ids.includes(insp.id);
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
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{insp.name}</p>
                                                <p className="text-[11px] text-slate-500 font-mono">
                                                    {insp.license_number ? `Mat. ${insp.license_number}` : insp.email}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href="/companies"
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
                                {processing ? 'Guardando...' : 'Registrar Empresa'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
