<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portal_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 60)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_items', function (Blueprint $table) {
            $table->id();
            $table->string('section', 20)->index(); // stats, recursos, pasos, galeria, videos
            $table->string('title', 150)->nullable();
            $table->text('text')->nullable();
            $table->string('icon', 16)->nullable();
            $table->string('image', 500)->nullable(); // ruta en disco public o URL
            $table->string('video', 500)->nullable(); // ruta en disco public, URL o enlace de YouTube
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Contenido inicial (el admin lo puede cambiar todo desde la portada)
        $img = fn (string $id) => "https://images.unsplash.com/{$id}?auto=format&fit=crop&w=900&q=80";
        $now = now();
        $rows = [];
        $add = function (string $section, int $order, array $f) use (&$rows, $now) {
            $rows[] = array_merge([
                'section' => $section, 'sort_order' => $order, 'is_active' => true,
                'title' => null, 'text' => null, 'icon' => null, 'image' => null, 'video' => null,
                'created_at' => $now, 'updated_at' => $now,
            ], $f);
        };

        $add('stats', 0, ['title' => '01', 'text' => 'Prevención']);
        $add('stats', 1, ['title' => '02', 'text' => 'Capacitación']);
        $add('stats', 2, ['title' => '03', 'text' => 'Protección']);

        $add('recursos', 0, ['icon' => 'hardhat', 'title' => 'Elementos de protección', 'text' => 'Conocé la importancia del uso correcto de los EPP y su función frente a distintos riesgos.', 'image' => $img('photo-1504307651254-35680f356dfd')]);
        $add('recursos', 1, ['icon' => 'alert', 'title' => 'Prevención de riesgos', 'text' => 'Identificar peligros y actuar antes de que ocurra un incidente es fundamental.', 'image' => $img('photo-1517048676732-d65bc937f952')]);
        $add('recursos', 2, ['icon' => 'graduation', 'title' => 'Capacitación', 'text' => 'La formación continua permite tomar mejores decisiones y fortalecer una cultura preventiva.', 'image' => $img('photo-1521737711867-e3b97375f902')]);

        $add('pasos', 0, ['icon' => 'search', 'title' => 'Identificar', 'text' => 'Reconocer peligros antes de comenzar una tarea: recorré el lugar, observá el entorno y preguntate qué puede salir mal.']);
        $add('pasos', 1, ['icon' => 'brain', 'title' => 'Evaluar', 'text' => 'Analizar los riesgos detectados, medir qué tan probables y graves son, y definir medidas preventivas.']);
        $add('pasos', 2, ['icon' => 'shield', 'title' => 'Proteger', 'text' => 'Utilizar los procedimientos y elementos de protección adecuados para cada tarea, siempre y sin excepciones.']);
        $add('pasos', 3, ['icon' => 'megaphone', 'title' => 'Comunicar', 'text' => 'Informar de inmediato las condiciones inseguras y situaciones de riesgo para que se corrijan a tiempo.']);

        $add('galeria', 0, ['title' => 'Trabajo en obra', 'image' => $img('photo-1504307651254-35680f356dfd')]);
        $add('galeria', 1, ['title' => 'Inspección en planta', 'image' => $img('photo-1581092160607-ee22621dd758')]);
        $add('galeria', 2, ['title' => 'Equipos de trabajo', 'image' => $img('photo-1517048676732-d65bc937f952')]);
        $add('galeria', 3, ['title' => 'Capacitación en equipo', 'image' => $img('photo-1521737711867-e3b97375f902')]);

        DB::table('portal_items')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_items');
        Schema::dropIfExists('portal_settings');
    }
};
