<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemInspeccion extends Model
{
    use HasFactory;

    protected $table = 'items_inspeccion';

    protected $fillable = [
        'inspeccion_id',
        'item_checklist_id',
        'categoria_nombre',
        'titulo',
        'referencia_normativa',
        'metodo_verificacion',
        'estado',
        'nivel_riesgo',
        'observacion',
        'notas',
        'fotos',
        'es_personalizado',
    ];

    protected $casts = [
        'fotos' => 'array',
        'es_personalizado' => 'boolean',
    ];

    /**
     * Inspección a la que pertenece este ítem evaluado.
     */
    public function inspeccion(): BelongsTo
    {
        return $this->belongsTo(Inspeccion::class, 'inspeccion_id');
    }

    /**
     * Ítem de la lista de chequeo de origen (si no es un ítem personalizado).
     */
    public function itemChecklist(): BelongsTo
    {
        return $this->belongsTo(ItemChecklist::class, 'item_checklist_id');
    }

    /**
     * Observaciones o hallazgos generados a partir de este ítem.
     */
    public function observaciones(): HasMany
    {
        return $this->hasMany(Observacion::class, 'item_inspeccion_id');
    }

    /**
     * Evidencias asociadas directamente a este ítem evaluado.
     */
    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class, 'item_inspeccion_id');
    }
}