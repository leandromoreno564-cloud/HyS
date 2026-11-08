import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowRight, Building2, CalendarDays, ClipboardList, FileText } from 'lucide-react';

function formatDate(date) {
    if (!date) return 'Sin fecha';
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date;
    const parsed = new Date(normalized);

    return Number.isNaN(parsed.getTime())
        ? 'Sin fecha'
        : new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(parsed);
}

export default function ChecklistsIndex({ checklists }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';
    const rows = checklists?.data || [];

    return (
        <AuthenticatedLayout title="Mis Relevamientos">
            <div className="space-y-6">
                <div className="rounded-3xl bg-slate-900 px-6 py-7 text-white shadow-sm sm:px-8">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Mis Relevamientos</h1>
                            <p className="mt-1 text-sm text-slate-300">
                                {isAdmin ? 'Consultá el historial de relevamientos registrados.' : 'Consultá y continuá los relevamientos que registraste.'}
                            </p>
                        </div>
                    </div>
                </div>

                {rows.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-xs">
                        <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
                        <h2 className="mt-3 text-sm font-bold text-slate-700">Todavía no hay relevamientos guardados.</h2>
                        <p className="mt-1 text-xs text-slate-500">Creá un relevamiento desde la ficha de una empresa para verlo acá.</p>
                        <Link href="/companies" className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
                            Ver empresas <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {rows.map((checklist) => (
                                <Link
                                    key={checklist.id}
                                    href={`/companies/${checklist.company.id}/checklist?checklist_id=${checklist.id}`}
                                    className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <ArrowRight className="mt-1 h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                                    </div>
                                    <h2 className="mt-4 truncate text-sm font-bold text-slate-900">{checklist.name}</h2>
                                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-blue-700">
                                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                                        {checklist.company?.business_name || 'Empresa no disponible'}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(checklist.surveyed_at)}</span>
                                        <span className="font-semibold text-slate-600">{checklist.items_count || 0} ítems</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {checklists?.links?.length > 3 && (
                            <nav className="flex flex-wrap justify-center gap-1" aria-label="Paginación de relevamientos">
                                {checklists.links.map((link, index) => (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-white text-slate-600 hover:bg-slate-100' : 'cursor-not-allowed text-slate-300'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        )}
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
