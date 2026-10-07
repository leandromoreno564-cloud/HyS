<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyChecklist extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'created_by', 'name', 'surveyed_at'];

    protected function casts(): array
    {
        return ['surveyed_at' => 'date'];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CompanyChecklistItem::class)->orderBy('item_number');
    }
}
