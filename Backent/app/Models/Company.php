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
        'created_by',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'employee_count' => 'integer',
        ];
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

    public function checklists(): HasMany
    {
        return $this->hasMany(CompanyChecklist::class)->latest('surveyed_at')->latest('id');
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

    /**
     * Empresas que el usuario puede consultar.
     *
     * Los inspectores pueden consultar el padrón completo, pero las reglas de
     * acceso para editar o administrar una empresa siguen usando accessibleBy.
     */
    public function scopeVisibleBy(Builder $query, User $user): Builder
    {
        if ($user->isAdmin() || $user->isInspector()) {
            return $query;
        }

        return $query->accessibleBy($user);
    }

    public function isAccessibleBy(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $this->created_by === $user->id || $this->inspectors->contains('id', $user->id);
    }

    public function isVisibleBy(User $user): bool
    {
        return $user->isAdmin() || $user->isInspector() || $this->isAccessibleBy($user);
    }
}
