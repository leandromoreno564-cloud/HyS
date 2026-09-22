import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import './index.css'; // Archivo de estilos de Tailwind (créalo en src/index.css si no existe)

createInertiaApp({
    title: (title) => (title ? `${title} - HyS Control` : 'HyS Control'),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];
        
        if (!page) {
            throw new Error(`Página no encontrada: ./Pages/${name}.jsx`);
        }
        
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#2563eb',
        showSpinner: true,
    },
});