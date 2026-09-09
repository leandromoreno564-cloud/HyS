<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistItem extends Model
{
    use HasFactory;

    protected $table = 'items_checklist';

    protected $fillable = [
        'categoria_id',
        'category_id',
        'titulo',
        'title',
        'referencia_normativa',
        'normative_reference',
        'metodo_verificacion',
        'verification_method',
        'sector_industrial',
        'industry_sector',
        'tipo_inspeccion',
        'inspection_type',
        'nivel_riesgo_defecto',
        'default_risk_level',
        'es_del_sistema',
        'is_system',
    ];

    public function getCategoryIdAttribute(): int
    {
        return (int) ($this->attributes['categoria_id'] ?? $this->attributes['category_id'] ?? 0);
    }

    public function setCategoryIdAttribute($value): void
    {
        $this->attributes['categoria_id'] = $value;
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

    public function getIndustrySectorAttribute(): ?string
    {
        return $this->attributes['sector_industrial'] ?? $this->attributes['industry_sector'] ?? null;
    }

    public function setIndustrySectorAttribute($value): void
    {
        $this->attributes['sector_industrial'] = $value;
    }

    public function getInspectionTypeAttribute(): ?string
    {
        return $this->attributes['tipo_inspeccion'] ?? $this->attributes['inspection_type'] ?? null;
    }

    public function setInspectionTypeAttribute($value): void
    {
        $this->attributes['tipo_inspeccion'] = $value;
    }

    public function getDefaultRiskLevelAttribute(): string
    {
        return $this->attributes['nivel_riesgo_defecto'] ?? $this->attributes['default_risk_level'] ?? 'Medio';
    }

    public function setDefaultRiskLevelAttribute($value): void
    {
        $this->attributes['nivel_riesgo_defecto'] = $value;
    }

    public function getIsSystemAttribute(): bool
    {
        return (bool) ($this->attributes['es_del_sistema'] ?? $this->attributes['is_system'] ?? true);
    }

    public function setIsSystemAttribute($value): void
    {
        $this->attributes['es_del_sistema'] = $value;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ChecklistCategory::class, 'categoria_id');
    }
}
