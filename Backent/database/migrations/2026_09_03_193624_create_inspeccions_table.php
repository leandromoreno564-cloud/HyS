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
        Schema::create('inspecciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
            $table->foreignId('inspector_id')->constrained('usuarios');
            $table->string('tipo', 50)->default('General');
            $table->string('estado', 50)->default('Borrador');
            $table->dateTime('fecha_inicio')->nullable();
            $table->dateTime('fecha_fin')->nullable();
            $table->string('start_time', 20)->nullable();
            $table->string('end_time', 20)->nullable();
            $table->text('observaciones_generales')->nullable();
            $table->decimal('porcentaje_avance', 5, 2)->default(0.00);
            $table->string('token')->nullable()->unique();
            $table->text('firma_inspector')->nullable();
            $table->text('firma_empresa')->nullable();
            $table->string('nombre_firmante_empresa')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspecciones');
    }
};
