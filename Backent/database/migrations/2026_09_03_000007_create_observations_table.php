<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 7. Observaciones Registradas
        Schema::create('observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained('inspections')->cascadeOnDelete();
            $table->foreignId('inspection_checklist_item_id')->nullable()->constrained('inspection_checklist_items')->nullOnDelete();
            $table->string('type')->default('Hallazgo'); // Hallazgo, Buena práctica, Mejora
            $table->string('severity')->default('Moderado'); // Menor, Moderado, Mayor, Crítico
            $table->string('location')->nullable();
            $table->text('description');
            $table->json('photos')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('observations');
    }
};
