<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarEvent extends Model
{
    public const TYPES = [
        'revision' => 'Revisión',
        'seguimiento' => 'Seguimiento de medidas',
        'capacitacion' => 'Capacitación',
        'reunion' => 'Reunión',
        'otro' => 'Otra actividad',
    ];

    public const STATUSES = ['pendiente', 'completada', 'cancelada'];

    protected $fillable = [
        'title',
        'type',
        'description',
        'inspector_id',
        'company_id',
        'created_by',
        'date',
        'start_time',
        'end_time',
        'status',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'completed_at' => 'datetime',
        ];
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
