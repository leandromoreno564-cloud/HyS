import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Building2,
    User,
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    X,
    Filter,
    CalendarDays,
    ArrowRight,
    MapPin,
    FileCheck2,
    Shield,
    RotateCcw
} from 'lucide-react';

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarIndex({
    events = [],
    currentMonth,
    currentYear,
    stats,
    companies = [],
    inspectors = [],
    filters = {}
}) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [eventDetailModal, setEventDetailModal] = useState(null);
    const [filterType, setFilterType] = useState('all'); // 'all' | 'inspection' | 'corrective_measure'
    const [selectedCompanyFilter, setSelectedCompanyFilter] = useState(filters.company_id || '');
    const [selectedInspectorFilter, setSelectedInspectorFilter] = useState(filters.inspector_id || '');

    // Formulario para programar nueva inspección
    const { data, setData, post, processing, reset, errors } = useForm({
        company_id: '',
        user_id: '',
        inspection_date: '',
        start_time: '09:00',
        end_time: '12:00',
        type: 'General',
        general_observations: '',
    });

    // Navegación de mes / año
    const navigateMonth = (direction) => {
        let newMonth = currentMonth + direction;
        let newYear = currentYear;

        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }

        router.get('/calendar', {
            month: newMonth,
            year: newYear,
            company_id: selectedCompanyFilter || undefined,
            inspector_id: selectedInspectorFilter || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const jumpToToday = () => {
        const today = new Date();
        router.get('/calendar', {
            month: today.getMonth() + 1,
            year: today.getFullYear(),
            company_id: selectedCompanyFilter || undefined,
            inspector_id: selectedInspectorFilter || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const applyFilters = (companyId, inspectorId) => {
        setSelectedCompanyFilter(companyId);
        setSelectedInspectorFilter(inspectorId);
        router.get('/calendar', {
            month: currentMonth,
            year: currentYear,
            company_id: companyId || undefined,
            inspector_id: inspectorId || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    // Abre el modal para programar una inspección en una fecha específica
    const openScheduleModal = (dateStr = null) => {
        const defaultDate = dateStr || new Date().toISOString().split('T')[0];
        setData({
            company_id: companies.length > 0 ? companies[0].id : '',
            user_id: inspectors.length > 0 ? inspectors[0].id : '',
            inspection_date: defaultDate,
            start_time: '09:00',
            end_time: '12:00',
            type: 'General',
            general_observations: '',
        });
        setScheduleModalOpen(true);
    };

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        post('/calendar/inspections', {
            onSuccess: () => {
                setScheduleModalOpen(false);
                reset();
            }
        });
    };

    // Actualizar estado de una inspección desde el modal de detalle
    const handleUpdateStatus = (inspectionId, newStatus) => {
        router.patch(`/calendar/inspections/${inspectionId}/status`, { status: newStatus }, {
            onSuccess: () => {
                if (eventDetailModal && eventDetailModal.raw_id === inspectionId) {
                    setEventDetailModal({ ...eventDetailModal, status: newStatus });
                }
            }
        });
    };

    // Eventos filtrados por tipo (inspección / medida)
    const filteredEvents = useMemo(() => {
        return events.filter((ev) => {
            if (filterType === 'all') return true;
            return ev.type === filterType;
        });
    }, [events, filterType]);

    // Mapeo de eventos por fecha (clave YYYY-MM-DD)
    const eventsByDate = useMemo(() => {
        const map = new Map();
        filteredEvents.forEach((ev) => {
            if (!map.has(ev.date)) {
                map.set(ev.date, []);
            }
            map.get(ev.date).push(ev);
        });
        return map;
    }, [filteredEvents]);

    // Cálculo de la grilla de días del mes
    const calendarDays = useMemo(() => {
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        // Día de la semana del 1 del mes (0 = Lunes, ..., 6 = Domingo)
        let firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();

        const grid = [];

        // Días del mes anterior para rellenar la primera semana
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthDays - i;
            const m = currentMonth === 1 ? 12 : currentMonth - 1;
            const y = currentMonth === 1 ? currentYear - 1 : currentYear;
            const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            grid.push({
                day: dayNum,
                dateStr,
                isCurrentMonth: false,
            });
        }

        // Días del mes actual
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            grid.push({
                day: i,
                dateStr,
                isCurrentMonth: true,
            });
        }

        // Días del mes siguiente para completar la cuadrícula (hasta múltiplos de 7, máx 42 celdas)
        const remaining = 42 - grid.length;
        for (let i = 1; i <= remaining; i++) {
            const m = currentMonth === 12 ? 1 : currentMonth + 1;
            const y = currentMonth === 12 ? currentYear + 1 : currentYear;
            const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            grid.push({
                day: i,
                dateStr,
                isCurrentMonth: false,
            });
        }

        return grid;
    }, [currentYear, currentMonth]);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    return (
        <AuthenticatedLayout title="Calendario & Agenda de Inspecciones">
            <Head title="Calendario & Agenda — HyS" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            <CalendarDays className="w-7 h-7 text-blue-600" />
                            Agenda de Inspecciones & Vencimientos
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Cronograma de visitas técnicas, auditorías programadas y plazos legales de medidas correctivas.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={jumpToToday}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors"
                        >
                            Hoy
                        </button>
                        <button
                            type="button"
                            onClick={() => openScheduleModal()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Programar Inspección
                        </button>
                    </div>
                </div>

                {/* KPI / Métricas del mes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inspecciones</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{stats.total_inspections}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Programadas en {MONTH_NAMES[currentMonth - 1]}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completadas</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-emerald-600 mt-2">{stats.completed_inspections}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Visitas finalizadas con éxito</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Medidas en Plazo</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-amber-600 mt-2">{stats.pending_measures}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Con vencimiento en este mes</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Medidas Vencidas</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-rose-600 mt-2">{stats.overdue_measures}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Requieren atención prioritaria</p>
                    </div>
                </div>

                {/* Barra de Filtros y Controles del Calendario */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 flex-wrap">
                        {/* Selector de Mes / Año */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigateMonth(-1)}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
                                title="Mes anterior"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <h2 className="text-lg font-black text-slate-900 min-w-[170px] text-center capitalize">
                                {MONTH_NAMES[currentMonth - 1]} {currentYear}
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateMonth(1)}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
                                title="Mes siguiente"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Filtros de Tipo y Empresa */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Filtro por tipo de evento */}
                            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/80">
                                <button
                                    type="button"
                                    onClick={() => setFilterType('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        filterType === 'all'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Todos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterType('inspection')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        filterType === 'inspection'
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Inspecciones
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterType('corrective_measure')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        filterType === 'corrective_measure'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Vencimientos
                                </button>
                            </div>

                            {/* Filtro por Empresa */}
                            <select
                                value={selectedCompanyFilter}
                                onChange={(e) => applyFilters(e.target.value, selectedInspectorFilter)}
                                className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="">Todas las empresas</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.business_name}
                                    </option>
                                ))}
                            </select>

                            {/* Filtro por Inspector (si es Admin) */}
                            {inspectors.length > 0 && (
                                <select
                                    value={selectedInspectorFilter}
                                    onChange={(e) => applyFilters(selectedCompanyFilter, e.target.value)}
                                    className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="">Todos los inspectores</option>
                                    {inspectors.map((ins) => (
                                        <option key={ins.id} value={ins.id}>
                                            {ins.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Grilla interactiva del Calendario */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[700px]">
                            {/* Cabecera de días de la semana */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {WEEKDAYS.map((wd, idx) => (
                                    <div
                                        key={wd}
                                        className={`text-center py-2 text-xs font-bold uppercase tracking-wider rounded-xl ${
                                            idx >= 5 ? 'text-slate-400 bg-slate-50/50' : 'text-slate-700 bg-slate-50'
                                        }`}
                                    >
                                        {wd}
                                    </div>
                                ))}
                            </div>

                            {/* Celdas del calendario */}
                            <div className="grid grid-cols-7 gap-2">
                                {calendarDays.map((item, idx) => {
                                    const dayEvents = eventsByDate.get(item.dateStr) || [];
                                    const isToday = item.dateStr === todayStr;

                                    return (
                                        <div
                                            key={`${item.dateStr}-${idx}`}
                                            onClick={() => openScheduleModal(item.dateStr)}
                                            className={`min-h-[105px] p-2 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                                                item.isCurrentMonth
                                                    ? 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-xs'
                                                    : 'bg-slate-50/50 border-slate-100 text-slate-400'
                                            } ${isToday ? 'ring-2 ring-blue-600/70 border-blue-600' : ''}`}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span
                                                    className={`text-xs font-bold rounded-lg w-6 h-6 flex items-center justify-center transition-colors ${
                                                        isToday
                                                            ? 'bg-blue-600 text-white shadow-xs'
                                                            : item.isCurrentMonth
                                                            ? 'text-slate-800 group-hover:text-blue-600'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {item.day}
                                                </span>

                                                <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 font-bold transition-opacity">
                                                    + Agendar
                                                </span>
                                            </div>

                                            {/* Chips de Eventos */}
                                            <div className="space-y-1 overflow-hidden flex-1">
                                                {dayEvents.slice(0, 3).map((ev) => {
                                                    const isInsp = ev.type === 'inspection';
                                                    return (
                                                        <div
                                                            key={ev.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEventDetailModal(ev);
                                                            }}
                                                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border truncate cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-1 ${
                                                                isInsp
                                                                    ? ev.status === 'Completada'
                                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                        : ev.status === 'En Progreso'
                                                                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                                                                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                                                    : ev.is_overdue
                                                                    ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                                            }`}
                                                            title={ev.title}
                                                        >
                                                            {isInsp ? (
                                                                <Clock className="w-2.5 h-2.5 shrink-0" />
                                                            ) : (
                                                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                                            )}
                                                            <span className="truncate">
                                                                {isInsp ? `${ev.start_time} ${ev.company_name}` : ev.title}
                                                            </span>
                                                        </div>
                                                    );
                                                })}

                                                {dayEvents.length > 3 && (
                                                    <div className="text-[10px] font-bold text-slate-500 pl-1">
                                                        +{dayEvents.length - 3} más...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal 1: Programar Nueva Inspección */}
            {scheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Programar Inspección Técnica</h3>
                                    <p className="text-xs text-slate-500">Agendar visita de seguridad e higiene</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setScheduleModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                            {/* Empresa */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Empresa a Visitar *</label>
                                <select
                                    value={data.company_id}
                                    onChange={(e) => setData('company_id', e.target.value)}
                                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                                    required
                                >
                                    <option value="" disabled>Seleccioná una empresa...</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.business_name} (CUIT {c.tax_id})
                                        </option>
                                    ))}
                                </select>
                                {errors.company_id && <p className="text-[11px] text-rose-600 mt-1">{errors.company_id}</p>}
                            </div>

                            {/* Inspector asignado (si es admin) */}
                            {inspectors.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Inspector Asignado</label>
                                    <select
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                                    >
                                        <option value="">Yo mismo / Automático</option>
                                        {inspectors.map((ins) => (
                                            <option key={ins.id} value={ins.id}>
                                                {ins.name} ({ins.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Fecha y Tipo */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Visita *</label>
                                    <input
                                        type="date"
                                        value={data.inspection_date}
                                        onChange={(e) => setData('inspection_date', e.target.value)}
                                        className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                                        required
                                    />
                                    {errors.inspection_date && <p className="text-[11px] text-rose-600 mt-1">{errors.inspection_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Inspección *</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                                        required
                                    >
                                        <option value="General">General (Periódica)</option>
                                        <option value="Específica">Específica (Riesgo puntual)</option>
                                        <option value="Seguimiento">Seguimiento de Medidas</option>
                                    </select>
                                </div>
                            </div>

                            {/* Horarios */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Hora Inicio</label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Hora Fin Estimada</label>
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones / Motivo</label>
                                <textarea
                                    value={data.general_observations}
                                    onChange={(e) => setData('general_observations', e.target.value)}
                                    placeholder="Detalles sobre los sectores a recorrer, equipo necesario o antecedentes..."
                                    rows={2}
                                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                                />
                            </div>

                            {/* Botones de acción */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setScheduleModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Agendando...' : 'Confirmar & Agendar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Detalle del Evento (Inspección o Medida Correctiva) */}
            {eventDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                        eventDetailModal.type === 'inspection'
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'bg-amber-50 text-amber-600'
                                    }`}
                                >
                                    {eventDetailModal.type === 'inspection' ? (
                                        <Clock className="w-5 h-5" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {eventDetailModal.type === 'inspection' ? 'Inspección Programada' : 'Plazo de Medida Correctiva'}
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {eventDetailModal.company_name}
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEventDetailModal(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Contenido según tipo de evento */}
                        {eventDetailModal.type === 'inspection' ? (
                            <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Fecha y Horario:</span>
                                        <span className="font-bold text-slate-800">
                                            {eventDetailModal.date} ({eventDetailModal.start_time} - {eventDetailModal.end_time})
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Tipo de Visita:</span>
                                        <span className="font-bold text-slate-800">{eventDetailModal.inspection_type}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Inspector a cargo:</span>
                                        <span className="font-bold text-slate-800">{eventDetailModal.inspector_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Estado Actual:</span>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] mt-0.5 ${
                                                eventDetailModal.status === 'Completada'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : eventDetailModal.status === 'En Progreso'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-slate-200 text-slate-800'
                                            }`}
                                        >
                                            {eventDetailModal.status}
                                        </span>
                                    </div>
                                </div>

                                {eventDetailModal.notes && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
                                            Observaciones:
                                        </span>
                                        <p className="text-slate-700">{eventDetailModal.notes}</p>
                                    </div>
                                )}

                                {/* Selector de cambio rápido de estado */}
                                <div className="flex items-center justify-between gap-3 pt-2">
                                    <span className="text-[11px] font-bold text-slate-500">Cambiar estado:</span>
                                    <div className="flex gap-1.5">
                                        {['Borrador', 'En Progreso', 'Completada'].map((st) => (
                                            <button
                                                key={st}
                                                type="button"
                                                onClick={() => handleUpdateStatus(eventDetailModal.raw_id, st)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                                    eventDetailModal.status === st
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Acceso directo al checklist */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <Link
                                        href={`/companies/${eventDetailModal.company_id}/checklist`}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                                    >
                                        <FileCheck2 className="w-4 h-4" />
                                        Ir al Relevamiento / Checklist
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-xs">
                                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 text-[11px]">Fecha Límite:</span>
                                        <span className={`font-bold ${eventDetailModal.is_overdue ? 'text-rose-600' : 'text-slate-800'}`}>
                                            {eventDetailModal.date} {eventDetailModal.is_overdue ? '(VENCIDA)' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 text-[11px]">Prioridad:</span>
                                        <span
                                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                                eventDetailModal.priority === 'Crítica' || eventDetailModal.priority === 'Alta'
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {eventDetailModal.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 text-[11px]">Estado:</span>
                                        <span className="font-bold text-slate-700">{eventDetailModal.status}</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
                                        Descripción de la Medida:
                                    </span>
                                    <p className="text-slate-800 font-medium">{eventDetailModal.description}</p>
                                </div>

                                {eventDetailModal.recommendations && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
                                            Recomendación Técnica:
                                        </span>
                                        <p className="text-slate-700">{eventDetailModal.recommendations}</p>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <Link
                                        href="/corrective-measures"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Gestionar en Medidas Correctivas
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
