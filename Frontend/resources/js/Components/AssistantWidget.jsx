import React from 'react';
import { usePage } from '@inertiajs/react';
import ChatPanel from '@/Components/ChatPanel';

/**
 * Asistente general: aparece en todo el sistema. Habla con /assistant/chat y sabe en qué pantalla estás:
 * si tenés abierta una empresa (ficha o edición), manda su id y el backend le pasa a n8n el detalle
 * (checklist, inspecciones, medidas abiertas). Puede PROPONER crear medidas correctivas o recordatorios,
 * que solo se ejecutan cuando tocás "Confirmar".
 */
export default function AssistantWidget() {
    const page = usePage();
    const user = page.props.auth?.user;
    if (!user) return null;

    const company = page.props.company && page.props.company.id ? page.props.company : null;
    const isAdmin = user.role === 'admin';
    const firstName = user.name ? user.name.split(' ')[0] : '';

    const suggestions = company
        ? [
              'Resumime el estado de esta empresa',
              '¿Qué hallazgos críticos tiene?',
              'Creá una medida correctiva para esta empresa',
              'Recordame revisar esta empresa en 7 días',
          ]
        : isAdmin
        ? [
              '¿Qué medidas correctivas están vencidas?',
              '¿Qué empresas tienen el relevamiento incompleto?',
              'Resumime el estado general',
          ]
        : [
              '¿Qué tengo pendiente esta semana?',
              '¿Qué empresas tengo asignadas?',
              '¿Cómo registro una nueva empresa?',
          ];

    return (
        <ChatPanel
            endpoint="/assistant/chat"
            scope="general"
            stream
            title="Asistente HyS"
            subtitle={company ? company.business_name : isAdmin ? 'Administrador' : 'Inspector'}
            storageKey={`hys-chat-general-${user.id}`}
            welcome={`¡Hola${firstName ? `, ${firstName}` : ''}! Soy el asistente de HyS. Puedo ayudarte a ubicar empresas, ver qué hay pendiente, resolver dudas de higiene y seguridad, y dejarte armadas medidas correctivas o recordatorios (siempre te pido confirmación antes de guardar).`}
            suggestions={suggestions}
            placeholder="Preguntá o pedí algo... (también podés dictar con el micrófono)"
            getExtra={() => ({
                page: {
                    component: page.component,
                    url: page.url,
                    company_id: company ? company.id : null,
                },
            })}
        />
    );
}
