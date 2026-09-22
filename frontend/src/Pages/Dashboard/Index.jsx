import React from 'react';
import { usePage } from '@inertiajs/react';
import AdminDashboard from './Admin';
import InspectorDashboard from './Inspector';

export default function Dashboard(props) {
    const { auth } = usePage().props;
    const user = auth?.user;

    // Verificamos si el usuario tiene rol de Administrador
    const esAdmin = user?.role === 'admin' || user?.rol_id === 1;

    if (esAdmin) {
        return <AdminDashboard {...props} />;
    }

    return <InspectorDashboard {...props} />;
}