<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionChecklistItem extends Model
{
    use HasFactory;

    protected $table = 'items_inspeccion';

    protected $fillable = [
        'inspeccion_id',
        'inspection_id',
        'item_checklist_id',
        'checklist_item_id',
        'categoria_nombre',
        'category_name',
        'titulo',
        'title',
        'referencia_normativa',
        'normative_reference',
        'metodo_verificacion',
        'verification_method',
        'estado',
        'status',
        'nivel_riesgo',
        'risk_level',
        'observacion',
        'notas',
        'notes',
        'fotos',
        'photos',
        'es_personalizado',
        'is_custom',
    ];

    protected $casts = [
        'fotos' => 'array',
        'photos' => 'array',
        'es_personalizado' => 'boolean',
        'is_custom' => 'boolean',
    ];

    public function getInspectionIdAttribute(): int
    {
        return (int) ($this->attributes['inspeccion_id'] ?? $this->attributes['inspection_id'] ?? 0);
    }

    public function setInspectionIdAttribute($value): void
    {
        $this->attributes['inspeccion_id'] = $value;
    }

    public function getChecklistItemIdAttribute(): ?int
    {
        return $this->attributes['item_checklist_id'] ?? $this->attributes['checklist_item_id'] ?? null;
    }

    public function setChecklistItemIdAttribute($value): void
    {
        $this->attributes['item_checklist_id'] = $value;
    }

    public function getCategoryNameAttribute(): string
    {
        return $this->attributes['categoria_nombre'] ?? $this->attributes['category_name'] ?? '';
    }

    public function setCategoryNameAttribute($value): void
    {
        $this->attributes['categoria_nombre'] = $value;
    }

    public function getTitleAttribute(): string
    {
        return $this->attributes['titulo'] ?? $this->attributes['title'] ?? '';
    }

    public function setTitleAttribute($value): void
    {
        $this->attributes['titulo'] = $value;
    }

    public function getNormativeReferenceAttribute(): ?string
    {
        return $this->attributes['referencia_normativa'] ?? $this->attributes['normative_reference'] ?? null;
    }

    public function setNormativeReferenceAttribute($value): void
    {
        $this->attributes['referencia_normativa'] = $value;
    }

    public function getVerificationMethodAttribute(): ?string
    {
        return $this->attributes['metodo_verificacion'] ?? $this->attributes['verification_method'] ?? null;
    }

    public function setVerificationMethodAttribute($value): void
    {
        $this->attributes['metodo_verificacion'] = $value;
    }

    public function getStatusAttribute(): string
    {
        return $this->attributes['estado'] ?? $this->attributes['status'] ?? 'Pendiente';
    }

    public function setStatusAttribute($value): void
    {
        $this->attributes['estado'] = $value;
    }

    public function getRiskLevelAttribute(): string
    {
        return $this->attributes['nivel_riesgo'] ?? $this->attributes['risk_level'] ?? 'Bajo';
    }

    public function setRiskLevelAttribute($value): void
    {
        $this->attributes['nivel_riesgo'] = $value;
    }

    public function getNotesAttribute(): ?string
    {
        return $this->attributes['notas'] ?? $this->attributes['observacion'] ?? $this->attributes['notes'] ?? null;
    }

    public function setNotesAttribute($value): void
    {
        $this->attributes['notas'] = $value;
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

    public function getIsCustomAttribute(): bool
    {
        return (bool) ($this->attributes['es_personalizado'] ?? $this->attributes['is_custom'] ?? false);
    }

    public function setIsCustomAttribute($value): void
    {
        $this->attributes['es_personalizado'] = $value;
    }

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(Inspection::class, 'inspeccion_id');
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(ChecklistItem::class, 'item_checklist_id');
    }
}
