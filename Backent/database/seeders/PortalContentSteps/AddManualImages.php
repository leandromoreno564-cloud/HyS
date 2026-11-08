<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // Imágenes de los capítulos del manual (solo donde todavía no tienen una)
        $images = [
            'Cómo ingresar y registrarte' => 'login.svg',
            'El panel principal' => 'panel.svg',
            'Registrar y editar empresas' => 'empresa-alta.svg',
            'Relevamiento (checklist) de una empresa' => 'relevamiento.svg',
            'Descargar el relevamiento en PDF' => 'pdf-descarga.svg',
            'Calendario de actividades' => 'calendario.svg',
            'Notificaciones' => 'notificaciones.svg',
            'Asistente virtual' => 'asistente.svg',
            'Mi perfil y contraseña' => 'perfil-sesion.svg',
            'Exportar datos a Excel' => 'exportar.svg',
            'Administración de usuarios (solo administradores)' => 'usuarios.svg',
            'Editar esta portada (solo administradores)' => 'portada-edicion.svg',
            'Ítems en "No": recomendación y regulación' => 'seguimiento-no.svg',
        ];
        foreach ($images as $title => $file) {
            DB::table('portal_items')
                ->where('section', 'ayuda')->where('title', $title)->whereNull('image')
                ->update(['image' => '/images/bot/' . $file, 'updated_at' => $now]);
        }

        // El asistente ahora es una guía codeada (ya no usa IA): se actualiza su capítulo
        DB::table('portal_items')
            ->where('section', 'ayuda')->where('title', 'Asistente virtual')
            ->update([
                'title' => 'Asistente HyS',
                'text' => "El Asistente HyS es el botón azul de la esquina inferior derecha. Elegí un tema con los botones o escribí tu duda con tus palabras: te responde al instante, con texto e imágenes.\n\nTambién tiene guías paso a paso (por ejemplo, para completar un relevamiento o cargar un PDF) y desde ahí podés descargar el manual de usuario completo.",
                'updated_at' => $now,
            ]);

        // Capítulo con el manual completo
        $title = 'Manual de usuario completo (PDF)';
        if (!DB::table('portal_items')->where('section', 'ayuda')->where('title', $title)->exists()) {
            $next = (int) DB::table('portal_items')->where('section', 'ayuda')->max('sort_order') + 1;
            DB::table('portal_items')->insert([
                'section' => 'ayuda',
                'sort_order' => $next,
                'is_active' => true,
                'title' => $title,
                'text' => "Descargá el manual de usuario completo con el botón de esta sección, o pedíselo al Asistente HyS.\n\nExplica cada pantalla paso a paso: ingreso, panel, empresas, relevamientos, seguimiento de los ítems en \"No\", PDF, calendario, notificaciones, perfil, administración y una guía rápida de seguridad e higiene.",
                'icon' => null, 'image' => null, 'video' => null,
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('portal_items')->where('section', 'ayuda')->where('title', 'Manual de usuario completo (PDF)')->delete();
    }
};
