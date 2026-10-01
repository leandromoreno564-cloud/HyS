<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->unsignedInteger('item_number'); // orden/número tal como figura en el PDF
            $table->string('category')->nullable(); // título de sección (ej. "HERRAMIENTAS")
            $table->text('question'); // texto de la pregunta, tal como está en el PDF
            $table->text('reference')->nullable(); // normativa vigente asociada
            $table->string('status')->nullable(); // SI, NO, NO_APLICA
            $table->text('description')->nullable(); // descripción/observación cargada por el usuario
            $table->string('photo_1')->nullable();
            $table->string('photo_2')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'item_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_checklist_items');
    }
};
