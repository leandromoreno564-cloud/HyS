<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'empresas';

    protected $fillable = [
        'razon_social',
        'business_name',
        'cuit',
        'tax_id',
        'direccion',
        'address',
        'telefono',
        'phone',
        'email_contacto',
        'email',
        'sector',
        'industry_sector',
        'cantidad_empleados',
        'employee_count',
        'sitio_web',
        'website',
        'persona_contacto',
        'contact_person',
        'creado_por',
        'created_by',
        'activa',
        'is_active',
    ];

    protected $casts = [
        'activa' => 'boolean',
        'is_active' => 'boolean',
        'cantidad_empleados' => 'integer',
        'employee_count' => 'integer',
    ];

    // Accessors y Mutators para compatibilidad inglés/español
    public function getBusinessNameAttribute(): string
    {
        return $this->attributes['razon_social'] ?? $this->attributes['business_name'] ?? '';
    }

    public function setBusinessNameAttribute($value): void
    {
        $this->attributes['razon_social'] = $value;
    }

    public function getTaxIdAttribute(): string
    {
        return $this->attributes['cuit'] ?? $this->attributes['tax_id'] ?? '';
    }

    public function setTaxIdAttribute($value): void
    {
        $this->attributes['cuit'] = $value;
    }

    public function getAddressAttribute(): ?string
    {
        return $this->attributes['direccion'] ?? $this->attributes['address'] ?? null;
    }

    public function setAddressAttribute($value): void
    {
        $this->attributes['direccion'] = $value;
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->attributes['telefono'] ?? $this->attributes['phone'] ?? null;
    }

    public function setPhoneAttribute($value): void
    {
        $this->attributes['telefono'] = $value;
    }

    public function getEmailAttribute(): ?string
    {
        return $this->attributes['email_contacto'] ?? $this->attributes['email'] ?? null;
    }

    public function setEmailAttribute($value): void
    {
        $this->attributes['email_contacto'] = $value;
    }

    public function getIndustrySectorAttribute(): ?string
    {
        return $this->attributes['sector'] ?? $this->attributes['industry_sector'] ?? null;
    }

    public function setIndustrySectorAttribute($value): void
    {
        $this->attributes['sector'] = $value;
    }

    public function getEmployeeCountAttribute(): int
    {
        return (int) ($this->attributes['cantidad_empleados'] ?? $this->attributes['employee_count'] ?? 1);
    }

    public function setEmployeeCountAttribute($value): void
    {
        $this->attributes['cantidad_empleados'] = $value;
    }

    public function getWebsiteAttribute(): ?string
    {
        return $this->attributes['sitio_web'] ?? $this->attributes['website'] ?? null;
    }

    public function setWebsiteAttribute($value): void
    {
        $this->attributes['sitio_web'] = $value;
    }

    public function getContactPersonAttribute(): ?string
    {
        return $this->attributes['persona_contacto'] ?? $this->attributes['contact_person'] ?? null;
    }

    public function setContactPersonAttribute($value): void
    {
        $this->attributes['persona_contacto'] = $value;
    }

    public function getCreatedByAttribute(): int
    {
        return (int) ($this->attributes['creado_por'] ?? $this->attributes['created_by'] ?? 1);
    }

    public function setCreatedByAttribute($value): void
    {
        $this->attributes['creado_por'] = $value;
    }

    public function getIsActiveAttribute(): bool
    {
        return (bool) ($this->attributes['activa'] ?? $this->attributes['is_active'] ?? true);
    }

    public function setIsActiveAttribute($value): void
    {
        $this->attributes['activa'] = $value;
    }

    // Relaciones
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function inspectors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'empresa_usuario', 'empresa_id', 'usuario_id')
            ->withTimestamps();
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class, 'empresa_id');
    }

    public function observations(): HasManyThrough
    {
        return $this->hasManyThrough(
            Observation::class,
            Inspection::class,
            'empresa_id',
            'inspeccion_id',
            'id',
            'id'
        );
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('activa', true);
    }

    public function scopeAccessibleBy(Builder $query, User $user): Builder
    {
        if ($user->role === 'admin' || $user->rol_id == 1) {
            return $query;
        }

        return $query->where(function (Builder $sub) use ($user) {
            $sub->where('creado_por', $user->id)
                ->orWhereHas('inspectors', function (Builder $rel) use ($user) {
                    $rel->where('usuarios.id', $user->id);
                });
        });
    }

    public function isAccessibleBy(User $user): bool
    {
        if ($user->role === 'admin' || $user->rol_id == 1 || (method_exists($user, 'isAdmin') && $user->isAdmin())) {
            return true;
        }

        if ($this->creado_por == $user->id) {
            return true;
        }

        return $this->inspectors()->where('usuarios.id', $user->id)->exists();
    }
}
