<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Actividades que el administrador le asigna a un inspector (revisiones, seguimientos, etc.)
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->string('type', 30)->default('revision'); // revision, seguimiento, capacitacion, reunion, otro
            $table->text('description')->nullable();
            $table->foreignId('inspector_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('date');
            $table->time('start_time')->nullable(); // sin hora = todo el día
            $table->time('end_time')->nullable();
            $table->string('status', 20)->default('pendiente'); // pendiente, completada, cancelada
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['inspector_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
