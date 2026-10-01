<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CorrectiveMeasure extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_id',
        'observation_id',
        'description',
        'priority', // Baja, Media, Alta, Crítica
        'recommendations',
        'deadline',
        'responsible_person',
        'estimated_cost',
        'status', // Pendiente, En Progreso, Completada, Vencida, Cancelada
        'verification_date',
        'notes',
    ];

    protected $casts = [
        'deadline' => 'date',
        'verification_date' => 'date',
        'estimated_cost' => 'decimal:2',
    ];

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(Inspection::class);
    }

    public function observation(): BelongsTo
    {
        return $this->belongsTo(Observation::class);
    }

    public function isOverdue(): bool
    {
        if ($this->status === 'Completada' || $this->status === 'Cancelada') {
            return false;
        }

        return $this->deadline && $this->deadline->isPast();
    }
}
