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
        Schema::create('empresas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('creado_por')->constrained('usuarios');
    $table->string('razon_social');
    $table->string('cuit', 50)->unique();
    $table->string('direccion');
    $table->string('telefono', 50)->nullable();
    $table->string('email_contacto')->nullable();
    $table->string('sector', 100)->nullable();
    $table->integer('cantidad_empleados')->nullable();
    $table->string('sitio_web')->nullable();
    $table->string('persona_contacto')->nullable();
    $table->boolean('activa')->default(true);
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
