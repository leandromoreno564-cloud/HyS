<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evidencia extends Model
{
    use HasFactory;

    protected $table = 'evidencias';

    protected $fillable = [
        'inspeccion_id',
        'observacion_id',
        'item_inspeccion_id',
        'archivo_path',
        'nombre_original',
        'tipo_mime',
        'descripcion',
    ];

    /**
     * Inspección a la que pertenece esta evidencia.
     */
    public function inspeccion(): BelongsTo
    {
        return $this->belongsTo(Inspeccion::class, 'inspeccion_id');
    }

    /**
     * Observación vinculada a esta evidencia (opcional).
     */
    public function observacion(): BelongsTo
    {
        return $this->belongsTo(Observacion::class, 'observacion_id');
    }

    /**
     * Ítem de inspección vinculado a esta evidencia (opcional).
     */
    public function itemInspeccion(): BelongsTo
    {
        return $this->belongsTo(ItemInspeccion::class, 'item_inspeccion_id');
    }
}