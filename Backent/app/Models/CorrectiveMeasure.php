<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CorrectiveMeasure extends Model
{
    use HasFactory;

    protected $table = 'medida_correctivas';

    protected $fillable = [
        'inspeccion_id',
        'inspection_id',
        'observacion_id',
        'observation_id',
        'descripcion',
        'description',
        'prioridad',
        'priority',
        'recomendaciones',
        'recommendations',
        'fecha_limite',
        'deadline',
        'responsable',
        'responsible_person',
        'costo_estimado',
        'estimated_cost',
        'estado',
        'status',
        'fecha_verificacion',
        'verification_date',
        'notas',
        'notes',
    ];

    protected $casts = [
        'fecha_limite' => 'date',
        'fecha_verificacion' => 'date',
        'costo_estimado' => 'decimal:2',
    ];

    public function getInspectionIdAttribute(): int
    {
        return (int) ($this->attributes['inspeccion_id'] ?? $this->attributes['inspection_id'] ?? 0);
    }

    public function setInspectionIdAttribute($value): void
    {
        $this->attributes['inspeccion_id'] = $value;
    }

    public function getObservationIdAttribute(): ?int
    {
        return $this->attributes['observacion_id'] ?? $this->attributes['observation_id'] ?? null;
    }

    public function setObservationIdAttribute($value): void
    {
        $this->attributes['observacion_id'] = $value;
    }

    public function getDescriptionAttribute(): string
    {
        return $this->attributes['descripcion'] ?? $this->attributes['description'] ?? '';
    }

    public function setDescriptionAttribute($value): void
    {
        $this->attributes['descripcion'] = $value;
    }

    public function getPriorityAttribute(): string
    {
        return $this->attributes['prioridad'] ?? $this->attributes['priority'] ?? 'Media';
    }

    public function setPriorityAttribute($value): void
    {
        $this->attributes['prioridad'] = $value;
    }

    public function getRecommendationsAttribute(): ?string
    {
        return $this->attributes['recomendaciones'] ?? $this->attributes['recommendations'] ?? null;
    }

    public function setRecommendationsAttribute($value): void
    {
        $this->attributes['recomendaciones'] = $value;
    }

    public function getDeadlineAttribute(): ?Carbon
    {
        $val = $this->attributes['fecha_limite'] ?? $this->attributes['deadline'] ?? null;
        return $val ? Carbon::parse($val) : null;
    }

    public function setDeadlineAttribute($value): void
    {
        $this->attributes['fecha_limite'] = $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    public function getResponsiblePersonAttribute(): ?string
    {
        return $this->attributes['responsable'] ?? $this->attributes['responsible_person'] ?? null;
    }

    public function setResponsiblePersonAttribute($value): void
    {
        $this->attributes['responsable'] = $value;
    }

    public function getEstimatedCostAttribute(): ?float
    {
        $val = $this->attributes['costo_estimado'] ?? $this->attributes['estimated_cost'] ?? null;
        return $val !== null ? (float) $val : null;
    }

    public function setEstimatedCostAttribute($value): void
    {
        $this->attributes['costo_estimado'] = $value;
    }

    public function getStatusAttribute(): string
    {
        return $this->attributes['estado'] ?? $this->attributes['status'] ?? 'Pendiente';
    }

    public function setStatusAttribute($value): void
    {
        $this->attributes['estado'] = $value;
    }

    public function getVerificationDateAttribute(): ?Carbon
    {
        $val = $this->attributes['fecha_verificacion'] ?? $this->attributes['verification_date'] ?? null;
        return $val ? Carbon::parse($val) : null;
    }

    public function setVerificationDateAttribute($value): void
    {
        $this->attributes['fecha_verificacion'] = $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    public function getNotesAttribute(): ?string
    {
        return $this->attributes['notas'] ?? $this->attributes['notes'] ?? null;
    }

    public function setNotesAttribute($value): void
    {
        $this->attributes['notas'] = $value;
    }

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(Inspection::class, 'inspeccion_id');
    }

    public function observation(): BelongsTo
    {
        return $this->belongsTo(Observation::class, 'observacion_id');
    }
}
