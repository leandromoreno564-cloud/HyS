import React, { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Lock, User, ArrowRight, CircleCheck, Clock3 } from 'lucide-react';
import Toast from '@/Components/Toast';
import loginBg from '../../../images/login-bg-no-shield.png';
import hysCatLogo from '../../../images/hys-cat-logo-white.png';

export default function Login() {
    const { flash } = usePage().props;
    const [registrationToast, setRegistrationToast] = useState(() => Boolean(flash?.registration_completed));
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen flex bg-[#0b1322]">
            {registrationToast && (
                <Toast
                    message="Tu cuenta fue creada. Esperá la aprobación de un administrador para ingresar."
                    type="success"
                    onClose={() => setRegistrationToast(false)}
                />
            )}
            {/* Panel izquierdo: foto + branding (solo desktop) */}
            <div
                className="hidden lg:flex lg:w-[58%] relative bg-cover bg-center"
                style={{ backgroundImage: `url(${loginBg})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/10 to-[#0b1322]" />
                <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-br from-slate-900/70 to-transparent" />
            </div>

            {/* Panel derecho: login real */}
            <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 md:px-6 relative overflow-hidden">
                {/* Acento diagonal amarillo, abajo a la derecha, como en el diseño */}
                <div className="hidden lg:block absolute -bottom-10 -right-10 w-40 h-72 rotate-12 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-slate-800/60" />
                    <div className="absolute left-8 top-0 w-5 h-full bg-amber-400/90" />
                </div>

                <div className="w-full md:max-w-sm relative z-10">
                    <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 md:rounded-3xl p-5 shadow-2xl">
                        <div className="flex flex-col items-center mb-6">
                            <img
                                src={hysCatLogo}
                                alt="Logo H y S"
                                className="w-16 sm:w-20 h-auto drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
                            />
                            <h1 className="-mt-1 text-lg font-bold text-white">Iniciar Sesión</h1>
                            <p className="mt-0.5 text-xs text-slate-400 text-center">
                                Accedé al sistema de Higiene y Seguridad
                            </p>
                        </div>

                        {flash?.registration_completed && (
                            <div className="mb-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-left">
                                <div className="flex gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                                        <CircleCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-emerald-200">¡Tu cuenta fue creada!</h2>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-300">
                                            Recibimos tus datos correctamente. Un administrador debe aprobar tu cuenta antes de que puedas ingresar.
                                        </p>
                                        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-200">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            Cuando se habilite, ingresá con tu correo y contraseña.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="space-y-3" onSubmit={handleSubmit}>
                            {/* Usuario */}
                            <div>
                                <label htmlFor="email" className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-300">
                                    <User className="w-4 h-4 text-amber-400" />
                                    Usuario
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Ingresá tu correo electrónico"
                                    required
                                    className="block w-full px-3 py-2.5 text-sm bg-slate-800/50 border border-slate-600/60 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label htmlFor="password" className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-300">
                                    <Lock className="w-4 h-4 text-amber-400" />
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Ingresá tu contraseña"
                                    required
                                    className="block w-full px-3 py-2.5 text-sm bg-slate-800/50 border border-slate-600/60 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                                />
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
                                <Link href="/register" prefetch="mount" className="font-semibold text-amber-400 hover:text-amber-300">
                                    Registrate acá
                                </Link>
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
