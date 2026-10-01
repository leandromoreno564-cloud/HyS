<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Empresas
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('business_name'); // Razón social
            $table->string('tax_id')->unique(); // CUIT/RUC
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('industry_sector'); // Sector industrial
            $table->integer('employee_count')->default(1);
            $table->string('website')->nullable();
            $table->string('contact_person')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
