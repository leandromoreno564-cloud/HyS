<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Inspection extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inspecciones';

    protected $fillable = [
        'empresa_id',
        'company_id',
        'inspector_id',
        'user_id',
        'fecha_inicio',
        'inspection_date',
        'tipo',
        'type',
        'estado',
        'status',
        'fecha_fin',
        'start_time',
        'end_time',
        'observaciones_generales',
        'general_observations',
        'porcentaje_avance',
        'progress_percentage',
        'firma_inspector',
        'signature_inspector',
        'firma_empresa',
        'signature_company',
        'nombre_firmante_empresa',
        'signature_company_name',
        'token',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'datetime',
            'porcentaje_avance' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function ($inspection) {
            if (empty($inspection->token)) {
                $inspection->token = Str::uuid()->toString();
            }
        });
    }

    // Accessors y Mutators
    public function getCompanyIdAttribute(): int
    {
        return (int) ($this->attributes['empresa_id'] ?? $this->attributes['company_id'] ?? 0);
    }

    public function setCompanyIdAttribute($value): void
    {
        $this->attributes['empresa_id'] = $value;
    }

    public function getUserIdAttribute(): int
    {
        return (int) ($this->attributes['inspector_id'] ?? $this->attributes['user_id'] ?? 0);
    }

    public function setUserIdAttribute($value): void
    {
        $this->attributes['inspector_id'] = $value;
    }

    public function getInspectionDateAttribute()
    {
        $val = $this->attributes['fecha_inicio'] ?? $this->attributes['inspection_date'] ?? null;
        if ($val && !($val instanceof \Carbon\Carbon)) {
            return \Carbon\Carbon::parse($val);
        }
        return $val;
    }

    public function setInspectionDateAttribute($value): void
    {
        $this->attributes['fecha_inicio'] = $value;
    }

    public function getTypeAttribute(): string
    {
        return $this->attributes['tipo'] ?? $this->attributes['type'] ?? 'General';
    }

    public function setTypeAttribute($value): void
    {
        $this->attributes['tipo'] = $value;
    }

    public function getStatusAttribute(): string
    {
        return $this->attributes['estado'] ?? $this->attributes['status'] ?? 'Borrador';
    }

    public function setStatusAttribute($value): void
    {
        $this->attributes['estado'] = $value;
    }

    public function getGeneralObservationsAttribute(): ?string
    {
        return $this->attributes['observaciones_generales'] ?? $this->attributes['general_observations'] ?? null;
    }

    public function setGeneralObservationsAttribute($value): void
    {
        $this->attributes['observaciones_generales'] = $value;
    }

    public function getProgressPercentageAttribute(): int
    {
        return (int) ($this->attributes['porcentaje_avance'] ?? $this->attributes['progress_percentage'] ?? 0);
    }

    public function setProgressPercentageAttribute($value): void
    {
        $this->attributes['porcentaje_avance'] = $value;
    }

    public function getSignatureInspectorAttribute(): ?string
    {
        return $this->attributes['firma_inspector'] ?? $this->attributes['signature_inspector'] ?? null;
    }

    public function setSignatureInspectorAttribute($value): void
    {
        $this->attributes['firma_inspector'] = $value;
    }

    public function getSignatureCompanyAttribute(): ?string
    {
        return $this->attributes['firma_empresa'] ?? $this->attributes['signature_company'] ?? null;
    }

    public function setSignatureCompanyAttribute($value): void
    {
        $this->attributes['firma_empresa'] = $value;
    }

    public function getSignatureCompanyNameAttribute(): ?string
    {
        return $this->attributes['nombre_firmante_empresa'] ?? $this->attributes['signature_company_name'] ?? null;
    }

    public function setSignatureCompanyNameAttribute($value): void
    {
        $this->attributes['nombre_firmante_empresa'] = $value;
    }

    // Relaciones
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'empresa_id');
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(InspectionChecklistItem::class, 'inspeccion_id');
    }

    public function observations(): HasMany
    {
        return $this->hasMany(Observation::class, 'inspeccion_id');
    }

    public function correctiveMeasures(): HasMany
    {
        return $this->hasMany(CorrectiveMeasure::class, 'inspeccion_id');
    }

    public function calculateProgress(): int
    {
        $total = $this->checklistItems()->count();
        if ($total === 0) {
            return 0;
        }

        $evaluated = $this->checklistItems()->where('estado', '!=', 'Pendiente')->count();
        $percentage = (int) round(($evaluated / $total) * 100);
        $this->update(['porcentaje_avance' => $percentage]);

        return $percentage;
    }

    public function complianceStats(): array
    {
        return $this->getComplianceStats();
    }

    public function getComplianceStats(): array
    {
        $total = $this->checklistItems()->count();
        $cumple = $this->checklistItems()->where('estado', 'Cumple')->count();
        $noCumple = $this->checklistItems()->where('estado', 'No Cumple')->count();
        $noAplica = $this->checklistItems()->where('estado', 'No Aplica')->count();
        $pendiente = $this->checklistItems()->where('estado', 'Pendiente')->count();

        $evaluables = $cumple + $noCumple;
        $complianceRate = $evaluables > 0 ? round(($cumple / $evaluables) * 100, 1) : 0;

        return [
            'total' => $total,
            'cumple' => $cumple,
            'no_cumple' => $noCumple,
            'no_aplica' => $noAplica,
            'pendiente' => $pendiente,
            'compliance_rate' => $complianceRate,
            'rate' => $complianceRate,
        ];
    }

    public function scopeAccessibleBy(Builder $query, User $user): Builder
    {
        if ($user->role === 'admin' || $user->rol_id == 1 || (method_exists($user, 'isAdmin') && $user->isAdmin())) {
            return $query;
        }

        return $query->where(function (Builder $sub) use ($user) {
            $sub->where('inspector_id', $user->id)
                ->orWhereHas('company', function (Builder $c) use ($user) {
                    $c->accessibleBy($user);
                });
        });
    }
}
