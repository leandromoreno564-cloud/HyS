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
        'ruta_archivo',
        'tipo_archivo',
    ];

    public function inspeccion(): BelongsTo
    {
        return $this->belongsTo(Inspection::class, 'inspeccion_id');
    }

    public function observacion(): BelongsTo
    {
        return $this->belongsTo(Observation::class, 'observacion_id');
    }
}
