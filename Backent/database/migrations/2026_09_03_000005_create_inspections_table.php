<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 5. Inspecciones
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Licenciado responsable
            $table->date('inspection_date');
            $table->string('type')->default('General'); // General, Específica, Seguimiento
            $table->string('status')->default('Borrador'); // Borrador, En Progreso, Completada, Cancelada
            $table->string('start_time')->nullable();
            $table->string('end_time')->nullable();
            $table->text('general_observations')->nullable();
            $table->integer('progress_percentage')->default(0);
            $table->text('signature_inspector')->nullable();
            $table->text('signature_company')->nullable();
            $table->string('signature_company_name')->nullable();
            $table->string('token')->unique(); // Token único para validación QR
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};
