<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('medida_correctivas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspeccion_id')->constrained('inspecciones')->cascadeOnDelete();
            $table->foreignId('observacion_id')->nullable()->constrained('observacions')->nullOnDelete();
            $table->text('descripcion');
            $table->string('prioridad', 50)->default('Media');
            $table->text('recomendaciones')->nullable();
            $table->date('fecha_limite')->nullable();
            $table->string('responsable')->nullable();
            $table->decimal('costo_estimado', 12, 2)->nullable();
            $table->string('estado', 50)->default('Pendiente');
            $table->date('fecha_verificacion')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medida_correctivas');
    }
};
