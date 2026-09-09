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
        Schema::create('inspecciones', function (Blueprint $table) {
    $table->id();
    $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
    $table->foreignId('inspector_id')->constrained('usuarios');
    $table->enum('tipo', ['General', 'Especifica', 'Seguimiento']);
    $table->enum('estado', ['Borrador', 'En Progreso', 'Completada', 'Cancelada'])->default('Borrador');
    $table->dateTime('fecha_inicio')->nullable();
    $table->dateTime('fecha_fin')->nullable();
    $table->text('observaciones_generales')->nullable();
    $table->decimal('porcentaje_avance', 5, 2)->default(0.00);
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspecciones');
    }
};
