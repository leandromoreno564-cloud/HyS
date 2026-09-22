import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    Plus, 
    Search, 
    RotateCcw,
    ExternalLink,
    Phone,
    MapPin
} from 'lucide-react';

export default function CompaniesIndex({ companies, sectors = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin' || user?.rol_id === 1;

    const [search, setSearch] = useState('');
    const [sector, setSector] = useState('');
    const [trashed, setTrashed] = useState(false);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/empresas', {
            search: search || undefined,
            sector: sector || undefined,
            trashed: trashed ? 1 : undefined,
        }, { preserveState: true });
    };

    const handleRestore = (companyId) => {
        if (confirm('¿Desea restaurar esta empresa?')) {
            router.post(`/empresas/${companyId}/restaurar`);
        }
    };

    return (
        <AuthenticatedLayout title="Gestión de Empresas">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Empresas y Establecimientos
                        </h2>
                        <p className="text-xs text-slate-500">
                            Registro de entidades beneficiarias y asignación de inspectores
                        </p>
                    </div>
                    <Link
                        href="/empresas/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Empresa
                    </Link>
                </div>

                {/* Filter & Search Bar */}
                <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por razón social, CUIT, contacto o dirección..."
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                        />
                    </div>

                    <div className="w-full md:w-56">
                        <select
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden text-slate-700 bg-white"
                        >
                            <option value="">Todos los sectores</option>
                            {sectors.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {isAdmin && (
                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer whitespace-nowrap">
                            <input
                                type="checkbox"
                                checked={trashed}
                                onChange={(e) => setTrashed(e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span>Ver papelera</span>
                        </label>
                    )}

                    <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap w-full md:w-auto cursor-pointer"
                    >
                        Filtrar
                    </button>
                </form>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Razón Social / CUIT</th>
                                    <th className="py-3.5 px-4">Sector Industrial</th>
                                    <th className="py-3.5 px-4">Contacto & Ubicación</th>
                                    <th className="py-3.5 px-4">Inspectores Asignados</th>
                                    <th className="py-3.5 px-4 text-center">Inspecciones</th>
                                    <th className="py-3.5 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {companies?.data?.length > 0 ? (
                                    companies.data.map((company) => {
                                        const razonSocial = company.razon_social || company.business_name;
                                        const cuit = company.cuit || company.tax_id;
                                        const rubro = company.rubro || company.sector_industrial || company.industry_sector;
                                        const contacto = company.contacto_nombre || company.contact_person;
                                        const direccion = company.direccion || company.address;
                                        const telefono = company.telefono || company.phone;
                                        const inspectores = company.inspectores || company.inspectors || [];
                                        const cantidadInspecciones = company.inspecciones_count ?? company.inspections_count ?? 0;
                                        const estaEliminado = Boolean(company.deleted_at || company.eliminado_el);

                                        return (
                                            <tr key={company.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <Link 
                                                        href={`/empresas/${company.id}`}
                                                        className="font-bold text-slate-900 hover:text-blue-600 text-sm block"
                                                    >
                                                        {razonSocial}
                                                    </Link>
                                                    <span className="font-mono text-slate-400 text-[11px]">
                                                        CUIT: {cuit || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 font-medium">
                                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                                                        {rubro || 'General'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500">
                                                    {contacto && (
                                                        <p className="font-medium text-slate-700">{contacto}</p>
                                                    )}
                                                    {direccion && (
                                                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {direccion}
                                                        </p>
                                                    )}
                                                    {telefono && (
                                                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {telefono}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {inspectores.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {inspectores.map((insp) => (
                                                                <span key={insp.id} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md font-medium">
                                                                    {insp.nombre || insp.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            Sin inspectores
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                                        {cantidadInspecciones}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {estaEliminado ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRestore(company.id)}
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                                                title="Restaurar de papelera"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <Link
                                                                    href={`/inspecciones/create?empresa_id=${company.id}`}
                                                                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                                                                >
                                                                    Inspeccionar
                                                                </Link>
                                                                <Link
                                                                    href={`/empresas/${company.id}`}
                                                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                                                    title="Ver Ficha"
                                                                >
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </Link>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                                            No se encontraron empresas con los filtros aplicados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {companies?.links?.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                Mostrando {companies.from || 0} a {companies.to || 0} de {companies.total || 0} empresas
                            </span>
                            <div className="flex gap-1">
                                {companies.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}