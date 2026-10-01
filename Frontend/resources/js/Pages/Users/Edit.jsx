import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import { Users, ArrowLeft, Save } from 'lucide-react';

export default function UsersEdit({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'inspector',
        phone: user.phone || '',
        license_number: user.license_number || '',
        is_active: Boolean(user.is_active),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    return (
        <AuthenticatedLayout title={`Editar Usuario: ${user.name}`}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/users"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a usuarios
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="pb-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Modificar Usuario
                            </h2>
                            <p className="text-xs text-slate-500">
                                Actualice datos personales, contraseña o rol asignado.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Nombre y Apellido *
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                            />
                            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Correo Electrónico *
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Nueva Contraseña (Opcional)
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Dejar en blanco para no cambiar"
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Rol en la Plataforma *
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                                >
                                    <option value="inspector">Inspector / Evaluador en Campo</option>
                                    <option value="admin">Administrador General</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Matrícula Profesional (Inspectores)
                                </label>
                                <input
                                    type="text"
                                    value={data.license_number}
                                    onChange={(e) => setData('license_number', e.target.value)}
                                    className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Teléfono de Contacto
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1.5 block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <label htmlFor="is_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Usuario activo (habilitado para iniciar sesión)
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href="/users"
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
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
