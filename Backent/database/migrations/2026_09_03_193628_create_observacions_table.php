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
        Schema::create('observacions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspeccion_id')->constrained('inspecciones')->cascadeOnDelete();
            $table->foreignId('item_inspeccion_id')->nullable()->constrained('items_inspeccion')->nullOnDelete();
            $table->string('tipo', 50)->default('Hallazgo');
            $table->string('severidad', 50)->default('Moderado');
            $table->string('ubicacion')->nullable();
            $table->text('descripcion');
            $table->json('fotos')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('observacions');
    }
};
