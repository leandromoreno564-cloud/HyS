<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChecklistCategory extends Model
{
    use HasFactory;

    protected $table = 'categoria_checklists';

    protected $fillable = [
        'nombre',
        'name',
        'icono',
        'icon',
        'descripcion',
        'description',
        'orden',
        'order',
    ];

    public function getNameAttribute(): string
    {
        return $this->attributes['nombre'] ?? $this->attributes['name'] ?? '';
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['nombre'] = $value;
    }

    public function getIconAttribute(): string
    {
        return $this->attributes['icono'] ?? $this->attributes['icon'] ?? 'fa-clipboard-check';
    }

    public function setIconAttribute($value): void
    {
        $this->attributes['icono'] = $value;
    }

    public function getDescriptionAttribute(): ?string
    {
        return $this->attributes['descripcion'] ?? $this->attributes['description'] ?? null;
    }

    public function setDescriptionAttribute($value): void
    {
        $this->attributes['descripcion'] = $value;
    }

    public function getOrderAttribute(): int
    {
        return (int) ($this->attributes['orden'] ?? $this->attributes['order'] ?? 0);
    }

    public function setOrderAttribute($value): void
    {
        $this->attributes['orden'] = $value;
    }

    public function items(): HasMany
    {
        return $this->hasMany(ChecklistItem::class, 'categoria_id')->orderBy('id');
    }
}
