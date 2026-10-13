<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Historial del asistente: una fila por mensaje, separado por "scope"
        //   general        → asistente general del sistema
        //   checklist:{id} → asistente del relevamiento de la empresa {id}
        Schema::create('assistant_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('scope', 60);
            $table->string('role', 10); // user | assistant
            $table->text('content');
            $table->json('meta')->nullable(); // links, acciones propuestas y su estado, ítems actualizados
            $table->timestamps();

            $table->index(['user_id', 'scope', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assistant_messages');
    }
};
