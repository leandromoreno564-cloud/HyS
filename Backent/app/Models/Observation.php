<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Observation extends Model
{
    use HasFactory;

    protected $table = 'observacions';

    protected $fillable = [
        'inspeccion_id',
        'inspection_id',
        'item_inspeccion_id',
        'inspection_checklist_item_id',
        'tipo',
        'type',
        'severidad',
        'severity',
        'ubicacion',
        'location',
        'descripcion',
        'description',
        'fotos',
        'photos',
    ];

    protected $casts = [
        'fotos' => 'array',
        'photos' => 'array',
    ];

    public function getInspectionIdAttribute(): int
    {
        return (int) ($this->attributes['inspeccion_id'] ?? $this->attributes['inspection_id'] ?? 0);
    }

    public function setInspectionIdAttribute($value): void
    {
        $this->attributes['inspeccion_id'] = $value;
    }

    public function getInspectionChecklistItemIdAttribute(): ?int
    {
        return $this->attributes['item_inspeccion_id'] ?? $this->attributes['inspection_checklist_item_id'] ?? null;
    }

    public function setInspectionChecklistItemIdAttribute($value): void
    {
        $this->attributes['item_inspeccion_id'] = $value;
    }

    public function getTypeAttribute(): string
    {
        return $this->attributes['tipo'] ?? $this->attributes['type'] ?? 'Hallazgo';
    }

    public function setTypeAttribute($value): void
    {
        $this->attributes['tipo'] = $value;
    }

    public function getSeverityAttribute(): string
    {
        return $this->attributes['severidad'] ?? $this->attributes['severity'] ?? 'Moderado';
    }

    public function setSeverityAttribute($value): void
    {
        $this->attributes['severidad'] = $value;
    }

    public function getLocationAttribute(): ?string
    {
        return $this->attributes['ubicacion'] ?? $this->attributes['location'] ?? null;
    }

    public function setLocationAttribute($value): void
    {
        $this->attributes['ubicacion'] = $value;
    }

    public function getDescriptionAttribute(): string
    {
        return $this->attributes['descripcion'] ?? $this->attributes['description'] ?? '';
    }

    public function setDescriptionAttribute($value): void
    {
        $this->attributes['descripcion'] = $value;
    }

    public function getPhotosAttribute(): array
    {
        $raw = $this->attributes['fotos'] ?? $this->attributes['photos'] ?? [];
        if (is_string($raw)) {
            return json_decode($raw, true) ?: [];
        }
        return is_array($raw) ? $raw : [];
    }

    public function setPhotosAttribute($value): void
    {
        $this->attributes['fotos'] = is_array($value) ? json_encode($value) : $value;
    }

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(Inspection::class, 'inspeccion_id');
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(InspectionChecklistItem::class, 'item_inspeccion_id');
    }

    public function correctiveMeasures(): HasMany
    {
        return $this->hasMany(CorrectiveMeasure::class, 'observacion_id');
    }
}
