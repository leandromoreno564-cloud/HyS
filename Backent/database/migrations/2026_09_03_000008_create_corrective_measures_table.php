<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 8. Medidas Correctivas
        Schema::create('corrective_measures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained('inspections')->cascadeOnDelete();
            $table->foreignId('observation_id')->nullable()->constrained('observations')->nullOnDelete();
            $table->text('description');
            $table->string('priority')->default('Media'); // Baja, Media, Alta, Crítica
            $table->text('recommendations')->nullable();
            $table->date('deadline')->nullable();
            $table->string('responsible_person')->nullable();
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->string('status')->default('Pendiente'); // Pendiente, En Progreso, Completada, Vencida, Cancelada
            $table->date('verification_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('corrective_measures');
    }
};
