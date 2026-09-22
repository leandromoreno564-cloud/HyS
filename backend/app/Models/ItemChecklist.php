<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemChecklist extends Model
{
    use HasFactory;

    protected $table = 'items_checklist';

    protected $fillable = [
        'categoria_id',
        'titulo',
        'referencia_normativa',
        'metodo_verificacion',
        'sector_industrial',
        'tipo_inspeccion',
        'nivel_riesgo_defecto',
        'es_del_sistema',
    ];

    protected $casts = [
        'es_del_sistema' => 'boolean',
    ];

    /**
     * Categoría a la que pertenece este ítem.
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaChecklist::class, 'categoria_id');
    }
}