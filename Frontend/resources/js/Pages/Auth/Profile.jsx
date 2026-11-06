import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import { Award, Camera, Check, Eye, EyeOff, IdCard, Lock, Mail, Pencil, Phone, Save, User, X } from 'lucide-react';

export default function Profile({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: user.first_name || user.name?.split(' ')[0] || '',
        last_name: user.last_name || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        dni: user.dni || '',
        phone: user.phone || '',
        license_number: user.license_number || '',
        password: '',
        password_confirmation: '',
        avatar: null,
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [originalValue, setOriginalValue] = useState('');

    useEffect(() => {
        if (editingField) {
            requestAnimationFrame(() => document.getElementById(editingField)?.focus());
        }
    }, [editingField]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/profile', { forceFormData: true, preserveState: true, preserveScroll: true, only: ['auth', 'flash', 'user'] });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0] || null;
        setData('avatar', file);
        setAvatarPreview(file ? URL.createObjectURL(file) : null);
    };

    const saveAvatar = () => {
        if (!data.avatar) return;

        post('/profile/avatar', {
            forceFormData: true,
            preserveState: true,
            preserveScroll: true,
            only: ['auth', 'flash', 'user'],
            onSuccess: () => {
                setAvatarPreview(null);
                setData('avatar', null);
            },
        });
    };

    const startEditing = (field) => {
        setOriginalValue(data[field]);
        setEditingField(field);
    };

    const cancelEditing = () => {
        if (editingField) setData(editingField, originalValue);
        setEditingField(null);
    };

    const saveField = () => {
        post('/profile', { forceFormData: true, preserveState: true, preserveScroll: true, only: ['auth', 'flash', 'user'], onSuccess: () => setEditingField(null) });
    };

    const avatarSource = avatarPreview || (user.avatar ? `/storage/${user.avatar}` : null);

    return (
        <AuthenticatedLayout title="Mi Perfil">
            <div className="w-full -mx-2 sm:mx-auto lg:w-[90%]">
                <div className="lg:grid lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:gap-8">
                    <aside className="mb-6 flex flex-col items-center rounded-none border border-slate-200 bg-white p-6 text-center sm:rounded-3xl lg:sticky lg:top-24 lg:mb-0 lg:items-center lg:text-center">
                        <label className="group cursor-pointer">
                            <div className="w-28 h-28 rounded-full bg-amber-400 text-slate-950 font-extrabold text-6xl flex items-center justify-center overflow-hidden shadow-lg shadow-amber-400/20 ring-4 ring-amber-100 transition group-hover:ring-amber-300 lg:w-36 lg:h-36 lg:text-7xl">
                                {avatarSource ? <img src={avatarSource} alt={user.name} className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
                            </div>
                            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="hidden" />
                            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 transition group-hover:text-amber-500"><Camera className="w-3.5 h-3.5" />Cambiar foto</span>
                        </label>
                        {avatarPreview && <button type="button" onClick={saveAvatar} disabled={processing} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"><Save className="w-4 h-4" />{processing ? 'Guardando foto...' : 'Guardar foto'}</button>}
                        {errors.avatar && <p className="mt-2 text-xs font-medium text-rose-600">{errors.avatar}</p>}
                        <p className="mt-4 text-lg font-bold text-slate-950">{data.first_name} {data.last_name}</p>
                        <button type="button" onClick={() => startEditing('first_name')} className="mt-3 inline-flex w-full max-w-52 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"><Pencil className="w-4 h-4" />Editar perfil</button>
                    </aside>

                    <form onSubmit={handleSubmit} className="rounded-none border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:rounded-3xl sm:p-10">
                    <section>
                        <div className="mb-4"><h3 className="text-base font-bold text-slate-950">Datos personales</h3><p className="mt-1 text-sm text-slate-500">Tu información de identificación y contacto.</p></div>
                        <div className="overflow-hidden rounded-none border border-slate-200 sm:rounded-2xl">
                            <ProfileRow label="Nombre" icon={User} id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} error={errors.first_name} required isEditing={editingField === 'first_name'} onEdit={() => startEditing('first_name')} onSave={saveField} onCancel={cancelEditing} saving={processing} />
                            <ProfileRow label="Apellido" icon={User} id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} error={errors.last_name} required isEditing={editingField === 'last_name'} onEdit={() => startEditing('last_name')} onSave={saveField} onCancel={cancelEditing} saving={processing} />
                            <ProfileRow label="DNI" icon={IdCard} id="dni" inputMode="numeric" pattern="[0-9]*" value={data.dni} onChange={(e) => setData('dni', e.target.value.replace(/\D/g, ''))} error={errors.dni} required isEditing={editingField === 'dni'} onEdit={() => startEditing('dni')} onSave={saveField} onCancel={cancelEditing} saving={processing} />
                            <ProfileRow label="Teléfono" icon={Phone} id="phone" inputMode="numeric" pattern="[0-9]*" value={data.phone} onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))} placeholder="541112345678" error={errors.phone} isEditing={editingField === 'phone'} onEdit={() => startEditing('phone')} onSave={saveField} onCancel={cancelEditing} saving={processing} />
                            {user.role === 'inspector' && <ProfileRow label="Matrícula profesional" icon={Award} id="license_number" value={data.license_number} onChange={(e) => setData('license_number', e.target.value)} placeholder="Ej: COPIG-9842" error={errors.license_number} isEditing={editingField === 'license_number'} onEdit={() => startEditing('license_number')} onSave={saveField} onCancel={cancelEditing} saving={processing} />}
                        </div>
                    </section>

                    <section className="mt-8">
                        <div className="mb-4"><h3 className="text-base font-bold text-slate-950">Datos de la cuenta</h3><p className="mt-1 text-sm text-slate-500">Correo de acceso y contraseña. Dejá las contraseñas vacías si no querés modificarlas.</p></div>
                        <div className="overflow-hidden rounded-none border border-slate-200 sm:rounded-2xl">
                            <ProfileRow label="Correo electrónico" icon={Mail} id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} required isEditing={editingField === 'email'} onEdit={() => startEditing('email')} onSave={saveField} onCancel={cancelEditing} saving={processing} />
                            <PasswordRow label="Nueva contraseña" id="password" value={data.password} onChange={(e) => setData('password', e.target.value)} visible={showPassword} toggle={() => setShowPassword((value) => !value)} error={errors.password} isEditing={editingField === 'password'} onEdit={() => startEditing('password')} onSave={saveField} onCancel={cancelEditing} saving={processing} />
                            <PasswordRow label="Confirmar contraseña" id="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} visible={showPasswordConfirmation} toggle={() => setShowPasswordConfirmation((value) => !value)} isEditing={editingField === 'password_confirmation'} onEdit={() => startEditing('password_confirmation')} onSave={saveField} onCancel={cancelEditing} saving={processing} />
                        </div>
                    </section>

                    <div className="mt-8 flex justify-end"><button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50"><Save className="w-4 h-4" />{processing ? 'Guardando...' : 'Guardar cambios'}</button></div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ProfileRow({ label, icon: Icon, id, error, isEditing, onEdit, onSave, onCancel, saving, ...inputProps }) {
    const iconClass = `-translate-y-px w-5 h-5 ${Icon === User ? 'translate-x-0.5' : ''}`;

    return <div onClick={() => !isEditing && onEdit()} className="group cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-amber-50/30"><div className="flex gap-3 px-4 py-4 sm:px-5"><div className="self-center flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-amber-100 group-hover:text-amber-700"><Icon className={iconClass} /></div><div className="min-w-0 flex-1"><label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label><div className="flex items-center gap-2"><input id={id} readOnly={!isEditing} className={`mt-1 min-w-0 flex-1 text-base font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 transition ${isEditing ? 'rounded-lg bg-white px-2 py-1 ring-2 ring-amber-400 focus:ring-2 focus:ring-amber-400' : 'bg-transparent cursor-default'}`} {...inputProps} />{isEditing ? <><button type="button" onClick={onSave} disabled={saving} className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50" aria-label={`Guardar ${label}`}><Check className="w-4 h-4" /></button><button type="button" onClick={onCancel} disabled={saving} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100" aria-label={`Cancelar edición de ${label}`}><X className="w-4 h-4" /></button></> : <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(); }} className="rounded-lg p-2 text-amber-600 opacity-0 transition hover:bg-amber-100 hover:text-amber-700 group-hover:opacity-100 focus:opacity-100" aria-label={`Editar ${label}`}><Pencil className="w-4 h-4" /></button>}</div>{error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}</div></div></div>;
}

