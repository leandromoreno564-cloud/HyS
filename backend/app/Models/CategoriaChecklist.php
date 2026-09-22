<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaChecklist extends Model
{
    use HasFactory;

    protected $table = 'categoria_checklists';

    protected $fillable = [
        'nombre',
        'icono',
        'descripcion',
        'orden',
    ];

    protected $casts = [
        'orden' => 'integer',
    ];

    /**
     * Ítems de checklist que pertenecen a esta categoría.
     */
    public function items(): HasMany
    {
        return $this->hasMany(ItemChecklist::class, 'categoria_id')->orderBy('id');
    }
}