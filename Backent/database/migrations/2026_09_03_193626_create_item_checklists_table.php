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
        Schema::create('items_checklist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categoria_checklists')->cascadeOnDelete();
            $table->string('titulo', 500);
            $table->string('referencia_normativa')->nullable();
            $table->string('metodo_verificacion')->nullable();
            $table->string('sector_industrial')->nullable();
            $table->string('tipo_inspeccion')->nullable();
            $table->string('nivel_riesgo_defecto', 20)->default('Medio');
            $table->boolean('es_del_sistema')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items_checklist');
    }
};
