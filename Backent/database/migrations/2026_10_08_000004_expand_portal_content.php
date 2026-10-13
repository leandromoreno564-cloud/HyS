<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // Agrega elementos a una sección sin repetir los que ya existen (por título)
        $append = function (string $section, array $rows) use ($now) {
            $next = DB::table('portal_items')->where('section', $section)->exists()
                ? (int) DB::table('portal_items')->where('section', $section)->max('sort_order') + 1
                : 0;

            foreach ($rows as [$icon, $title, $text]) {
                if (DB::table('portal_items')->where('section', $section)->where('title', $title)->exists()) {
                    continue;
                }
                DB::table('portal_items')->insert([
                    'section' => $section, 'sort_order' => $next++, 'is_active' => true,
                    'icon' => $icon, 'title' => $title, 'text' => $text, 'image' => null, 'video' => null,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        };

        $append('acerca', [
            [null, 'Nuestra misión',
                "Promover ambientes de trabajo seguros y saludables mediante la prevención, la capacitación y el seguimiento sistemático de las condiciones laborales, acompañando a las empresas en el cumplimiento de la normativa vigente.\n\nCreemos que la seguridad no es un costo sino una inversión: protege a las personas, resguarda el patrimonio de las organizaciones y fortalece la confianza de todos los que forman parte de ellas."],
            [null, 'Nuestros valores',
                "Responsabilidad: cada integrante del equipo es parte activa de la seguridad.\n\nPrevención: actuamos antes de que ocurra el daño.\n\nTransparencia: registramos y comunicamos los hallazgos con claridad.\n\nMejora continua: aprendemos de cada inspección y de cada incidente.\n\nRespeto por las personas: la vida y la salud siempre son lo primero."],
            [null, 'Qué ofrece la plataforma',
                "Gestión de empresas y establecimientos, relevamientos con checklist y fotos, medidas correctivas con estado y vencimientos, calendario de actividades, notificaciones, asistente virtual y exportación de los datos a Excel.\n\nTodo en un solo lugar, con roles diferenciados para administradores y licenciados, para que cada uno vea y haga lo que le corresponde."],
        ]);

        $append('recursos', [
            ['alert', 'Señalización de seguridad',
                'Los carteles, colores y pictogramas de seguridad comunican en un instante qué está prohibido, qué es obligatorio, qué advierte un peligro y dónde están las salidas y los equipos de emergencia. Una buena señalización debe ser visible, estar en buen estado y ser comprendida por todos.'],
            ['flame', 'Protección contra incendios',
                'Detectores, matafuegos, hidrantes y vías de evacuación forman un sistema que reduce el daño de un incendio. Conocer su ubicación, revisar sus fechas de vencimiento y practicar simulacros periódicos marca la diferencia en los primeros minutos, que son los más importantes.'],
            ['heart', 'Primeros auxilios',
                'Saber cómo actuar frente a un corte, una quemadura, un desmayo o una descompensación puede evitar complicaciones graves mientras llega la ayuda médica. Contar con botiquines completos y personal capacitado es una responsabilidad de cada establecimiento.'],
        ]);

        $append('riesgos', [
            ['volume', 'Riesgos físicos', 'Ruido, vibraciones, temperaturas extremas, iluminación deficiente y radiaciones. Sus efectos suelen aparecer de forma lenta, como la pérdida de audición, por eso se miden y se controlan de manera periódica.'],
            ['flask', 'Riesgos químicos', 'Gases, vapores, polvos y líquidos corrosivos, tóxicos o inflamables. Se previenen con buena ventilación, etiquetado claro, hojas de seguridad de cada producto y elementos de protección adecuados.'],
            ['bug', 'Riesgos biológicos', 'Virus, bacterias, hongos y parásitos presentes en ciertas tareas, como la salud, la limpieza o el trabajo con animales. La higiene, la vacunación y los procedimientos de desinfección son las principales defensas.'],
            ['activity', 'Riesgos ergonómicos', 'Posturas forzadas, movimientos repetitivos y levantamiento manual de cargas. Provocan dolores y lesiones que se instalan con el tiempo. Se reducen con puestos bien diseñados, pausas y buenas técnicas de trabajo.'],
            ['brain', 'Riesgos psicosociales', 'Estrés, sobrecarga de tareas, falta de descanso y violencia laboral. Afectan la salud mental y física, y también el clima del equipo. Hablar a tiempo y contar con espacios de escucha ayuda a prevenirlos.'],
            ['cog', 'Riesgos mecánicos', 'Máquinas sin protecciones, herramientas en mal estado, atrapamientos, golpes y cortes. Se evitan con resguardos, mantenimiento preventivo y procedimientos de bloqueo y etiquetado antes de intervenir un equipo.'],
            ['zap', 'Riesgos eléctricos', 'Contactos directos o indirectos, cables dañados e instalaciones sobrecargadas. Pueden causar quemaduras, paros cardíacos e incendios. Requieren personal capacitado, puesta a tierra, disyuntores y revisiones periódicas.'],
            ['flame', 'Incendio y explosión', 'Materiales inflamables, chispas, acumulación de gases o polvos y fallas eléctricas. Se previenen con orden, almacenamiento correcto, control de fuentes de ignición y equipos de extinción en condiciones.'],
            ['alert', 'Caídas de altura y a nivel', 'Trabajo en andamios, escaleras y techos, pisos mojados y obstáculos en el camino. Se controlan con barandas, arneses, escaleras en buen estado, calzado adecuado y zonas de paso despejadas.'],
        ]);

        $append('normativa', [
            ['file', 'Resolución SRT 295/03', 'Aprueba especificaciones técnicas sobre ergonomía y levantamiento manual de cargas, radiaciones y valores límite de exposición a sustancias químicas, entre otros temas, y actualiza el Decreto 351/79.'],
            ['hardhat', 'Resolución SRT 299/11', 'Establece el procedimiento para la entrega de elementos de protección personal, que deben ser adecuados al riesgo, estar certificados y quedar registrados mediante una constancia de entrega al trabajador.'],
        ]);

        $append('practicas', [
            ['wrench', 'Revisá tu equipo antes de usarlo', 'Una inspección rápida de herramientas, máquinas y vehículos al comenzar la jornada permite detectar fallas antes de que causen un accidente.'],
            ['alert', 'No improvises con herramientas ni máquinas', 'Cada herramienta está diseñada para una tarea. Usarla para otra cosa, o sin sus protecciones, es una de las causas más comunes de lesiones.'],
            ['activity', 'Cuidate del calor y del frío', 'Tomá agua, hacé pausas a la sombra y abrigate según la tarea. Las temperaturas extremas reducen la atención y aumentan el riesgo de errores.'],
            ['users', 'Cuidá a tus compañeros', 'La seguridad es colectiva: si ves a alguien en riesgo, avisale. Un llamado a tiempo, hecho con respeto, puede evitar un accidente.'],
        ]);

        $append('emergencia', [
            ['brain', 'Mantené la calma', 'Respirá, observá el entorno y evaluá la situación antes de actuar. El pánico lleva a decisiones apresuradas que pueden empeorar el problema.'],
            ['megaphone', 'Da la alarma', 'Avisá de inmediato a las personas cercanas y a quien coordine la emergencia en el lugar. Usá la alarma del establecimiento si existe.'],
            ['phone', 'Llamá al servicio de emergencias', 'Marcá el 911 e informá con claridad qué ocurrió, dónde estás, cuántas personas están afectadas y cuál es tu teléfono. No cortes hasta que te lo indiquen.'],
            ['users', 'Asistí o evacuá según corresponda', 'Si podés ayudar sin ponerte en peligro, hacelo. Si hay fuego, humo o riesgo de derrumbe, evacuá por las vías señalizadas, sin correr y sin usar ascensores.'],
            ['flag', 'Dirigite al punto de reunión', 'Una vez afuera, andá al lugar de encuentro definido en el plan de evacuación para que se pueda controlar que todos estén a salvo. No regreses hasta que lo autoricen.'],
            ['clipboard', 'Informá y registrá lo ocurrido', 'Avisá a tu superior y a la ART, y dejá constancia del hecho. El registro permite analizar las causas y tomar medidas para que no se repita.'],
        ]);

        $append('faq', [
            [null, '¿Qué es una inspección de seguridad?', 'Es una visita planificada a un establecimiento para observar sus instalaciones, equipos y formas de trabajo, comparándolos con la normativa y las buenas prácticas. Se documenta con un relevamiento y, si hay desvíos, se definen medidas correctivas.'],
            [null, '¿Qué diferencia hay entre peligro y riesgo?', 'El peligro es lo que puede causar daño, por ejemplo un cable pelado. El riesgo es la probabilidad de que ese daño ocurra y su gravedad. Se puede reducir el riesgo eliminando el peligro o protegiéndose de él.'],
            [null, '¿Qué es un casi accidente?', 'Es un hecho que pudo haber causado daño pero no lo hizo, por azar. Es una señal de alerta muy valiosa: informarlo permite corregir la causa antes de que ocurra un accidente real.'],
            [null, '¿Cuáles son mis derechos y obligaciones como trabajador?', 'Tenés derecho a trabajar en condiciones seguras, a recibir capacitación y elementos de protección sin costo, y a informar situaciones de riesgo. Y tenés la obligación de cumplir las normas de seguridad, usar los elementos entregados y colaborar con la prevención.'],
            [null, '¿Cómo se usa un matafuegos?', 'Recordá cuatro pasos: tirar el precinto, apuntar a la base del fuego, apretar la palanca y barrer de lado a lado. Antes, verificá que sea el tipo adecuado para el fuego y que tengas una salida libre a tu espalda.'],
            [null, '¿Qué hago si no tengo los elementos de protección?', 'No comiences la tarea de riesgo. Avisá a tu supervisor y solicitá los elementos necesarios. Trabajar sin protección nunca vale la pena.'],
            [null, '¿Cómo exporto la información de la plataforma?', 'Desde el menú lateral, en la sección Exportación, podés descargar los datos en un archivo compatible con Excel (CSV) para analizarlos o presentarlos.'],
            [null, '¿Qué tareas tienen los administradores?', 'Los administradores gestionan los usuarios, aprueban nuevas cuentas, asignan empresas a los licenciados, programan actividades en el calendario y editan el contenido de esta portada.'],
        ]);
    }

    public function down(): void
    {
        DB::table('portal_items')->whereIn('section', ['riesgos', 'emergencia'])->delete();
    }
};
