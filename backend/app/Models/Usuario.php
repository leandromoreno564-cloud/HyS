<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $table = 'usuarios';

    protected $fillable = [
        'rol_id',
        'role',
        'nombre',
        'email',
        'password',
        'telefono',
        'matricula',
        'avatar',
        'activo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'activo' => 'boolean',
    ];

    /**
     * Rol asignado al usuario.
     */
    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    /**
     * Empresas creadas por este usuario.
     */
    public function empresasCreadas(): HasMany
    {
        return $this->hasMany(Empresa::class, 'creado_por');
    }

    /**
     * Empresas asignadas al usuario para inspeccionar.
     */
    public function empresas(): BelongsToMany
    {
        return $this->belongsToMany(Empresa::class, 'empresa_usuario', 'usuario_id', 'empresa_id')
                    ->withTimestamps();
    }

    /**
     * Inspecciones realizadas por el usuario.
     */
    public function inspecciones(): HasMany
    {
        return $this->hasMany(Inspeccion::class, 'inspector_id');
    }

    /**
     * Notificaciones recibidas por el usuario.
     */
    public function notificaciones(): HasMany
    {
        return $this->hasMany(AppNotification::class, 'user_id')->latest();
    }

    /**
     * Verifica si el usuario posee rol Administrador.
     */
    public function esAdmin(): bool
    {
        return $this->role === 'admin' || $this->rol_id == 1;
    }

    /**
     * Verifica si el usuario posee rol Inspector.
     */
    public function esInspector(): bool
    {
        return $this->role === 'inspector' || $this->rol_id == 2;
    }
}