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

class Empresa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'empresas';

    protected $fillable = [
        'creado_por',
        'razon_social',
        'cuit',
        'direccion',
        'telefono',
        'email_contacto',
        'sector',
        'cantidad_empleados',
        'sitio_web',
        'persona_contacto',
        'activa',
    ];

    protected $casts = [
        'activa' => 'boolean',
        'cantidad_empleados' => 'integer',
    ];

    /**
     * Usuario creador de la empresa.
     */
    public function creador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'creado_por');
    }

    /**
     * Usuarios/inspectores asignados a esta empresa.
     */
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'empresa_usuario', 'empresa_id', 'usuario_id')
                    ->withTimestamps();
    }

    /**
     * Inspecciones asociadas a la empresa.
     */
    public function inspecciones(): HasMany
    {
        return $this->hasMany(Inspeccion::class, 'empresa_id');
    }

    /**
     * Observaciones registradas a través de las inspecciones de la empresa.
     */
    public function observaciones(): HasManyThrough
    {
        return $this->hasManyThrough(
            Observacion::class,
            Inspeccion::class,
            'empresa_id',
            'inspeccion_id',
            'id',
            'id'
        );
    }

    /**
     * Scope para filtrar empresas activas.
     */
    public function scopeActivas(Builder $query): Builder
    {
        return $query->where('activa', true);
    }

    /**
     * Scope para consultar empresas accesibles por un usuario según su rol.
     */
    public function scopeAccesiblesPor(Builder $query, Usuario $usuario): Builder
    {
        if ($usuario->role === 'admin' || $usuario->rol_id == 1) {
            return $query;
        }

        return $query->where(function (Builder $sub) use ($usuario) {
            $sub->where('creado_por', $usuario->id)
                ->orWhereHas('usuarios', function (Builder $rel) use ($usuario) {
                    $rel->where('usuarios.id', $usuario->id);
                });
        });
    }

    /**
     * Verifica si la empresa es accesible por el usuario especificado.
     */
    public function esAccesiblePor(Usuario $usuario): bool
    {
        if ($usuario->role === 'admin' || $usuario->rol_id == 1) {
            return true;
        }

        if ($this->creado_por == $usuario->id) {
            return true;
        }

        return $this->usuarios()->where('usuarios.id', $usuario->id)->exists();
    }
}