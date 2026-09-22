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
        Schema::create('evidencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspeccion_id')->constrained('inspecciones')->cascadeOnDelete();
            $table->foreignId('observacion_id')->nullable()->constrained('observacions')->nullOnDelete();
            $table->foreignId('item_inspeccion_id')->nullable()->constrained('items_inspeccion')->nullOnDelete();
            $table->string('archivo_path');
            $table->string('nombre_original')->nullable();
            $table->string('tipo_mime', 100)->nullable();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evidencias');
    }
};