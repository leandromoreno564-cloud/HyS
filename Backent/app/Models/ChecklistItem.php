<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'normative_reference',
        'verification_method',
        'industry_sector',
        'inspection_type',
        'default_risk_level',
        'is_system',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ChecklistCategory::class, 'category_id');
    }
}
