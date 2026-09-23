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
        Schema::create('items_inspeccion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspeccion_id')->constrained('inspecciones')->cascadeOnDelete();
            $table->foreignId('item_checklist_id')->nullable()->constrained('items_checklist')->nullOnDelete();
            $table->string('categoria_nombre')->nullable();
            $table->string('titulo', 500)->nullable();
            $table->string('referencia_normativa')->nullable();
            $table->string('metodo_verificacion')->nullable();
            $table->string('estado', 50)->default('Pendiente');
            $table->string('nivel_riesgo', 20)->default('Bajo');
            $table->text('observacion')->nullable();
            $table->text('notas')->nullable();
            $table->json('fotos')->nullable();
            $table->boolean('es_personalizado')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items_inspeccion');
    }
};
