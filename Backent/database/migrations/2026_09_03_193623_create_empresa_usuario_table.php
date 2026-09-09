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
        Schema::create('empresa_usuario', function (Blueprint $table) {
    $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
    $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
    $table->timestamps();
    
    $table->primary(['empresa_id', 'usuario_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresa_usuario');
    }
};
