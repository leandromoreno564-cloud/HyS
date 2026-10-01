<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyChecklistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'item_number',
        'category',
        'question',
        'reference',
        'status',
        'description',
        'photo_1',
        'photo_2',
    ];

    protected function casts(): array
    {
        return [
            'item_number' => 'integer',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
