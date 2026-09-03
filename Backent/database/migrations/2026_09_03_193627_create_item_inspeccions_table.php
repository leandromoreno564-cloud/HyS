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
    $table->text('descripcion_personalizada')->nullable();
    $table->enum('estado', ['Cumple', 'No Cumple', 'No Aplica', 'Pendiente'])->default('Pendiente');
    $table->text('observacion')->nullable();
    $table->timestamps();

});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_inspeccions');
    }
};
