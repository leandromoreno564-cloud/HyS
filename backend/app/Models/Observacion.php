<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Observacion extends Model
{
    use HasFactory;

    protected $table = 'observacions';

    protected $fillable = [
        'inspeccion_id',
        'item_inspeccion_id',
        'tipo',
        'severidad',
        'ubicacion',
        'descripcion',
        'fotos',
    ];

    protected $casts = [
        'fotos' => 'array',
    ];

    /**
     * Inspección en la que se registró esta observación.
     */
    public function inspeccion(): BelongsTo
    {
        return $this->belongsTo(Inspeccion::class, 'inspeccion_id');
    }

    /**
     * Ítem específico de la inspección evaluada.
     */
    public function itemInspeccion(): BelongsTo
    {
        return $this->belongsTo(ItemInspeccion::class, 'item_inspeccion_id');
    }

    /**
     * Evidencias asociadas a este hallazgo/observación.
     */
    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class, 'observacion_id');
    }

    /**
     * Medidas correctivas generadas a partir de esta observación.
     */
    public function medidasCorrectivas(): HasMany
    {
        return $this->hasMany(MedidaCorrectiva::class, 'observacion_id');
    }
}