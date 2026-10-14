<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'link',
        'is_read',
        'remind_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'remind_at' => 'datetime',
    ];

    /** Solo notificaciones ya vigentes (los recordatorios futuros todavía no se muestran). */
    public function scopeDue($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('remind_at')->orWhere('remind_at', '<=', now());
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
