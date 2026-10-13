<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Elemento editable de la portada: tarjeta de recurso, paso, foto, video o dato destacado.
 * image / video guardan una ruta del disco "public" o una URL externa.
 */
class PortalItem extends Model
{
    public const SECTIONS = ['stats', 'acerca', 'recursos', 'pasos', 'riesgos', 'normativa', 'galeria', 'practicas', 'emergencia', 'videos', 'faq'];

    /** Íconos disponibles (se dibujan con la librería de íconos del frontend, no con emojis). */
    public const ICONS = [
        'shield', 'hardhat', 'alert', 'graduation', 'search', 'brain', 'megaphone', 'flame',
        'heart', 'file', 'users', 'clipboard', 'scale', 'phone', 'eye', 'wrench', 'check', 'sparkles',
        'zap', 'flask', 'bug', 'volume', 'cog', 'activity', 'flag',
    ];

    protected $fillable = [
        'section',
        'title',
        'text',
        'icon',
        'image',
        'video',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
