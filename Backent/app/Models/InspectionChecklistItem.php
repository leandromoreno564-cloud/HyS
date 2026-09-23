<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InspectionChecklistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_id',
        'checklist_item_id',
        'category_name',
        'title',
        'normative_reference',
        'verification_method',
        'status',
        'risk_level',
        'notes',
        'photos',
        'is_custom',
    ];

    protected $casts = [
        'photos' => 'array',
        'is_custom' => 'boolean',
    ];

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(Inspection::class);
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(ChecklistItem::class);
    }

    public function observations(): HasMany
    {
        return $this->hasMany(Observation::class, 'inspection_checklist_item_id');
    }
}