function PasswordRow({ label, id, visible, toggle, error, isEditing, onEdit, onSave, onCancel, saving, ...inputProps }) {
    return <div onClick={() => !isEditing && onEdit()} className="group cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-amber-50/30"><div className="flex gap-3 px-4 py-4 sm:px-5"><div className="self-center flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-amber-100 group-hover:text-amber-700"><Lock className="-translate-y-px w-5 h-5" /></div><div className="min-w-0 flex-1"><label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label><div className="flex items-center gap-2"><input id={id} type={visible ? 'text' : 'password'} readOnly={!isEditing} className={`mt-1 min-w-0 flex-1 text-base font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 transition ${isEditing ? 'rounded-lg bg-white px-2 py-1 ring-2 ring-amber-400 focus:ring-2 focus:ring-amber-400' : 'bg-transparent cursor-default'}`} placeholder="Mínimo 8 caracteres" {...inputProps} />{isEditing ? <>{<button type="button" onClick={toggle} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}>{visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}<button type="button" onClick={onSave} disabled={saving} className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50" aria-label={`Guardar ${label}`}><Check className="w-4 h-4" /></button><button type="button" onClick={onCancel} disabled={saving} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100" aria-label={`Cancelar edición de ${label}`}><X className="w-4 h-4" /></button></> : <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(); }} className="rounded-lg p-2 text-amber-600 opacity-0 transition hover:bg-amber-100 hover:text-amber-700 group-hover:opacity-100 focus:opacity-100" aria-label={`Editar ${label}`}><Pencil className="w-4 h-4" /></button>}</div>{error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}</div></div></div>;
}
