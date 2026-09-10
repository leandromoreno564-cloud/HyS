<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Observation extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_id',
        'inspection_checklist_item_id',
        'type', // Hallazgo, Buena práctica, Mejora
        'severity', // Menor, Moderado, Mayor, Crítico
        'location',
        'description',
        'photos',
    ];

    protected $casts = [
        'photos' => 'array',
    ];

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(Inspection::class);
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(InspectionChecklistItem::class, 'inspection_checklist_item_id');
    }

    public function correctiveMeasures(): HasMany
    {
        return $this->hasMany(CorrectiveMeasure::class);
    }
}
