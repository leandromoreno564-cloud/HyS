<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'name',
        'email',
        'password',
        'rol_id',
        'role',
        'telefono',
        'phone',
        'matricula',
        'license_number',
        'avatar',
        'activo',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function getNameAttribute(): string
    {
        return $this->attributes['nombre'] ?? $this->attributes['name'] ?? '';
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['nombre'] = $value;
    }

    public function getRoleAttribute(): string
    {
        if (isset($this->attributes['rol_id'])) {
            return $this->attributes['rol_id'] == 1 ? 'admin' : 'inspector';
        }
        return $this->attributes['role'] ?? 'inspector';
    }

    public function setRoleAttribute($value): void
    {
        $this->attributes['role'] = $value;
        $this->attributes['rol_id'] = ($value === 'admin') ? 1 : 2;
    }

    public function appNotifications(): HasMany
    {
        return $this->notifications();
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->attributes['telefono'] ?? $this->attributes['phone'] ?? null;
    }

    public function setPhoneAttribute($value): void
    {
        $this->attributes['telefono'] = $value;
    }

    public function getLicenseNumberAttribute(): ?string
    {
        return $this->attributes['matricula'] ?? $this->attributes['license_number'] ?? null;
    }

    public function setLicenseNumberAttribute($value): void
    {
        $this->attributes['matricula'] = $value;
    }

    public function getIsActiveAttribute(): bool
    {
        return (bool) ($this->attributes['activo'] ?? $this->attributes['is_active'] ?? true);
    }

    public function setIsActiveAttribute($value): void
    {
        $this->attributes['activo'] = $value;
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    public function createdCompanies(): HasMany
    {
        return $this->hasMany(Company::class, 'creado_por');
    }

    public function assignedCompanies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'empresa_usuario', 'usuario_id', 'empresa_id')
            ->withTimestamps();
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class, 'inspector_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(AppNotification::class, 'user_id')->latest();
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin' || $this->rol_id == 1;
    }

    public function isInspector(): bool
    {
        return $this->role === 'inspector' || $this->rol_id == 2;
    }
}
