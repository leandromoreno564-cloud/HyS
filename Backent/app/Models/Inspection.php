<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Inspection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'user_id',
        'inspection_date',
        'type',
        'status',
        'start_time',
        'end_time',
        'general_observations',
        'progress_percentage',
        'signature_inspector',
        'signature_company',
        'signature_company_name',
        'token',
    ];

    protected function casts(): array
    {
        return [
            'inspection_date' => 'date',
            'progress_percentage' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function ($inspection) {
            if (empty($inspection->token)) {
                $inspection->token = Str::uuid()->toString();
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class)->withTrashed();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(InspectionChecklistItem::class);
    }

    public function observations(): HasMany
    {
        return $this->hasMany(Observation::class);
    }

    public function correctiveMeasures(): HasMany
    {
        return $this->hasMany(CorrectiveMeasure::class);
    }

    public function calculateProgress(): int
    {
        $total = $this->checklistItems()->count();
        if ($total === 0) {
            $this->update(['progress_percentage' => 0]);
            return 0;
        }

        $evaluated = $this->checklistItems()
            ->whereIn('status', ['Cumple', 'No Cumple', 'No Aplica'])
            ->count();

        $percentage = (int) round(($evaluated / $total) * 100);
        $this->update(['progress_percentage' => $percentage]);
        return $percentage;
    }

    public function complianceStats(): array
    {
        $items = $this->checklistItems;
        $total = $items->count();
        $cumple = $items->where('status', 'Cumple')->count();
        $noCumple = $items->where('status', 'No Cumple')->count();
        $noAplica = $items->where('status', 'No Aplica')->count();
        $pendiente = $items->where('status', 'Pendiente')->count();

        $applicable = $total - $noAplica;
        $rate = $applicable > 0 ? round(($cumple / $applicable) * 100, 1) : 100;

        return [
            'total' => $total,
            'cumple' => $cumple,
            'no_cumple' => $noCumple,
            'no_aplica' => $noAplica,
            'pendiente' => $pendiente,
            'rate' => $rate,
        ];
    }

    public function scopeAccessibleBy(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where('user_id', $user->id)
            ->orWhereHas('company', function ($cq) use ($user) {
                $cq->where('created_by', $user->id)
                   ->orWhereHas('inspectors', function ($iq) use ($user) {
                       $iq->where('users.id', $user->id);
                   });
            });
    }
}
