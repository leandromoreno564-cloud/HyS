// Funciones de fechas del calendario. Todo trabaja con claves "AAAA-MM-DD" y fechas locales al mediodía,
// para evitar corrimientos de un día por zona horaria.

export const pad = (n) => String(n).padStart(2, '0');

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseKey = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
};

export const todayKey = () => toKey(new Date());

export const buildDays = (startKey, endKey) => {
    const days = [];
    const d = parseKey(startKey);
    const end = parseKey(endKey);
    while (d <= end) {
        days.push(toKey(d));
        d.setDate(d.getDate() + 1);
    }
    return days;
};

export const shiftMonth = (month, delta) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1, 12);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const monthLabel = (month) => {
    const [y, m] = month.split('-').map(Number);
    return capitalize(new Date(y, m - 1, 1, 12).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }));
};

export const dayLabel = (key) =>
    capitalize(parseKey(key).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));

export const shortDate = (key) => parseKey(key).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });

export const timeRange = (e) =>
    e.start_time ? (e.end_time ? `${e.start_time} – ${e.end_time}` : e.start_time) : 'Todo el día';

export const groupByDate = (events) =>
    events.reduce((acc, e) => {
        (acc[e.date] = acc[e.date] || []).push(e);
        return acc;
    }, {});

// Mes por defecto para el día elegido: hoy si está dentro del mes mostrado, si no el día 1
export const defaultSelectedDate = (month) => {
    const today = todayKey();
    return today.startsWith(month) ? today : `${month}-01`;
};
