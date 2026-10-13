<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssistantMessage extends Model
{
    protected $fillable = ['user_id', 'scope', 'role', 'content', 'meta'];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public static function record(int $userId, string $scope, string $role, string $content, ?array $meta = null): self
    {
        return static::create([
            'user_id' => $userId,
            'scope' => $scope,
            'role' => $role,
            'content' => $content,
            'meta' => $meta,
        ]);
    }
}
