import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { optimizeImage } from '@/utils/imageOptimizer';
import { Building2, Calendar, Camera, CheckCircle2, ClipboardList, Edit, Globe, Mail, MapPin, MoreVertical, Phone, Plus, Trash2, UserPlus, Users, X } from 'lucide-react';

export default function CompaniesShow({ company, inspectors = [], canManageCompany = false }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';
    const isInspector = auth?.user?.role === 'inspector';
    const checklists = company.checklists || [];
    const hasCoordinates = company.latitude !== null && company.latitude !== undefined && company.latitude !== '' && company.longitude !== null && company.longitude !== undefined && company.longitude !== '';
    const googleMapsUrl = hasCoordinates
        ? `https://www.google.com/maps/search/?api=1&query=${company.latitude},${company.longitude}`
        : company.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}` : null;
    const [requestingAssignment, setRequestingAssignment] = useState(false);
    const [coverProcessing, setCoverProcessing] = useState(false);
    const [coverMenuOpen, setCoverMenuOpen] = useState(false);
    const [editingInspectors, setEditingInspectors] = useState(false);
    const [selectedInspectorIds, setSelectedInspectorIds] = useState(() => (company.inspectors || []).map((inspector) => inspector.id));
    const [savingInspectors, setSavingInspectors] = useState(false);
    const coverInputRef = useRef(null);

    const formatSurveyDate = (date) => {
        if (!date) return 'Sin fecha';
        const value = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? 'Sin fecha' : new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(parsed);
    };

    const requestAssignment = () => {
        setRequestingAssignment(true);
        router.post(`/companies/${company.id}/request-inspector`, {}, { preserveScroll: true, onFinish: () => setRequestingAssignment(false) });
    };

    const updateCover = async (file) => {
        if (!file) return;
        setCoverProcessing(true);
        const optimizedFile = await optimizeImage(file);
        router.post(`/companies/${company.id}/cover`, { cover_photo: optimizedFile }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setCoverProcessing(false),
        });
    };

    const removeCover = () => {
        if (!confirm('¿Querés quitar la portada de esta empresa?')) return;
        setCoverProcessing(true);
        router.post(`/companies/${company.id}/cover`, { remove_cover_photo: true }, {
            preserveScroll: true,
            onFinish: () => setCoverProcessing(false),
        });
    };

    useEffect(() => {
        setSelectedInspectorIds((company.inspectors || []).map((inspector) => inspector.id));
    }, [company.inspectors]);

    const toggleInspector = (inspectorId) => {
        setSelectedInspectorIds((current) => current.includes(inspectorId)
            ? current.filter((id) => id !== inspectorId)
            : [...current, inspectorId]);
    };

    const saveInspectors = () => {
        setSavingInspectors(true);
        router.post(`/companies/${company.id}/assign`, { inspector_ids: selectedInspectorIds }, {
            preserveScroll: true,
            onSuccess: () => setEditingInspectors(false),
            onFinish: () => setSavingInspectors(false),
        });
    };

    return (
        <AuthenticatedLayout title="Empresa" backHref="/companies" backLabel="Volver a empresas">
            <div className="mx-auto -mt-4 max-w-6xl space-y-6 sm:-mt-6 lg:-mt-8">
                <section className="relative -mx-4 sm:mx-0">
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-200 via-sky-100 to-slate-200 sm:h-64">
                        {company.cover_photo_url && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${company.cover_photo_url})` }} />}
                        {company.cover_photo_url && <div className="absolute inset-0 bg-slate-950/10" />}
                    </div>
                    <div className="relative rounded-b-3xl border-x border-b border-slate-200 bg-white px-5 pb-6 pt-6 shadow-sm sm:px-8 sm:pb-7 sm:pt-7">
                        {canManageCompany && (
                            <div className="absolute -top-52 right-2 z-10 sm:-top-64 sm:right-3">
                                <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => updateCover(event.target.files?.[0])} className="hidden" />
                                <button type="button" onClick={() => setCoverMenuOpen((open) => !open)} disabled={coverProcessing} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-white disabled:opacity-60" aria-label="Opciones de portada" aria-expanded={coverMenuOpen}>
                                    <Camera className="h-3.5 w-3.5" />Portada<MoreVertical className="h-3.5 w-3.5" />
                                </button>
                                {coverMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10">
                                        <button type="button" onClick={() => { setCoverMenuOpen(false); coverInputRef.current?.click(); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
                                            <Camera className="h-3.5 w-3.5" />{company.cover_photo_url ? 'Cambiar portada' : 'Agregar portada'}
                                        </button>
                                        {company.cover_photo_url && <button type="button" onClick={() => { setCoverMenuOpen(false); removeCover(); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" />Quitar portada</button>}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="relative flex flex-col items-center text-center">
                            <div className="min-w-0">
                                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{company.business_name}</h1>
                            </div>
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {canManageCompany && <><Link href={`/companies/${company.id}/checklist?new=1`} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"><ClipboardList className="h-4 w-4" />Nuevo relevamiento</Link><Link href={`/companies/${company.id}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-100"><Edit className="h-4 w-4" />Editar</Link></>}
                                {isInspector && !canManageCompany && <button type="button" onClick={requestAssignment} disabled={requestingAssignment} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"><UserPlus className="h-4 w-4" />{requestingAssignment ? 'Enviando...' : 'Solicitar asignación'}</button>}
                                {isAdmin && <button type="button" onClick={() => { if (confirm(`¿Está seguro de enviar a la papelera a ${company.business_name}?`)) router.delete(`/companies/${company.id}`); }} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"><Trash2 className="h-4 w-4" />Eliminar</button>}
                            </div>
                        </div>
                        <div className="mt-7 border-t border-slate-100 pt-6">
                            <CardTitle icon={Building2} title="Datos y contacto" text="Información principal del establecimiento." />
                            <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                                <Info label="Razón social" value={company.business_name} />
                                <Info label="Sector / actividad" value={company.industry_sector} />
                                <Info label="CUIT" value={company.tax_id} mono />
                                <Info label="Responsable" value={company.contact_person || 'No especificado'} />
                                <Info label="Teléfono" value={company.phone || 'Sin teléfono registrado'} icon={Phone} />
                                <Info label="Correo electrónico" value={company.email || 'Sin correo registrado'} icon={Mail} />
                                <Info label="Sitio web" value={company.website || 'Sin sitio web registrado'} icon={Globe} href={company.website} />
                                <Info label="Ubicación" value={company.address || 'Sin dirección especificada'} icon={MapPin} href={googleMapsUrl} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <CardTitle icon={ClipboardList} title="Relevamientos" text="Historial guardado de la empresa." />
                        {checklists.length > 0 ? <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">{checklists.map((checklist, index) => <Link key={checklist.id} href={`/companies/${company.id}/checklist?checklist_id=${checklist.id}`} className={`flex items-center justify-between gap-3 px-3 py-3 transition hover:bg-slate-50 ${index ? 'border-t border-slate-100' : ''}`}><div className="flex min-w-0 items-center gap-2"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Calendar className="h-3.5 w-3.5" /></div><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">{checklist.name}</p><p className="mt-0.5 text-[11px] text-slate-500">{formatSurveyDate(checklist.surveyed_at)}</p></div></div><CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" /></Link>)}</div> : <Empty icon={ClipboardList} text="Todavía no hay relevamientos guardados." />}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3"><CardTitle icon={Users} title="Equipo asignado" text="Inspectores habilitados para trabajar con esta empresa." />{isAdmin && <button type="button" onClick={() => setEditingInspectors((open) => !open)} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"><Plus className="h-3.5 w-3.5" />{editingInspectors ? 'Cerrar' : 'Gestionar inspectores'}</button>}</div>
                    {isAdmin && editingInspectors && <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/50 p-4"><p className="text-xs font-bold text-slate-800">Seleccioná los inspectores con acceso a esta empresa</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{inspectors.map((inspector) => { const selected = selectedInspectorIds.includes(inspector.id); return <button key={inspector.id} type="button" onClick={() => toggleInspector(inspector.id)} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${selected ? 'border-blue-500 bg-white shadow-sm' : 'border-slate-200 bg-white/70 hover:border-blue-300'}`}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'}`}>{selected && '✓'}</span><span className="min-w-0"><span className="block truncate text-xs font-bold text-slate-800">{inspector.name}</span><span className="block truncate text-[11px] text-slate-500">{inspector.license_number ? `Mat. ${inspector.license_number}` : 'Sin matrícula'}</span></span></button>; })}</div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => { setSelectedInspectorIds((company.inspectors || []).map((inspector) => inspector.id)); setEditingInspectors(false); }} disabled={savingInspectors} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white"><X className="h-3.5 w-3.5" />Cancelar</button><button type="button" onClick={saveInspectors} disabled={savingInspectors} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">{savingInspectors ? 'Guardando...' : 'Guardar equipo'}</button></div></div>}
                    {company.inspectors?.length > 0 ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{company.inspectors.map((inspector) => <div key={inspector.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Users className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{inspector.name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{inspector.license_number ? `Mat. ${inspector.license_number}` : 'Sin matrícula registrada'}</p></div></div>)}</div> : <Empty text="No hay inspectores asignados a esta empresa." />}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <CardTitle icon={Camera} title="Fotos del establecimiento" text="Imágenes registradas para esta empresa." />
                    {company.location_photo_url ? <img src={company.location_photo_url} alt={`Establecimiento ${company.business_name}`} className="mt-5 h-56 w-full rounded-2xl object-cover" /> : <Empty icon={Camera} text="Todavía no hay fotos del establecimiento." />}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

function CardTitle({ icon: Icon, title, text }) { return <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon className="h-5 w-5" /></div><div><h2 className="text-base font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-sm text-slate-500">{text}</p></div></div>; }
function Info({ label, value, icon: Icon, href, mono = false }) { return <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p><div className={`mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>{Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}{href ? <a href={href} target="_blank" rel="noreferrer" className="break-all text-blue-700 hover:underline">{value}</a> : <span className="break-words">{value}</span>}</div></div>; }
function Empty({ icon: Icon = Users, text }) { return <div className="mt-5 rounded-2xl border border-dashed border-slate-200 py-8 text-center"><Icon className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-500">{text}</p></div>; }
