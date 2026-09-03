<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inspeccion extends Model
{
    use SoftDeletes;

    // Indicamos el nombre exacto de la tabla
    protected $table = 'inspecciones';

    // Permitimos asignación masiva para estos campos
    protected $fillable = [
        'empresa_id', 'inspector_id', 'tipo', 'estado', 
        'fecha_inicio', 'fecha_fin', 'observaciones_generales', 'porcentaje_avance'
    ];

    // Relación con Empresa
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    // Relación con el Usuario (Inspector)
    public function inspector()
    {
        return $this->belongsTo(Usuario::class, 'inspector_id');
    }

    // Relación con los items evaluados
    public function items()
    {
        return $this->hasMany(ItemInspeccion::class, 'inspeccion_id');
    }
}