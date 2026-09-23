import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import { Link, router } from '@inertiajs/react';
import { 
    Users, 
    Plus, 
    Search, 
    Shield, 
    Award, 
    Phone, 
    Edit, 
    Power,
    CheckCircle,
    XCircle
} from 'lucide-react';

export default function UsersIndex({ users }) {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/users', {
            search: search || undefined,
            role: role || undefined,
        }, { preserveState: true });
    };

    const handleToggleStatus = (userId) => {
        router.post(`/users/${userId}/toggle-status`, {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout title="Gestión de Usuarios y Técnicos">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Cuerpo Técnico y Administradores
                        </h2>
                        <p className="text-xs text-slate-500">
                            Administración de inspectores de higiene y seguridad, matrículas profesionales y roles
                        </p>
                    </div>
                    <Link
                        href="/users/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Registrar Usuario
                    </Link>
                </div>

                {/* Filter Bar */}
                <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, email o matrícula..."
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>

                    <div className="w-full sm:w-48">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white text-slate-700"
                        >
                            <option value="">Todos los roles</option>
                            <option value="admin">Administrador</option>
                            <option value="inspector">Inspector</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap w-full sm:w-auto"
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
                                    <th className="py-3.5 px-4">Usuario</th>
                                    <th className="py-3.5 px-4">Rol en Sistema</th>
                                    <th className="py-3.5 px-4">Matrícula Profesional</th>
                                    <th className="py-3.5 px-4 text-center">Empresas Asignadas</th>
                                    <th className="py-3.5 px-4 text-center">Inspecciones</th>
                                    <th className="py-3.5 px-4">Estado</th>
                                    <th className="py-3.5 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users?.data?.length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-900 text-sm block">
                                                            {user.name}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 block">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                                    user.role === 'admin'
                                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                    {user.role === 'admin' ? 'Administrador' : 'Inspector'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-600">
                                                {user.license_number ? (
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                                                        {user.license_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">N/A</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                                {user.assigned_companies_count || 0}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                                {user.inspections_count || 0}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge>{user.is_active ? 'Activo' : 'Inactivo'}</Badge>
                                            </td>
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(user.id)}
                                                        className={`p-1.5 rounded-lg transition-colors ${
                                                            user.is_active 
                                                                ? 'text-emerald-600 hover:bg-emerald-50' 
                                                                : 'text-slate-400 hover:bg-slate-100'
                                                        }`}
                                                        title={user.is_active ? 'Desactivar acceso' : 'Habilitar acceso'}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/users/${user.id}/edit`}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar Usuario"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users?.links?.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                Mostrando {users.from || 0} a {users.to || 0} de {users.total || 0} usuarios
                            </span>
                            <div className="flex gap-1">
                                {users.links.map((link, idx) => (
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
