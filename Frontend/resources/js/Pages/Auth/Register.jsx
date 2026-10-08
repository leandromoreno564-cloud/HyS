import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import {
    ShieldCheck,
    Lock,
    Mail,
    User,
    Phone,
    BadgeCheck,
    ArrowRight,
    Eye,
    EyeOff,
    IdCard,
    FileDigit,
    Camera,
} from 'lucide-react';
import loginBg from '../../../images/login-bg.jpg';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        dni: '',
        legajo: '',
        phone: '',
        license_number: '',
        password: '',
        password_confirmation: '',
        avatar: null,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register', { forceFormData: true });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0] || null;
        setData('avatar', file);
        setAvatarPreview(file ? URL.createObjectURL(file) : null);
    };

    return (
        <div className="min-h-screen flex bg-[#0b1322]">
            <div
                className="hidden lg:flex lg:w-[58%] relative bg-cover bg-center"
                style={{ backgroundImage: `url(${loginBg})` }}
            >
                <div className="absolute inset-0 bg-linear-to-r from-black/10 via-black/10 to-[#0b1322]" />
                <div className="absolute top-0 left-0 w-24 h-full bg-linear-to-br from-slate-900/70 to-transparent" />
            </div>

            <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-6 relative overflow-hidden">
                <div className="hidden lg:block absolute -bottom-10 -right-10 w-40 h-72 rotate-12 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-slate-800/60" />
                    <div className="absolute left-8 top-0 w-5 h-full bg-amber-400/90" />
                </div>

                <div className="lg:hidden mb-6 text-center">
                    <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-xl relative z-10">
                <div className="bg-slate-900/70 backdrop-blur-xl py-6 px-5 shadow-2xl rounded-3xl sm:px-8 border border-white/10 [&_input]:bg-slate-800/50 [&_input]:border-slate-600/60 [&_input]:text-white [&_input]:placeholder:text-slate-400 [&_input:focus]:ring-amber-400 [&_input:focus]:border-amber-400 [&_input]:shadow-none">
                    <div className="flex flex-col items-center mb-5">
                        <BadgeCheck className="w-8 h-8 text-white mb-1.5" strokeWidth={1.5} />
                        <h1 className="text-lg font-bold text-white">Registro de Licenciado</h1>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Foto de perfil */}
                        <div className="flex justify-center">
                            <label className="cursor-pointer group">
                                <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden group-hover:border-amber-400 transition-colors">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Vista previa" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-slate-400" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                <p className="mt-1.5 text-[11px] text-center text-slate-400 font-semibold">
                                    Foto de perfil
                                </p>
                            </label>
                        </div>
                        {errors.avatar && (
                            <p className="text-xs text-rose-400 font-medium text-center">{errors.avatar}</p>
                        )}

                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    Nombre
                                </label>
                                <div className="mt-1.5 relative rounded-xl shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="Franco"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                                {errors.first_name && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    Apellido
                                </label>
                                <div className="mt-1.5 relative rounded-xl shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="Figueroa"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                                {errors.last_name && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Correo Electrónico
                            </label>
                            <div className="mt-1.5 relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="licenciado@ejemplo.com"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email}</p>}
                        </div>

                        {/* DNI y Legajo */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    DNI
                                </label>
                                <div className="mt-1.5 relative rounded-xl shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <IdCard className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={data.dni}
                                        onChange={(e) => setData('dni', e.target.value.replace(/\D/g, ''))}
                                        placeholder="30123456"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                                {errors.dni && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.dni}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    Legajo
                                </label>
                                <div className="mt-1.5 relative rounded-xl shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <FileDigit className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.legajo}
                                        onChange={(e) => setData('legajo', e.target.value)}
                                        placeholder="LEG-0000"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                                {errors.legajo && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.legajo}</p>}
                            </div>
                        </div>

                        {/* Teléfono y Matrícula */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    Teléfono
                                </label>
                                <div className="mt-1.5 relative rounded-xl shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                                        placeholder="541112345678"
                                        className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                                {errors.phone && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    Matrícula
                                </label>
                                <div className="mt-1.5 relative rounded-xl shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <BadgeCheck className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.license_number}
                                        onChange={(e) => setData('license_number', e.target.value)}
                                        placeholder="LIC-HYS-0000"
                                        className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                                {errors.license_number && (
                                    <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.license_number}</p>
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Contraseña
                            </label>
                            <div className="mt-1.5 relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    className="block w-full pl-10 pr-10 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                                    tabIndex={-1}
                                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-400">
                                Mínimo 8 caracteres.
                            </p>
                            {errors.password && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.password}</p>}
                        </div>

                        {/* Confirmar Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Confirmar Contraseña
                            </label>
                            <div className="mt-1.5 relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="block w-full pl-10 pr-10 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation((v) => !v)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                                    tabIndex={-1}
                                    title={showPasswordConfirmation ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Creando cuenta...' : 'Crear Cuenta'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 pt-4 border-t border-white/10 text-center">
                        <Link href="/login" prefetch="mount" className="text-xs font-semibold text-slate-400 hover:text-amber-300">
                            ¿Ya tenés cuenta? Iniciar sesión
                        </Link>
                    </div>
                </div>
                <p className="mt-3 text-center text-[11px] text-slate-500">IES "Nuevo Horizonte" • Tecnicatura en Desarrollo de Software</p>
            </div>
        </div>
        </div>
    );
}
