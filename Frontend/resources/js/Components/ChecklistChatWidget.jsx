import React from 'react';
import ChatPanel from '@/Components/ChatPanel';

/**
 * Asistente del relevamiento de una empresa. Habla con /companies/{id}/checklist/chat, que le pasa
 * la pregunta + el estado completo del checklist al workflow de n8n. n8n decide la respuesta y,
 * opcionalmente, qué ítems completar (SI/NO/N/A + observación); Laravel valida y guarda esos
 * cambios, y acá solo se fusionan los ítems actualizados.
 */
export default function ChecklistChatWidget({ company, onItemsUpdated }) {
    return (
        <ChatPanel
            endpoint={`/companies/${company.id}/checklist/chat`}
            scope={`checklist:${company.id}`}
            title="Asistente del relevamiento"
            subtitle={company.business_name}
            storageKey={`hys-chat-checklist-${company.id}`}
            welcome="¡Hola! Puedo responder dudas sobre la normativa y los ítems del relevamiento, y también ayudarte a completarlo: contame qué querés cargar y lo hago por vos."
            suggestions={[
                '¿Qué ítems me faltan completar?',
                'Resumime los ítems marcados como NO',
                '¿Qué normativa aplica a este relevamiento?',
            ]}
            placeholder="Preguntá algo o pedile que complete un ítem..."
            onItemsUpdated={onItemsUpdated}
        />
    );
}
