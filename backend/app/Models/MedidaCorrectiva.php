<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedidaCorrectiva extends Model
{
    use HasFactory;

    protected $table = 'medida_correctivas';

    protected $fillable = [
        'inspeccion_id',
        'observacion_id',
        'descripcion',
        'prioridad',
        'recomendaciones',
        'fecha_limite',
        'responsable',
        'costo_estimado',
        'estado',
        'fecha_verificacion',
        'notas',
    ];

    protected $casts = [
        'fecha_limite' => 'date',
        'fecha_verificacion' => 'date',
        'costo_estimado' => 'decimal:2',
    ];

    /**
     * Inspección en la que se originó esta medida correctiva.
     */
    public function inspeccion(): BelongsTo
    {
        return $this->belongsTo(Inspeccion::class, 'inspeccion_id');
    }

    /**
     * Observación específica asociada a la medida (si aplica).
     */
    public function observacion(): BelongsTo
    {
        return $this->belongsTo(Observacion::class, 'observacion_id');
    }

    /**
     * Determina si la medida correctiva se encuentra vencida.
     */
    public function estaVencida(): bool
    {
        if (!$this->fecha_limite || in_array($this->estado, ['Completada', 'Cancelada', 'Verificada'])) {
            return false;
        }

        return $this->fecha_limite->isPast();
    }
}