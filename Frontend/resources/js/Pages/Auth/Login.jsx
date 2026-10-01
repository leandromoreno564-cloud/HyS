import React from 'react';
import { useForm } from '@inertiajs/react';
import { ShieldCheck, Lock, User, ArrowRight, CircleUserRound } from 'lucide-react';
import loginBg from '../../../images/login-bg.jpg';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const fillCredentials = (email, pass) => {
        setData({ ...data, email, password: pass });
    };

    return (
        <div className="min-h-screen flex bg-[#0b1322]">
            {/* Panel izquierdo: foto + branding (solo desktop) */}
            <div
                className="hidden lg:flex lg:w-[58%] relative bg-cover bg-center"
                style={{ backgroundImage: `url(${loginBg})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/10 to-[#0b1322]" />
                <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-br from-slate-900/70 to-transparent" />
            </div>

            {/* Panel derecho: login real */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-6 relative overflow-hidden">
                {/* Acento diagonal amarillo, abajo a la derecha, como en el diseño */}
                <div className="hidden lg:block absolute -bottom-10 -right-10 w-40 h-72 rotate-12 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-slate-800/60" />
                    <div className="absolute left-8 top-0 w-5 h-full bg-amber-400/90" />
                </div>

                {/* Encabezado compacto (solo mobile, reemplaza al panel de foto) */}
                <div className="lg:hidden mb-8 text-center">
                    <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">HyS Control</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Plataforma Integral de Inspecciones de Seguridad e Higiene Laboral
                    </p>
                </div>

                <div className="w-full max-w-sm relative z-10">
                    <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
                        <div className="flex flex-col items-center mb-4">
                            <CircleUserRound className="w-8 h-8 text-white mb-1.5" strokeWidth={1.5} />
                            <h1 className="text-lg font-bold text-white">Iniciar Sesión</h1>
                            <p className="mt-0.5 text-xs text-slate-400 text-center">
                                Accedé al sistema de Higiene y Seguridad
                            </p>
                        </div>

                        <form className="space-y-3" onSubmit={handleSubmit}>
                            {/* Usuario */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Usuario"
                                        required
                                        className="block w-full pl-11 pr-3 py-2.5 text-sm bg-slate-800/50 border border-slate-600/60 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Contraseña */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Contraseña"
                                        required
                                        className="block w-full pl-11 pr-3 py-2.5 text-sm bg-slate-800/50 border border-slate-600/60 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.password}</p>
                                )}
                            </div>

                            {/* Recordar */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center text-xs text-slate-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-slate-500 bg-slate-800 text-amber-400 focus:ring-amber-400 w-3.5 h-3.5"
                                    />
                                    <span className="ml-2">Recordar sesión</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Ingresando...' : 'Ingresar'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        {/* Link a registro */}
                        <div className="mt-3 text-center">
                            <span className="text-xs text-slate-400">
                                ¿Sos Licenciado en Seguridad y no tenés cuenta?{' '}
                                <a href="/register" className="font-semibold text-amber-400 hover:text-amber-300">
                                    Registrate acá
                                </a>
                            </span>
                        </div>

                        {/* Demo credentials helper */}
                        <div className="mt-4 pt-3 border-t border-white/10">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">
                                Acceso Rápido de Prueba (Demo)
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => fillCredentials('admin@hys.com', 'admin123')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-center transition-colors border border-white/10"
                                >
                                    Como Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillCredentials('inspector@hys.com', 'inspector123')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-center transition-colors border border-white/10"
                                >
                                    Como Inspector
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="mt-3 text-center text-[11px] text-slate-500">
                        IES "Nuevo Horizonte" • Tecnicatura en Desarrollo de Software
                    </p>
                </div>
            </div>
        </div>
    );
}
