import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Building2,
    User as UserIcon,
    CheckCircle2,
    Circle,
    Pencil,
    Trash2,
    X,
    CalendarDays,
    Loader2,
} from 'lucide-react';
import {
    buildDays,
    shiftMonth,
    monthLabel,
    dayLabel,
    shortDate,
    timeRange,
    groupByDate,
    todayKey,
    defaultSelectedDate,
    parseKey,
} from '@/utils/calendarHelpers';

// Clases completas (Tailwind no detecta nombres armados dinámicamente)
const TYPE_STYLES = {
    revision: { chip: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
    seguimiento: { chip: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
    capacitacion: { chip: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
    reunion: { chip: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
    otro: { chip: 'bg-slate-200 text-slate-700', dot: 'bg-slate-500' },
};
const styleOf = (type) => TYPE_STYLES[type] || TYPE_STYLES.otro;

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MAX_CHIPS = 3;

const emptyForm = (date) => ({
    title: '',
    type: 'revision',
    inspector_id: '',
    company_id: '',
    date,
    start_time: '',
    end_time: '',
    description: '',
});

export default function CalendarIndex({
    month,
    gridStart,
    gridEnd,
    events = [],
    upcoming = [],
    stats = { total: 0, pendientes: 0, completadas: 0 },
    types = {},
    filters = {},
    inspectors = [],
    companies = [],
}) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    const [selected, setSelected] = useState(() => defaultSelectedDate(month));
    const [modal, setModal] = useState(null); // null | { mode: 'create' | 'edit', event? }

    // Si se saltó a otro mes desde "Próximas actividades", se conserva el día pedido
    const pendingSelect = useRef(null);

    useEffect(() => {
        const wanted = pendingSelect.current;
        pendingSelect.current = null;
        setSelected(wanted && wanted.startsWith(month) ? wanted : defaultSelectedDate(month));
    }, [month]);

    const days = useMemo(() => buildDays(gridStart, gridEnd), [gridStart, gridEnd]);
    const byDate = useMemo(() => groupByDate(events), [events]);
    const today = todayKey();
    const selectedEvents = byDate[selected] || [];

    const goTo = (nextMonth, inspectorId = filters.inspector_id) =>
        router.get(
            '/calendar',
            { month: nextMonth, inspector_id: inspectorId || undefined },
            { preserveScroll: true, preserveState: true }
        );

    const setStatus = (event, status) =>
        router.patch(`/calendar/${event.id}/status`, { status }, { preserveScroll: true });

    const removeEvent = (event) => {
        if (!confirm(`¿Eliminar la actividad "${event.title}"? Se le avisa al inspector.`)) return;
        router.delete(`/calendar/${event.id}`, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout title="Calendario de Actividades">
            <div className="space-y-6">
                {/* Encabezado */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => goTo(shiftMonth(month, -1))}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                            title="Mes anterior"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 min-w-[11rem] text-center">{monthLabel(month)}</h2>
                        <button
                            type="button"
                            onClick={() => goTo(shiftMonth(month, 1))}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                            title="Mes siguiente"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => goTo(today.slice(0, 7))}
                            className="ml-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        >
                            Hoy
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {isAdmin && (
                            <>
                                <select
                                    value={filters.inspector_id || ''}
                                    onChange={(e) => goTo(month, e.target.value)}
                                    className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
                                >
                                    <option value="">Todos los inspectores</option>
                                    {inspectors.map((i) => (
                                        <option key={i.id} value={i.id}>
                                            {i.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setModal({ mode: 'create' })}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nueva actividad
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Resumen del mes + leyenda */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
                    <span>
                        <span className="font-bold text-slate-900">{stats.total}</span> en el mes
                    </span>
                    <span>
                        <span className="font-bold text-amber-600">{stats.pendientes}</span> pendientes
                    </span>
                    <span>
                        <span className="font-bold text-emerald-600">{stats.completadas}</span> completadas
                    </span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    {Object.entries(types).map(([key, label]) => (
                        <span key={key} className="inline-flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${styleOf(key).dot}`} />
                            {label}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Grilla del mes */}
                    <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                            {WEEKDAYS.map((d) => (
                                <div key={d} className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    {d}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7">
                            {days.map((key) => {
                                const dayEvents = byDate[key] || [];
                                const inMonth = key.startsWith(month);
                                const isToday = key === today;
                                const isSelected = key === selected;
                                const extra = dayEvents.length - MAX_CHIPS;

                                return (
                                    <button
                                        type="button"
                                        key={key}
                                        onClick={() => setSelected(key)}
                                        className={`min-h-[5.5rem] sm:min-h-[6.5rem] p-1.5 text-left border-b border-r border-slate-100 flex flex-col gap-1 transition-colors ${
                                            isSelected ? 'bg-blue-50' : inMonth ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span
                                            className={`self-start text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                                                isToday ? 'bg-blue-600 text-white' : inMonth ? 'text-slate-800' : 'text-slate-400'
                                            }`}
                                        >
                                            {parseKey(key).getDate()}
                                        </span>

                                        {/* Celular: puntos. Pantallas más grandes: etiquetas con título */}
                                        <span className="flex flex-wrap gap-0.5 sm:hidden">
                                            {dayEvents.slice(0, 6).map((e) => (
                                                <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${styleOf(e.type).dot}`} />
                                            ))}
                                        </span>
                                        <span className="hidden sm:flex flex-col gap-0.5 w-full">
                                            {dayEvents.slice(0, MAX_CHIPS).map((e) => (
                                                <span
                                                    key={e.id}
                                                    className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${styleOf(e.type).chip} ${
                                                        e.status === 'completada' ? 'line-through opacity-70' : ''
                                                    } ${e.status === 'cancelada' ? 'opacity-40 line-through' : ''}`}
                                                >
                                                    {e.start_time ? `${e.start_time} ` : ''}
                                                    {e.title}
                                                </span>
                                            ))}
                                            {extra > 0 && <span className="text-[10px] font-semibold text-slate-500 pl-1">+{extra} más</span>}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Panel lateral */}
                    <div className="space-y-6">
                        {/* Día elegido */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5">
                            <div className="flex items-start justify-between gap-2 mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">{dayLabel(selected)}</h3>
                                    <p className="text-xs text-slate-500">
                                        {selectedEvents.length === 0
                                            ? 'Sin actividades'
                                            : `${selectedEvents.length} actividad${selectedEvents.length === 1 ? '' : 'es'}`}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setModal({ mode: 'create' })}
                                        className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100"
                                        title="Agregar actividad en este día"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {selectedEvents.length === 0 ? (
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" />
                                    {isAdmin ? 'Tocá + para asignar una actividad.' : 'No tenés actividades este día.'}
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {selectedEvents.map((e) => (
                                        <EventCard
                                            key={e.id}
                                            event={e}
                                            types={types}
                                            isAdmin={isAdmin}
                                            onStatus={setStatus}
                                            onEdit={() => setModal({ mode: 'edit', event: e })}
                                            onDelete={() => removeEvent(e)}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Próximas */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5">
                            <h3 className="text-sm font-bold text-slate-900 mb-3">Próximas actividades</h3>
                            {upcoming.length === 0 ? (
                                <p className="text-xs text-slate-400">No hay actividades pendientes por delante.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {upcoming.map((e) => (
                                        <li key={e.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (e.date.startsWith(month)) {
                                                        setSelected(e.date);
                                                    } else {
                                                        pendingSelect.current = e.date;
                                                        goTo(e.date.slice(0, 7));
                                                    }
                                                }}
                                                className="w-full text-left flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50"
                                            >
                                                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${styleOf(e.type).dot}`} />
                                                <span className="min-w-0">
                                                    <span className="block text-xs font-semibold text-slate-800 truncate">{e.title}</span>
                                                    <span className="block text-[11px] text-slate-500 truncate">
                                                        {shortDate(e.date)} · {timeRange(e)}
                                                        {e.company ? ` · ${e.company.business_name}` : ''}
                                                        {isAdmin && e.inspector ? ` · ${e.inspector.name}` : ''}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {modal && (
                <EventModal
                    mode={modal.mode}
                    event={modal.event}
                    date={selected}
                    types={types}
                    inspectors={inspectors}
                    companies={companies}
                    onClose={() => setModal(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

function EventCard({ event: e, types, isAdmin, onStatus, onEdit, onDelete }) {
    const done = e.status === 'completada';
    const cancelled = e.status === 'cancelada';

    return (
        <li className="rounded-2xl border border-slate-200 p-3.5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <span className={`inline-block text-[10px] font-bold rounded-full px-2 py-0.5 ${styleOf(e.type).chip}`}>
                        {types[e.type] || 'Actividad'}
                    </span>
                    <p className={`mt-1.5 text-sm font-semibold text-slate-900 ${done || cancelled ? 'line-through opacity-60' : ''}`}>{e.title}</p>
                </div>
                {isAdmin && e.can_edit && (
                    <div className="flex items-center gap-0.5 shrink-0">
                        <button type="button" onClick={onEdit} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" title="Editar">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={onDelete} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50" title="Eliminar">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-2 space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {timeRange(e)}
                </p>
                {e.company && (
                    <p className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <Link href={`/companies/${e.company.id}`} className="text-blue-700 hover:underline truncate">
                            {e.company.business_name}
                        </Link>
                    </p>
                )}
                {isAdmin && e.inspector && (
                    <p className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        {e.inspector.name}
                    </p>
                )}
                {e.description && <p className="text-slate-500 pt-1 whitespace-pre-line">{e.description}</p>}
            </div>

            {e.can_toggle && !cancelled && (
                <button
                    type="button"
                    onClick={() => onStatus(e, done ? 'pendiente' : 'completada')}
                    className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors ${
                        done ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                >
                    {done ? <Circle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {done ? 'Reabrir' : 'Marcar como completada'}
                </button>
            )}
            {cancelled && (
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Cancelada</span>
                    {isAdmin && (
                        <button type="button" onClick={() => onStatus(e, 'pendiente')} className="text-xs font-semibold text-blue-700 hover:underline">
                            Reactivar
                        </button>
                    )}
                </div>
            )}
            {isAdmin && !done && !cancelled && (
                <button type="button" onClick={() => onStatus(e, 'cancelada')} className="mt-2 block text-[11px] font-medium text-slate-400 hover:text-rose-600">
                    Cancelar actividad
                </button>
            )}
        </li>
    );
}

export function EventModal({ mode, event, date, types, inspectors, companies, onClose }) {
    const editing = mode === 'edit';
    const form = useForm(
        editing
            ? {
                  title: event.title,
                  type: event.type,
                  inspector_id: event.inspector ? String(event.inspector.id) : '',
                  company_id: event.company ? String(event.company.id) : '',
                  date: event.date,
                  start_time: event.start_time || '',
                  end_time: event.end_time || '',
                  description: event.description || '',
              }
            : emptyForm(date)
    );
    const { data, setData, errors, processing } = form;

    // Solo se ofrecen las empresas asignadas al inspector elegido
    const inspector = inspectors.find((i) => String(i.id) === String(data.inspector_id));
    const allowedCompanies = inspector ? companies.filter((c) => inspector.company_ids.includes(c.id)) : [];

    const changeInspector = (value) => {
        const next = inspectors.find((i) => String(i.id) === String(value));
        const keep = next && data.company_id && next.company_ids.includes(Number(data.company_id));
        setData((d) => ({ ...d, inspector_id: value, company_id: keep ? d.company_id : '' }));
    };

    const submit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };
        if (editing) form.put(`/calendar/${event.id}`, options);
        else form.post('/calendar', options);
    };

    const field = 'w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none';
    const label = 'block text-xs font-semibold text-slate-700 mb-1';
    const err = (k) => errors[k] && <p className="text-xs text-rose-600 mt-1">{errors[k]}</p>;

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4" onMouseDown={onClose}>
            <form
                onSubmit={submit}
                onMouseDown={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto"
            >
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <h3 className="text-base font-bold text-slate-900">{editing ? 'Editar actividad' : 'Nueva actividad'}</h3>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Cerrar">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 pb-2 space-y-4">
                    <div>
                        <label className={label}>Inspector</label>
                        <select value={data.inspector_id} onChange={(e) => changeInspector(e.target.value)} className={field}>
                            <option value="">Elegí un inspector</option>
                            {inspectors.map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.name}
                                </option>
                            ))}
                        </select>
                        {err('inspector_id')}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={label}>Tipo</label>
                            <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={field}>
                                {Object.entries(types).map(([key, text]) => (
                                    <option key={key} value={key}>
                                        {text}
                                    </option>
                                ))}
                            </select>
                            {err('type')}
                        </div>
                        <div>
                            <label className={label}>Fecha</label>
                            <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} className={field} />
                            {err('date')}
                        </div>
                    </div>

                    <div>
                        <label className={label}>Título</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Ej: Revisión trimestral de extintores"
                            className={field}
                            maxLength={150}
                        />
                        {err('title')}
                    </div>

                    <div>
                        <label className={label}>
                            Empresa {data.type === 'revision' ? '(obligatoria en una revisión)' : '(opcional)'}
                        </label>
                        <select
                            value={data.company_id}
                            onChange={(e) => setData('company_id', e.target.value)}
                            disabled={!inspector}
                            className={`${field} disabled:bg-slate-50 disabled:text-slate-400`}
                        >
                            <option value="">{inspector ? 'Sin empresa' : 'Elegí primero un inspector'}</option>
                            {allowedCompanies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.business_name}
                                </option>
                            ))}
                        </select>
                        {inspector && allowedCompanies.length === 0 && (
                            <p className="text-xs text-amber-700 mt-1">
                                Este inspector no tiene empresas asignadas. Asignáselas desde la ficha de cada empresa.
                            </p>
                        )}
                        {err('company_id')}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={label}>Hora de inicio (opcional)</label>
                            <input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} className={field} />
                            {err('start_time')}
                        </div>
                        <div>
                            <label className={label}>Hora de fin (opcional)</label>
                            <input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} className={field} />
                            {err('end_time')}
                        </div>
                    </div>

                    <div>
                        <label className={label}>Indicaciones (opcional)</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            placeholder="Qué hay que revisar, a quién consultar, qué llevar..."
                            className={`${field} resize-none`}
                            maxLength={1000}
                        />
                        {err('description')}
                    </div>
                </div>

                <div className="px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100 mt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-60"
                    >
                        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editing ? 'Guardar cambios' : 'Asignar actividad'}
                    </button>
                </div>
            </form>
        </div>
    );
}
