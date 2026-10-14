<?php

return [


    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'n8n' => [
        // URL del nodo Webhook del workflow de n8n que atiende el chat del checklist.
        'checklist_chat_webhook_url' => env('N8N_CHECKLIST_CHAT_WEBHOOK_URL'),
        // Workflow del asistente general (el botón flotante de todo el sistema). Si no se define, usa el de arriba.
        'assistant_chat_webhook_url' => env('N8N_ASSISTANT_WEBHOOK_URL'),
        // Opcional: si en n8n activaste "Header Auth" en el Webhook, poné acá el mismo valor.
        'checklist_chat_secret' => env('N8N_CHECKLIST_CHAT_SECRET'),
    ],

];
