<?php

namespace Database\Seeders;

use App\Models\ChecklistCategory;
use App\Models\ChecklistItem;
use Illuminate\Database\Seeder;

class ChecklistTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Herramientas manuales y portátiles',
                'icon' => 'fa-tools',
                'order' => 1,
                'description' => 'Inspección del estado de conservación, aislamientos y uso seguro de herramientas.',
                'items' => [
                    [
                        'title' => 'Herramientas de mano en buen estado de conservación (sin rebabas, mangos fisurados o astillados)',
                        'normative_reference' => 'Dec. 351/79 Art. 110 - Dec. 911/96 Art. 182',
                        'verification_method' => 'Inspección visual y funcional en pañol y puestos',
                        'default_risk_level' => 'Medio',
                    ],
                    [
                        'title' => 'Herramientas eléctricas portátiles con doble aislamiento o puesta a tierra y cables sin empalmes precarios',
                        'normative_reference' => 'Dec. 351/79 Anexo VI Art. 3.1.2',
                        'verification_method' => 'Verificación física de cables, enchufes y carcasas',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'Dispositivos de protección en amoladoras (guarda protectora, bridas y llave de ajuste)',
                        'normative_reference' => 'Dec. 351/79 Art. 113',
                        'verification_method' => 'Inspección visual directa de la guarda y disco',
                        'default_risk_level' => 'Alto',
                    ],
                ]
            ],
            [
                'name' => 'Instalaciones eléctricas',
                'icon' => 'fa-bolt',
                'order' => 2,
                'description' => 'Tableros, disyuntores, puestas a tierra y canalizaciones eléctricas.',
                'items' => [
                    [
                        'title' => 'Tableros eléctricos cerrados con contratapa, llave y debidamente identificados con señal de riesgo eléctrico',
                        'normative_reference' => 'Dec. 351/79 Anexo VI Art. 3',
                        'verification_method' => 'Inspección visual de tableros seccionales y principales',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'Presencia y funcionamiento de interruptores termomagnéticos y disyuntores diferenciales',
                        'normative_reference' => 'Norma IRAM 2071 - Dec. 351/79 Anexo VI',
                        'verification_method' => 'Prueba de botón de test y registro de mediciones',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'Protocolo y medición periódica de puesta a tierra y continuidad de masas vigente (SRT 900/15)',
                        'normative_reference' => 'Resolución SRT 900/15',
                        'verification_method' => 'Verificación documental de protocolo firmado por profesional con matrícula',
                        'default_risk_level' => 'Medio',
                    ],
                ]
            ],
            [
                'name' => 'Vehículos y autoelevadores',
                'icon' => 'fa-truck-pickup',
                'order' => 3,
                'description' => 'Mantenimiento preventivo, alarmas de retroceso y habilitaciones de conductores.',
                'items' => [
                    [
                        'title' => 'Autoelevadores equipados con alarma sonora de retroceso, destellador luminoso y cinturón de seguridad inercial',
                        'normative_reference' => 'Resolución SRT 960/15 Art. 3',
                        'verification_method' => 'Prueba funcional en marcha',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'Operadores de autoelevadores y maquinaria pesada con credencial habilitante vigente (SRT 960/15)',
                        'normative_reference' => 'Resolución SRT 960/15 Art. 10',
                        'verification_method' => 'Control de legajos y credenciales de conductores',
                        'default_risk_level' => 'Medio',
                    ],
                    [
                        'title' => 'Registro diario de checklist pre-operacional por parte del conductor antes del inicio del turno',
                        'normative_reference' => 'Resolución SRT 960/15 Anexo I',
                        'verification_method' => 'Auditoría de planillas de chequeo diario',
                        'default_risk_level' => 'Bajo',
                    ],
                ]
            ],
            [
                'name' => 'Procedimientos de trabajo seguro (PTS)',
                'icon' => 'fa-file-signature',
                'order' => 4,
                'description' => 'Instrucciones escritas, permisos de trabajo de alto riesgo y análisis de tareas.',
                'items' => [
                    [
                        'title' => 'Existencia de Procedimientos de Trabajo Seguro (PTS) documentados y comunicados para tareas críticas',
                        'normative_reference' => 'Ley 19.587 Art. 9 - Dec. 351/79 Art. 208',
                        'verification_method' => 'Revisión de carpetas de procedimientos y entrevistas a operarios',
                        'default_risk_level' => 'Medio',
                    ],
                    [
                        'title' => 'Sistema de Permisos de Trabajo Seguro (PT) para trabajos en caliente, espacios confinados y altura',
                        'normative_reference' => 'Dec. 911/96 Art. 54 y 55',
                        'verification_method' => 'Constatación de permisos firmados en el puesto de trabajo',
                        'default_risk_level' => 'Alto',
                    ],
                ]
            ],
            [
                'name' => 'Equipos de Protección Personal (EPP)',
                'icon' => 'fa-hard-hat',
                'order' => 5,
                'description' => 'Suministro, uso efectivo, certificación y registro de entrega de EPP.',
                'items' => [
                    [
                        'title' => 'Uso obligatorio y adecuado de EPP básicos (casco con barbijo, calzado de seguridad con puntera, protección ocular)',
                        'normative_reference' => 'Dec. 351/79 Cap. 19 Art. 188 - 194',
                        'verification_method' => 'Observación directa de operarios en planta',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'EPP certificados con sello IRAM o marca de conformidad correspondiente',
                        'normative_reference' => 'Resolución SRT 896/99',
                        'verification_method' => 'Inspección de etiquetas y certificados de calidad de insumos',
                        'default_risk_level' => 'Medio',
                    ],
                    [
                        'title' => 'Planilla oficial de entrega de EPP firmada por los trabajadores (Resolución SRT 299/11)',
                        'normative_reference' => 'Resolución SRT 299/11',
                        'verification_method' => 'Auditoría de constancias de entrega archivadas',
                        'default_risk_level' => 'Medio',
                    ],
                ]
            ],
            [
                'name' => 'Señalización y cartelería',
                'icon' => 'fa-exclamation-triangle',
                'order' => 6,
                'description' => 'Cartelería de advertencia, prohibición, obligación y vías de circulación.',
                'items' => [
                    [
                        'title' => 'Demarcación de sendas peatonales y vías de circulación vehicular en pisos de naves y depósitos',
                        'normative_reference' => 'Norma IRAM 10005 - Dec. 351/79 Cap. 12',
                        'verification_method' => 'Inspección visual de líneas perimetrales amarillas/blancas',
                        'default_risk_level' => 'Medio',
                    ],
                    [
                        'title' => 'Cartelería de advertencia de riesgos y obligatoriedad de uso de EPP visible en los accesos',
                        'normative_reference' => 'Norma IRAM 10005 Parte I y II',
                        'verification_method' => 'Recorrido visual en accesos y puestos clave',
                        'default_risk_level' => 'Bajo',
                    ],
                ]
            ],
            [
                'name' => 'Emergencias y evacuación',
                'icon' => 'fa-fire-extinguisher',
                'order' => 7,
                'description' => 'Matafuegos, salidas de emergencia, iluminación de emergencia y planos de evacuación.',
                'items' => [
                    [
                        'title' => 'Extintores con carga vigente, tarjeta de mantenimiento IRAM 3517-2, manómetro en rango verde y acceso despejado',
                        'normative_reference' => 'Norma IRAM 3517-2 - Dec. 351/79 Cap. 18 Art. 176',
                        'verification_method' => 'Revisión visual de tarjetas, manómetros y libre acceso a cada extintor',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'Salidas y vías de evacuación señalizadas, libres de obstáculos y con apertura hacia afuera sin llave',
                        'normative_reference' => 'Dec. 351/79 Art. 172',
                        'verification_method' => 'Recorrido de trayectorias de escape y prueba de puertas antipánico',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'Luces de emergencia autónomas operativas en pasillos, salidas y sectores sin luz natural',
                        'normative_reference' => 'Dec. 351/79 Art. 78',
                        'verification_method' => 'Corte selectivo o pulsador de prueba de luminarias',
                        'default_risk_level' => 'Medio',
                    ],
                ]
            ],
            [
                'name' => 'Almacenamiento y estibaje',
                'icon' => 'fa-boxes',
                'order' => 8,
                'description' => 'Racks de carga, alturas de estiba, orden y limpieza.',
                'items' => [
                    [
                        'title' => 'Racks y estanterías con indicación de carga máxima admisible y sin deformaciones estructurales',
                        'normative_reference' => 'Dec. 351/79 Art. 42 - 45',
                        'verification_method' => 'Inspección de carteles de carga y verticalidad de largueros',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'Estiba de mercaderías trabada, respetando pasillos de tránsito y distancias a rociadores/luminarias',
                        'normative_reference' => 'Dec. 351/79 Art. 43',
                        'verification_method' => 'Inspección ocular en depósitos',
                        'default_risk_level' => 'Medio',
                    ],
                ]
            ],
            [
                'name' => 'Sustancias químicas y residuos peligrosos',
                'icon' => 'fa-flask',
                'order' => 9,
                'description' => 'Hojas de datos de seguridad (FDS), contención de derrames y rotulación SGA.',
                'items' => [
                    [
                        'title' => 'Productos químicos rotulados según Sistema Globalmente Armonizado (SGA / GHS) con pictogramas de peligro',
                        'normative_reference' => 'Resolución SRT 801/15',
                        'verification_method' => 'Inspección de envases en uso y almacenamiento',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'Fichas de Datos de Seguridad (FDS / MSDS en español) disponibles y accesibles para los trabajadores',
                        'normative_reference' => 'Resolución SRT 801/15 Art. 3',
                        'verification_method' => 'Constatación de carpetas de FDS en el sector de manipulación',
                        'default_risk_level' => 'Medio',
                    ],
                    [
                        'title' => 'Bandejas o cubas de retención secundaria para prevención de derrames de líquidos peligrosos',
                        'normative_reference' => 'Ley 24.051 Art. 33 - Dec. 351/79 Art. 145',
                        'verification_method' => 'Inspección de capacidades de bateas y kits antiderrame',
                        'default_risk_level' => 'Alto',
                    ],
                ]
            ],
            [
                'name' => 'Maquinaria y equipos industriales',
                'icon' => 'fa-cogs',
                'order' => 10,
                'description' => 'Protecciones fijas y móviles, paradas de emergencia y bloqueo LOTO.',
                'items' => [
                    [
                        'title' => 'Órganos móviles de transmisión (correas, engranajes, poleas) resguardados con protecciones fijas seguras',
                        'normative_reference' => 'Dec. 351/79 Cap. 15 Art. 103 - 109',
                        'verification_method' => 'Inspección visual de cercas y enrejados en máquinas',
                        'default_risk_level' => 'Alto',
                    ],
                    [
                        'title' => 'Pulsadores de parada de emergencia tipo golpe de puño (seta) funcionales y accesibles en puestos de mando',
                        'normative_reference' => 'Dec. 351/79 Art. 108',
                        'verification_method' => 'Prueba funcional coordinada de paradas de emergencia',
                        'default_risk_level' => 'Alto',
                    ],
                ]
            ],
        ];

        foreach ($categories as $catData) {
            $items = $catData['items'];
            unset($catData['items']);

            $category = ChecklistCategory::create($catData);

            foreach ($items as $itemData) {
                $itemData['category_id'] = $category->id;
                ChecklistItem::create($itemData);
            }
        }
    }
}
