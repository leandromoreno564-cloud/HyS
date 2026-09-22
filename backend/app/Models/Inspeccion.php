<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Inspeccion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inspecciones';

    protected $fillable = [
        'empresa_id',
        'inspector_id',
        'tipo',
        'estado',
        'fecha_inicio',
        'fecha_fin',
        'start_time',
        'end_time',
        'observaciones_generales',
        'porcentaje_avance',
        'token',
        'firma_inspector',
        'firma_empresa',
        'nombre_firmante_empresa',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'porcentaje_avance' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function ($inspeccion) {
            if (empty($inspeccion->token)) {
                $inspeccion->token = Str::uuid()->toString();
            }
        });
    }

    /**
     * Empresa evaluada en esta inspección.
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    /**
     * Inspector/Usuario a cargo de la inspección.
     */
    public function inspector(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'inspector_id');
    }

    /**
     * Ítems de la lista de chequeo evaluados en la inspección.
     */
    public function items(): HasMany
    {
        return $this->hasMany(ItemInspeccion::class, 'inspeccion_id');
    }

    /**
     * Observaciones/hallazgos detectados.
     */
    public function observaciones(): HasMany
    {
        return $this->hasMany(Observacion::class, 'inspeccion_id');
    }

    /**
     * Evidencias fotográficas o documentales asociadas.
     */
    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class, 'inspeccion_id');
    }

    /**
     * Medidas correctivas resultantes.
     */
    public function medidasCorrectivas(): HasMany
    {
        return $this->hasMany(MedidaCorrectiva::class, 'inspeccion_id');
    }

    /**
     * Recalcula el porcentaje de avance según los ítems evaluados.
     */
    public function calcularAvance(): int
    {
        $total = $this->items()->count();
        if ($total === 0) {
            return 0;
        }

        $evaluados = $this->items()->where('estado', '!=', 'Pendiente')->count();
        $porcentaje = (int) round(($evaluados / $total) * 100);
        $this->update(['porcentaje_avance' => $porcentaje]);

        return $porcentaje;
    }

    /**
     * Obtiene métricas de cumplimiento (Cumple, No Cumple, No Aplica, Pendiente).
     */
    public function obtenerEstadisticasCumplimiento(): array
    {
        $total = $this->items()->count();
        $cumple = $this->items()->where('estado', 'Cumple')->count();
        $noCumple = $this->items()->where('estado', 'No Cumple')->count();
        $noAplica = $this->items()->where('estado', 'No Aplica')->count();
        $pendiente = $this->items()->where('estado', 'Pendiente')->count();

        $evaluables = $cumple + $noCumple;
        $tasaCumplimiento = $evaluables > 0 ? round(($cumple / $evaluables) * 100, 1) : 0;

        return [
            'total' => $total,
            'cumple' => $cumple,
            'no_cumple' => $noCumple,
            'no_aplica' => $noAplica,
            'pendiente' => $pendiente,
            'tasa_cumplimiento' => $tasaCumplimiento,
        ];
    }

    /**
     * Scope de consulta según el rol y permisos del usuario.
     */
    public function scopeAccesiblesPor(Builder $query, Usuario $usuario): Builder
    {
        if ($usuario->role === 'admin' || $usuario->rol_id == 1) {
            return $query;
        }

        return $query->where(function (Builder $sub) use ($usuario) {
            $sub->where('inspector_id', $usuario->id)
                ->orWhereHas('empresa', function (Builder $c) use ($usuario) {
                    $c->accesiblesPor($usuario);
                });
        });
    }
}