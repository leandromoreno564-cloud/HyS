<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_notifications', function (Blueprint $table) {
            // Recordatorios: la notificación solo se muestra cuando llega esta fecha (null = de inmediato)
            $table->timestamp('remind_at')->nullable()->after('is_read');
        });
    }

    public function down(): void
    {
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->dropColumn('remind_at');
        });
    }
};
