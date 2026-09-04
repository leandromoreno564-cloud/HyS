<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'license_number',
        'is_active',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isInspector(): bool
    {
        return $this->role === 'inspector';
    }

    public function assignedCompanies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'company_user')->withTimestamps();
    }

    public function createdCompanies(): HasMany
    {
        return $this->hasMany(Company::class, 'created_by');
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class, 'user_id');
    }

    public function appNotifications(): HasMany
    {
        return $this->hasMany(AppNotification::class, 'user_id')->latest();
    }

    public function unreadNotificationsCount(): int
    {
        return $this->appNotifications()->where('is_read', false)->count();
    }
}
