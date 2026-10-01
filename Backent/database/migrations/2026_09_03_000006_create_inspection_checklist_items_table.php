<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 6. Items Evaluados en la Inspección
        Schema::create('inspection_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained('inspections')->cascadeOnDelete();
            $table->foreignId('checklist_item_id')->nullable()->constrained('checklist_items')->nullOnDelete();
            $table->string('category_name');
            $table->string('title');
            $table->string('normative_reference')->nullable();
            $table->string('verification_method')->nullable();
            $table->string('status')->default('Pendiente'); // Cumple, No Cumple, No Aplica, Pendiente
            $table->string('risk_level')->default('Bajo'); // Bajo, Medio, Alto
            $table->text('notes')->nullable();
            $table->json('photos')->nullable();
            $table->boolean('is_custom')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspection_checklist_items');
    }
};
