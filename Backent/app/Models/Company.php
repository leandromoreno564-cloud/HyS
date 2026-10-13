<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'business_name',
        'tax_id',
        'address',
        'phone',
        'email',
        'industry_sector',
        'employee_count',
        'website',
        'contact_person',
        'latitude',
        'longitude',
        'location_accuracy',
        'location_captured_at',
        'location_photo',
        'created_by',
        'is_active',
    ];

    protected $appends = ['location_photo_url'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'employee_count' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
            'location_accuracy' => 'float',
            'location_captured_at' => 'datetime',
        ];
    }

    public function getLocationPhotoUrlAttribute(): ?string
    {
        return $this->location_photo ? '/storage/' . $this->location_photo : null;
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function inspectors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'company_user')->withTimestamps();
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class)->latest('inspection_date');
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(CompanyChecklistItem::class)->orderBy('item_number');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeAccessibleBy(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where(function ($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhereHas('inspectors', function ($iq) use ($user) {
                  $iq->where('users.id', $user->id);
              });
        });
    }

    public function isAccessibleBy(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $this->created_by === $user->id || $this->inspectors->contains('id', $user->id);
    }
}
