<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Carga y normaliza el contenido inicial de la portada.
 *
 * Se mantiene separado de las migraciones de esquema para que las tablas se
 * creen primero y el contenido pueda evolucionar sin modificar su estructura.
 */
class PortalContentSeeder extends Seeder
{
    public function run(): void
    {
        $steps = [
            'PortalContentSteps/AddPortalContent.php',
            'PortalContentSteps/ExpandPortalContent.php',
            'PortalContentSteps/AddManualImages.php',
        ];

        foreach ($steps as $step) {
            $migration = require __DIR__ . '/' . $step;
            $migration->up();
        }
    }
}
