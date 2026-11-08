import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import defaultAvatar from '../../../images/hys-default-avatar.png';
import { ArrowLeft, Award, Building2, Check, Mail, Phone, Save, Shield, User } from 'lucide-react';

const inputClass = 'mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400';

export default function UsersEdit({ user, companies = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '', email: user.email || '', password: '', role: user.role || 'inspector',
        phone: user.phone || '', license_number: user.license_number || '', is_active: Boolean(user.is_active),
        company_ids: (user.assigned_companies || []).map((company) => company.id),
    });

    const toggleCompany = (companyId) => setData('company_ids', data.company_ids.includes(companyId)
        ? data.company_ids.filter((id) => id !== companyId) : [...data.company_ids, companyId]);

    const toggleAllCompanies = () => {
        const companyIds = companies.map((company) => company.id);
        const allSelected = companyIds.length > 0 && companyIds.every((id) => data.company_ids.includes(id));
        setData('company_ids', allSelected ? [] : companyIds);
    };

    const handleSubmit = (event) => { event.preventDefault(); put(`/users/${user.id}`); };
    const avatarSource = user.avatar ? `/storage/${user.avatar}` : defaultAvatar;
    const allCompaniesSelected = companies.length > 0 && companies.every((company) => data.company_ids.includes(company.id));

    return (
        <AuthenticatedLayout title={`Editar Usuario: ${user.name}`}>
            <div className="w-full -mx-2 sm:mx-auto lg:w-[90%]">
                <div className="mb-5">
                    <Link href="/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Volver a usuarios</Link>
                </div>

                <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-8">
                    <aside className="mb-6 flex flex-col items-center rounded-none border border-slate-200 bg-white p-6 text-center sm:rounded-3xl lg:sticky lg:top-24 lg:mb-0">
                        <div className="h-28 w-28 overflow-hidden rounded-full bg-slate-950 shadow-lg shadow-slate-950/20 ring-4 ring-slate-200 lg:h-36 lg:w-36"><img src={avatarSource} alt={user.name || 'Avatar predeterminado de HyS'} className="h-full w-full object-cover" /></div>
                        <p className="mt-4 text-lg font-bold text-slate-950">{data.name || 'Usuario sin nombre'}</p>
                        <p className="mt-1 text-sm text-slate-500">{data.email || 'Sin correo registrado'}</p>
                        <span className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${data.role === 'admin' ? 'bg-violet-100 text-violet-800' : 'bg-emerald-100 text-emerald-800'}`}><Shield className="h-3.5 w-3.5" />{data.role === 'admin' ? 'Administrador' : 'Inspector'}</span>
                        <div className="mt-6 w-full overflow-hidden rounded-2xl border border-slate-200 text-left">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><span className="text-xs font-semibold text-slate-500">Estado de acceso</span><span className={`text-xs font-bold ${data.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>{data.is_active ? 'Activo' : 'Inactivo'}</span></div>
                            <div className="flex items-center justify-between px-4 py-3"><span className="text-xs font-semibold text-slate-500">Empresas asignadas</span><span className="text-sm font-bold text-slate-900">{data.role === 'inspector' ? data.company_ids.length : '—'}</span></div>
                        </div>
                    </aside>

                    <form onSubmit={handleSubmit} className="rounded-none border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:rounded-3xl sm:p-8">
                        <section>
                            <SectionTitle title="Datos personales" description="Información de identificación y contacto del usuario." />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="Nombre y apellido" icon={User} error={errors.name} required className="sm:col-span-2"><input value={data.name} onChange={(event) => setData('name', event.target.value)} required className={inputClass} /></FormField>
                                <FormField label="Correo electrónico" icon={Mail} error={errors.email} required><input type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} required className={inputClass} /></FormField>
                                <FormField label="Teléfono" icon={Phone} error={errors.phone}><input value={data.phone} onChange={(event) => setData('phone', event.target.value)} placeholder="Ej: 11 1234 5678" className={inputClass} /></FormField>
                            </div>
                        </section>

                        <section className="mt-8 border-t border-slate-100 pt-8">
                            <SectionTitle title="Acceso y perfil profesional" description="Definí el rol, los datos profesionales y la contraseña de acceso." />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="Rol en la plataforma" icon={Shield} error={errors.role}><select value={data.role} onChange={(event) => setData('role', event.target.value)} className={inputClass}><option value="inspector">Inspector / Evaluador en campo</option><option value="admin">Administrador general</option></select></FormField>
                                <FormField label="Matrícula profesional" icon={Award} error={errors.license_number}><input value={data.license_number} onChange={(event) => setData('license_number', event.target.value)} placeholder="Ej: COPIG-9842" className={`${inputClass} font-mono`} /></FormField>
                                <FormField label="Nueva contraseña" icon={Shield} error={errors.password} className="sm:col-span-2"><input type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} placeholder="Dejá este campo vacío para no modificarla" className={inputClass} /></FormField>
                            </div>
                            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                    <span className="block text-xs font-bold text-slate-800">Acceso a la plataforma</span>
                                    <span className="block text-[11px] text-slate-500">{data.is_active ? 'El usuario puede iniciar sesión.' : 'El usuario no puede iniciar sesión.'}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className={`text-xs font-bold ${data.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>{data.is_active ? 'Activo' : 'Inactivo'}</span>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={data.is_active}
                                        onClick={() => setData('is_active', !data.is_active)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${data.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        title={data.is_active ? 'Desactivar acceso' : 'Activar acceso'}
                                    >
                                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${data.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {data.role === 'inspector' && (
                            <section className="mt-8 border-t border-slate-100 pt-8">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Building2 className="h-5 w-5" /></div><div><h2 className="text-base font-bold text-slate-950">Empresas asignadas</h2><p className="mt-1 text-sm text-slate-500">Empresas en las que este inspector puede trabajar y realizar relevamientos.</p></div></div>
                                    {companies.length > 0 && <button type="button" onClick={toggleAllCompanies} className="shrink-0 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100">{allCompaniesSelected ? 'Quitar todas' : 'Todas'}</button>}
                                </div>
                                {companies.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 px-4 py-5 text-center text-xs text-slate-500">No hay empresas activas disponibles para asignar.</p> : (
                                    <div className="grid gap-2 sm:grid-cols-2">{companies.map((company) => {
                                        const selected = data.company_ids.includes(company.id);
                                        return <button key={company.id} type="button" onClick={() => toggleCompany(company.id)} aria-pressed={selected} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selected ? 'border-amber-300 bg-amber-50 text-slate-950' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50/40'}`}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? 'border-amber-500 bg-amber-400 text-slate-950' : 'border-slate-300 bg-white'}`}>{selected && <Check className="h-3.5 w-3.5" />}</span><span className="min-w-0"><span className="block truncate text-xs font-semibold">{company.business_name}</span>{company.tax_id && <span className="mt-0.5 block truncate text-[11px] text-slate-500">CUIT: {company.tax_id}</span>}</span></button>;
                                    })}</div>
                                )}
                                {errors.company_ids && <p className="mt-2 text-xs font-medium text-rose-600">{errors.company_ids}</p>}
                            </section>
                        )}

                        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6"><Link href="/users" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Cancelar</Link><button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4" />{processing ? 'Guardando...' : 'Guardar cambios'}</button></div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function SectionTitle({ title, description }) {
    return <div className="mb-4"><h2 className="text-base font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

function FormField({ label, icon: Icon, error, required = false, className = '', children }) {
    return <div className={className}><label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500"><Icon className="h-3.5 w-3.5" />{label}{required && ' *'}</label>{children}{error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}</div>;
}
