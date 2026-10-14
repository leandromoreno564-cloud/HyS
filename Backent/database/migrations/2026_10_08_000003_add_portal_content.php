<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const ICONS = [
        'shield', 'hardhat', 'alert', 'graduation', 'search', 'brain', 'megaphone', 'flame',
        'heart', 'file', 'users', 'clipboard', 'scale', 'phone', 'eye', 'wrench', 'check', 'sparkles',
    ];

    public function up(): void
    {
        $now = now();

        // 1) Quitar emojis de los elementos ya cargados (se reemplazan por íconos)
        $byTitle = [
            'Elementos de protección' => 'hardhat', 'Prevención de riesgos' => 'alert', 'Capacitación' => 'graduation',
            'Identificar' => 'search', 'Evaluar' => 'brain', 'Proteger' => 'shield', 'Comunicar' => 'megaphone',
        ];
        foreach (DB::table('portal_items')->get() as $row) {
            if ($row->icon && !in_array($row->icon, self::ICONS, true)) {
                DB::table('portal_items')->where('id', $row->id)->update(['icon' => $byTitle[$row->title] ?? null]);
            }
        }

        // 2) Ampliar los textos originales (solo si el admin no los modificó)
        $expand = [
            ['recursos', 'Elementos de protección',
                'Conocé la importancia del uso correcto de los EPP y su función frente a distintos riesgos.',
                'Conocé la importancia del uso correcto de los elementos de protección personal (EPP) y su función frente a distintos riesgos. Casco, calzado de seguridad, guantes, antiparras, protección auditiva y arneses: cada uno protege una parte del cuerpo y debe elegirse según la tarea, usarse de forma correcta y reemplazarse cuando se desgasta.'],
            ['recursos', 'Prevención de riesgos',
                'Identificar peligros y actuar antes de que ocurra un incidente es fundamental.',
                'Identificar peligros y actuar antes de que ocurra un incidente es fundamental. La prevención comienza con la observación del entorno, el análisis de cada tarea y la corrección inmediata de las condiciones inseguras, antes de que se conviertan en un accidente.'],
            ['recursos', 'Capacitación',
                'La formación continua permite tomar mejores decisiones y fortalecer una cultura preventiva.',
                'La formación continua permite tomar mejores decisiones y fortalecer una cultura preventiva. Cada capacitación refuerza los conocimientos del equipo, actualiza los procedimientos y recuerda que la seguridad es una responsabilidad compartida por todos.'],
            ['pasos', 'Identificar',
                'Reconocer peligros antes de comenzar una tarea: recorré el lugar, observá el entorno y preguntate qué puede salir mal.',
                'Reconocer peligros antes de comenzar una tarea. Recorré el lugar, observá el entorno, revisá los equipos y preguntate qué puede salir mal. Anotá todo lo que detectes: lo que no se registra, no se corrige.'],
            ['pasos', 'Evaluar',
                'Analizar los riesgos detectados, medir qué tan probables y graves son, y definir medidas preventivas.',
                'Analizar los riesgos detectados y medir qué tan probables y qué tan graves son sus consecuencias. Con esa información se priorizan las acciones y se definen las medidas preventivas más urgentes.'],
            ['pasos', 'Proteger',
                'Utilizar los procedimientos y elementos de protección adecuados para cada tarea, siempre y sin excepciones.',
                'Aplicar las medidas definidas: usar los procedimientos de trabajo seguro, los elementos de protección adecuados y las protecciones colectivas. Proteger es una práctica de todos los días, sin excepciones ni atajos.'],
            ['pasos', 'Comunicar',
                'Informar de inmediato las condiciones inseguras y situaciones de riesgo para que se corrijan a tiempo.',
                'Informar de inmediato las condiciones inseguras, los incidentes y los casi accidentes. Una comunicación a tiempo permite corregir el problema, aprender de lo ocurrido y evitar que se repita.'],
        ];
        foreach ($expand as [$section, $title, $old, $new]) {
            DB::table('portal_items')
                ->where('section', $section)->where('title', $title)->where('text', $old)
                ->update(['text' => $new, 'updated_at' => $now]);
        }

        // 3) Secciones nuevas (solo si todavía no tienen contenido)
        $content = [
            'acerca' => [
                [null, 'Qué es la Higiene y Seguridad en el trabajo',
                    "Es el conjunto de normas, técnicas y prácticas destinadas a preservar la vida, la salud y la integridad física de las personas en su lugar de trabajo.\n\nAbarca desde el diseño de los puestos y las instalaciones hasta la capacitación del personal y el control periódico de las condiciones laborales."],
                [null, 'Por qué es importante',
                    "Un accidente laboral o una enfermedad profesional no solo afecta a quien la sufre: impacta en su familia, en el equipo y en la continuidad de la empresa. Prevenir es siempre más humano, más barato y más eficaz que reparar.\n\nLos ambientes seguros mejoran el clima laboral, reducen el ausentismo y aumentan la productividad."],
                [null, 'Cómo trabajamos',
                    "Esta plataforma permite que los Licenciados en Seguridad e Higiene registren inspecciones por empresa y completen relevamientos con fotos.\n\nLos administradores coordinan al equipo mediante un calendario de actividades y reciben notificaciones de cada avance."],
            ],
            'normativa' => [
                ['scale', 'Ley 19.587', 'Ley de Higiene y Seguridad en el Trabajo. Establece las condiciones generales que deben cumplirse en los establecimientos del país para proteger la vida y la integridad psicofísica de los trabajadores.'],
                ['file', 'Decreto 351/79', 'Reglamenta la Ley 19.587. Detalla los requisitos sobre instalaciones, ventilación, iluminación, ruido, protección contra incendios, máquinas y elementos de protección personal.'],
                ['clipboard', 'Ley 24.557', 'Ley de Riesgos del Trabajo. Crea el sistema de prevención y reparación de los accidentes de trabajo y las enfermedades profesionales, con la intervención de las aseguradoras de riesgos del trabajo (ART).'],
                ['hardhat', 'Decreto 911/96', 'Reglamenta la higiene y seguridad en la industria de la construcción, una de las actividades con mayor exposición a riesgos.'],
            ],
            'practicas' => [
                ['hardhat', 'Usá siempre los elementos de protección', 'Casco, calzado, guantes, protección auditiva y visual: elegí el adecuado para cada tarea y revisá su estado antes de usarlo.'],
                ['sparkles', 'Mantené el orden y la limpieza', 'Los pasillos despejados y las herramientas guardadas evitan caídas, golpes y tropiezos.'],
                ['alert', 'Señalizá los riesgos', 'Carteles, cintas y demarcaciones advierten a todos sobre las zonas peligrosas.'],
                ['flame', 'Conocé las salidas de emergencia', 'Ubicá matafuegos, salidas y puntos de reunión desde tu primer día en el lugar.'],
                ['file', 'Respetá los procedimientos', 'Los procedimientos existen porque alguien aprendió de un accidente. Seguirlos protege a todos.'],
                ['heart', 'Cuidá tu postura y hacé pausas', 'Las pausas activas y una buena ergonomía previenen lesiones por esfuerzo repetitivo.'],
                ['megaphone', 'Reportá incidentes y casi accidentes', 'Un casi accidente es una advertencia gratuita: informalo para corregir la causa a tiempo.'],
                ['graduation', 'Capacitate de forma continua', 'Participá de cada instancia de formación y compartí lo que aprendés con tu equipo.'],
            ],
            'faq' => [
                [null, '¿Qué es un EPP y quién debe proveerlo?', 'Un elemento de protección personal es todo equipo destinado a proteger al trabajador de uno o varios riesgos. La empresa debe entregarlo sin costo, en buen estado y adecuado a la tarea, y el trabajador debe usarlo correctamente.'],
                [null, '¿Qué hago si detecto una condición insegura?', 'Detené la tarea si hay peligro inmediato, avisá a tu supervisor y registrá lo observado. Informar a tiempo permite corregir el problema antes de que ocurra un accidente.'],
                [null, '¿Cada cuánto se realizan las inspecciones?', 'Depende del tipo de actividad y del nivel de riesgo de cada empresa. En el calendario de la plataforma se programan las revisiones y los seguimientos que asigna el administrador.'],
                [null, '¿Cómo me registro en la plataforma?', 'Los Licenciados en Seguridad e Higiene pueden crear su cuenta desde la pantalla de ingreso. Un administrador debe aprobarla antes de que puedas iniciar sesión.'],
                [null, '¿Qué hago ante un accidente?', 'Priorizá la atención de la persona afectada y llamá al servicio de emergencias (911). Luego avisá a tu superior y a la ART, y registrá el hecho para analizar sus causas y evitar que se repita.'],
            ],
        ];

        foreach ($content as $section => $rows) {
            if (DB::table('portal_items')->where('section', $section)->exists()) {
                continue;
            }
            $insert = [];
            foreach ($rows as $i => [$icon, $title, $text]) {
                $insert[] = [
                    'section' => $section, 'sort_order' => $i, 'is_active' => true,
                    'icon' => $icon, 'title' => $title, 'text' => $text, 'image' => null, 'video' => null,
                    'created_at' => $now, 'updated_at' => $now,
                ];
            }
            DB::table('portal_items')->insert($insert);
        }
    }

    public function down(): void
    {
        DB::table('portal_items')->whereIn('section', ['acerca', 'normativa', 'practicas', 'faq'])->delete();
    }
};
