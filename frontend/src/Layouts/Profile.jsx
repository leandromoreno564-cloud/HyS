import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { User, Phone, Award, Lock, Upload, Save, CheckCircle } from 'lucide-react';

export default function Profile({ usuario }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nombre: usuario?.nombre || usuario?.name || '',
        telefono: usuario?.telefono || usuario?.phone || '',
        matricula: usuario?.matricula || usuario?.numero_matricula || '',
        password: '',
        password_confirmation: '',
        avatar: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/perfil', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Mi Perfil" />

            <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
                        <p className="text-xs text-slate-400 mt-1">Gestión de datos personales y credenciales</p>
                    </div>

                    {recentlySuccessful && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <span>Perfil actualizado exitosamente.</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
                        {/* Avatar actual y cambio */}
                        <div className="flex items-center gap-6 pb-6 border-b border-slate-700/60">
                            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center text-slate-400 text-2xl font-bold shrink-0">
                                {usuario?.avatar ? (
                                    <img src={`/storage/${usuario.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    (usuario?.nombre || usuario?.name || 'U').charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Foto de Perfil
                                </label>
                                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium cursor-pointer transition-colors border border-slate-600/50">
                                    <Upload className="w-4 h-4 text-slate-400" />
                                    <span>Seleccionar imagen</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setData('avatar', e.target.files[0])}
                                    />
                                </label>
                                {errors.avatar && <p className="text-rose-400 text-[11px]">{errors.avatar}</p>}
                            </div>
                        </div>

                        {/* Datos Personales */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Nombre Completo</label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                    />
                                </div>
                                {errors.nombre && <p className="text-rose-400 text-[11px]">{errors.nombre}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Teléfono de Contacto</label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.telefono}
                                        onChange={(e) => setData('telefono', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                {errors.telefono && <p className="text-rose-400 text-[11px]">{errors.telefono}</p>}
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Matrícula Profesional</label>
                                <div className="relative">
                                    <Award className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.matricula}
                                        onChange={(e) => setData('matricula', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                {errors.matricula && <p className="text-rose-400 text-[11px]">{errors.matricula}</p>}
                            </div>
                        </div>

                        {/* Cambio de Contraseña */}
                        <div className="pt-4 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Nueva Contraseña (Opcional)</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                {errors.password && <p className="text-rose-400 text-[11px]">{errors.password}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                <span>{processing ? 'Guardando...' : 'Guardar Cambios'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}