<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChecklistCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'icon',
        'description',
        'order',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ChecklistItem::class, 'category_id')->orderBy('id');
    }
}
