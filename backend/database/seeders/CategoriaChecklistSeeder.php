<?php

namespace Database\Seeders;

use App\Models\CategoriaChecklist;
use App\Models\ItemChecklist;
use Illuminate\Database\Seeder;

class CategoriaChecklistSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            [
                'nombre' => 'Herramientas manuales y portátiles',
                'icono' => 'fa-tools',
                'orden' => 1,
                'descripcion' => 'Inspección del estado de conservación, aislamientos y uso seguro de herramientas.',
                'items' => [
                    [
                        'titulo' => 'Herramientas de mano en buen estado de conservación (sin rebabas, mangos fisurados o astillados)',
                        'referencia_normativa' => 'Dec. 351/79 Art. 110 - Dec. 911/96 Art. 182',
                        'metodo_verificacion' => 'Inspección visual y funcional en pañol y puestos',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                    [
                        'titulo' => 'Herramientas eléctricas portátiles con doble aislamiento o puesta a tierra y cables sin empalmes precarios',
                        'referencia_normativa' => 'Dec. 351/79 Anexo VI Art. 3.1.2',
                        'metodo_verificacion' => 'Verificación física de cables, enchufes y carcasas',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'Dispositivos de protección en amoladoras (guarda protectora, bridas y llave de ajuste)',
                        'referencia_normativa' => 'Dec. 351/79 Art. 113',
                        'metodo_verificacion' => 'Inspección visual directa de la guarda y disco',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                ]
            ],
            [
                'nombre' => 'Instalaciones eléctricas',
                'icono' => 'fa-bolt',
                'orden' => 2,
                'descripcion' => 'Tableros, disyuntores, puestas a tierra y canalizaciones eléctricas.',
                'items' => [
                    [
                        'titulo' => 'Tableros eléctricos cerrados con contratapa, llave y debidamente identificados con señal de riesgo eléctrico',
                        'referencia_normativa' => 'Dec. 351/79 Anexo VI Art. 3',
                        'metodo_verificacion' => 'Inspección visual de tableros seccionales y principales',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'Presencia y funcionamiento de interruptores termomagnéticos y disyuntores diferenciales',
                        'referencia_normativa' => 'Norma IRAM 2071 - Dec. 351/79 Anexo VI',
                        'metodo_verificacion' => 'Prueba de botón de test y registro de mediciones',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'Protocolo y medición periódica de puesta a tierra y continuidad de masas vigente (SRT 900/15)',
                        'referencia_normativa' => 'Resolución SRT 900/15',
                        'metodo_verificacion' => 'Verificación documental de protocolo firmado por profesional con matrícula',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                ]
            ],
            [
                'nombre' => 'Vehículos y autoelevadores',
                'icono' => 'fa-truck-pickup',
                'orden' => 3,
                'descripcion' => 'Mantenimiento preventivo, alarmas de retroceso y habilitaciones de conductores.',
                'items' => [
                    [
                        'titulo' => 'Autoelevadores equipados con alarma sonora de retroceso, destellador luminoso y cinturón de seguridad inercial',
                        'referencia_normativa' => 'Resolución SRT 960/15 Art. 3',
                        'metodo_verificacion' => 'Prueba funcional en marcha',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'Operadores de autoelevadores y maquinaria pesada con credencial habilitante vigente (SRT 960/15)',
                        'referencia_normativa' => 'Resolución SRT 960/15 Art. 10',
                        'metodo_verificacion' => 'Control de legajos y credenciales de conductores',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                    [
                        'titulo' => 'Registro diario de checklist pre-operacional por parte del conductor antes del inicio del turno',
                        'referencia_normativa' => 'Resolución SRT 960/15 Anexo I',
                        'metodo_verificacion' => 'Auditoría de planillas de chequeo diario',
                        'nivel_riesgo_defecto' => 'Bajo',
                    ],
                ]
            ],
            [
                'nombre' => 'Procedimientos de trabajo seguro (PTS)',
                'icono' => 'fa-file-signature',
                'orden' => 4,
                'descripcion' => 'Instrucciones escritas, permisos de trabajo de alto riesgo y análisis de tareas.',
                'items' => [
                    [
                        'titulo' => 'Existencia de Procedimientos de Trabajo Seguro (PTS) documentados y comunicados para tareas críticas',
                        'referencia_normativa' => 'Ley 19.587 Art. 9 - Dec. 351/79 Art. 208',
                        'metodo_verificacion' => 'Revisión de carpetas de procedimientos y entrevistas a operarios',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                    [
                        'titulo' => 'Sistema de Permisos de Trabajo Seguro (PT) para trabajos en caliente, espacios confinados y altura',
                        'referencia_normativa' => 'Dec. 911/96 Art. 54 y 55',
                        'metodo_verificacion' => 'Constatación de permisos firmados en el puesto de trabajo',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                ]
            ],
            [
                'nombre' => 'Equipos de Protección Personal (EPP)',
                'icono' => 'fa-hard-hat',
                'orden' => 5,
                'descripcion' => 'Suministro, uso efectivo, certificación y registro de entrega de EPP.',
                'items' => [
                    [
                        'titulo' => 'Uso obligatorio y adecuado de EPP básicos (casco con barbijo, calzado de seguridad con puntera, protección ocular)',
                        'referencia_normativa' => 'Dec. 351/79 Cap. 19 Art. 188 - 194',
                        'metodo_verificacion' => 'Observación directa de operarios en planta',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'EPP certificados con sello IRAM o marca de conformidad correspondiente',
                        'referencia_normativa' => 'Resolución SRT 896/99',
                        'metodo_verificacion' => 'Inspección de etiquetas y certificados de calidad de insumos',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                    [
                        'titulo' => 'Planilla oficial de entrega de EPP firmada por los trabajadores (Resolución SRT 299/11)',
                        'referencia_normativa' => 'Resolución SRT 299/11',
                        'metodo_verificacion' => 'Auditoría de constancias de entrega archivadas',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                ]
            ],
            [
                'nombre' => 'Señalización y cartelería',
                'icono' => 'fa-exclamation-triangle',
                'orden' => 6,
                'descripcion' => 'Cartelería de advertencia, prohibición, obligación y vías de circulación.',
                'items' => [
                    [
                        'titulo' => 'Demarcación de sendas peatonales y vías de circulación vehicular en pisos de naves y depósitos',
                        'referencia_normativa' => 'Norma IRAM 10005 - Dec. 351/79 Cap. 12',
                        'metodo_verificacion' => 'Inspección visual de líneas perimetrales amarillas/blancas',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                    [
                        'titulo' => 'Cartelería de advertencia de riesgos y obligatoriedad de uso de EPP visible en los accesos',
                        'referencia_normativa' => 'Norma IRAM 10005 Parte I y II',
                        'metodo_verificacion' => 'Recorrido visual en accesos y puestos clave',
                        'nivel_riesgo_defecto' => 'Bajo',
                    ],
                ]
            ],
            [
                'nombre' => 'Emergencias y evacuación',
                'icono' => 'fa-fire-extinguisher',
                'orden' => 7,
                'descripcion' => 'Matafuegos, salidas de emergencia, iluminación de emergencia y planos de evacuación.',
                'items' => [
                    [
                        'titulo' => 'Extintores con carga vigente, tarjeta de mantenimiento IRAM 3517-2, manómetro en rango verde y acceso despejado',
                        'referencia_normativa' => 'Norma IRAM 3517-2 - Dec. 351/79 Cap. 18 Art. 176',
                        'metodo_verificacion' => 'Revisión visual de tarjetas, manómetros y libre acceso a cada extintor',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'Salidas y vías de evacuación señalizadas, libres de obstáculos y con apertura hacia afuera sin llave',
                        'referencia_normativa' => 'Dec. 351/79 Art. 172',
                        'metodo_verificacion' => 'Recorrido de trayectorias de escape y prueba de puertas antipánico',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'Luces de emergencia autónomas operativas en pasillos, salidas y sectores sin luz natural',
                        'referencia_normativa' => 'Dec. 351/79 Art. 78',
                        'metodo_verificacion' => 'Corte selectivo o pulsador de prueba de luminarias',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                ]
            ],
            [
                'nombre' => 'Almacenamiento y estibaje',
                'icono' => 'fa-boxes',
                'orden' => 8,
                'descripcion' => 'Racks de carga, alturas de estiba, orden y limpieza.',
                'items' => [
                    [
                        'titulo' => 'Racks y estanterías con indicación de carga máxima admisible y sin deformaciones estructurales',
                        'referencia_normativa' => 'Dec. 351/79 Art. 42 - 45',
                        'metodo_verificacion' => 'Inspección de carteles de carga y verticalidad de largueros',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'Estiba de mercaderías trabada, respetando pasillos de tránsito y distancias a rociadores/luminarias',
                        'referencia_normativa' => 'Dec. 351/79 Art. 43',
                        'metodo_verificacion' => 'Inspección ocular en depósitos',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                ]
            ],
            [
                'nombre' => 'Sustancias químicas y residuos peligrosos',
                'icono' => 'fa-flask',
                'orden' => 9,
                'descripcion' => 'Hojas de datos de seguridad (FDS), contención de derrames y rotulación SGA.',
                'items' => [
                    [
                        'titulo' => 'Productos químicos rotulados según Sistema Globalmente Armonizado (SGA / GHS) con pictogramas de peligro',
                        'referencia_normativa' => 'Resolución SRT 801/15',
                        'metodo_verificacion' => 'Inspección de envases en uso y almacenamiento',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'Fichas de Datos de Seguridad (FDS / MSDS en español) disponibles y accesibles para los trabajadores',
                        'referencia_normativa' => 'Resolución SRT 801/15 Art. 3',
                        'metodo_verificacion' => 'Constatación de carpetas de FDS en el sector de manipulación',
                        'nivel_riesgo_defecto' => 'Medio',
                    ],
                    [
                        'titulo' => 'Bandejas o cubas de retención secundaria para prevención de derrames de líquidos peligrosos',
                        'referencia_normativa' => 'Ley 24.051 Art. 33 - Dec. 351/79 Art. 145',
                        'metodo_verificacion' => 'Inspección de capacidades de bateas y kits antiderrame',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                ]
            ],
            [
                'nombre' => 'Maquinaria y equipos industriales',
                'icono' => 'fa-cogs',
                'orden' => 10,
                'descripcion' => 'Protecciones fijas y móviles, paradas de emergencia y bloqueo LOTO.',
                'items' => [
                    [
                        'titulo' => 'Órganos móviles de transmisión (correas, engranajes, poleas) resguardados con protecciones fijas seguras',
                        'referencia_normativa' => 'Dec. 351/79 Cap. 15 Art. 103 - 109',
                        'metodo_verificacion' => 'Inspección visual de cercas y enrejados en máquinas',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                    [
                        'titulo' => 'Pulsadores de parada de emergencia tipo golpe de puño (seta) funcionales y accesibles en puestos de mando',
                        'referencia_normativa' => 'Dec. 351/79 Art. 108',
                        'metodo_verificacion' => 'Prueba funcional coordinada de paradas de emergencia',
                        'nivel_riesgo_defecto' => 'Alto',
                    ],
                ]
            ],
        ];

        foreach ($categorias as $catData) {
            $items = $catData['items'];
            unset($catData['items']);

            $categoria = CategoriaChecklist::create($catData);

            foreach ($items as $itemData) {
                $itemData['categoria_id'] = $categoria->id;
                ItemChecklist::create($itemData);
            }
        }
    }
}