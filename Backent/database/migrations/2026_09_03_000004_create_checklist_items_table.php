<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 4. Plantillas de Items de Checklist
        Schema::create('checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('checklist_categories')->cascadeOnDelete();
            $table->string('title');
            $table->string('normative_reference')->nullable();
            $table->string('verification_method')->nullable();
            $table->string('industry_sector')->nullable(); // null = aplica a todos
            $table->string('inspection_type')->nullable(); // null = aplica a todos
            $table->string('default_risk_level')->default('Medio');
            $table->boolean('is_system')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_items');
    }
};
