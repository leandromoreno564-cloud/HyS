<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\CategoriaChecklist;
use App\Models\Empresa;
use App\Models\Inspeccion;
use App\Models\ItemInspeccion;
use App\Models\MedidaCorrectiva;
use App\Models\Observacion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InspeccionSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Usuario::where('email', 'admin@seguridad.local')->first();
        $inspector1 = Usuario::where('email', 'inspector@seguridad.local')->first();
        $empresa1 = Empresa::where('razon_social', 'Siderúrgica del Plata S.A.')->first();
        $empresa2 = Empresa::where('razon_social', 'Constructora Horizontes S.R.L.')->first();

        // 1. Inspección 1: COMPLETADA
        $inspeccion1 = Inspeccion::create([
            'empresa_id' => $empresa1->id,
            'inspector_id' => $inspector1->id,
            'fecha_inicio' => Carbon::now()->subDays(5),
            'tipo' => 'General',
            'estado' => 'Completada',
            'start_time' => '09:00',
            'end_time' => '13:30',
            'observaciones_generales' => 'Auditoría integral semestral de condiciones de higiene y seguridad laboral. Se recorrió nave de conformado, pañol y sector de expedición.',
            'porcentaje_avance' => 100,
            'firma_inspector' => 'Lic. Carlos Rossi - Mat. 8492',
            'firma_empresa' => 'Ing. Roberto Gómez',
            'nombre_firmante_empresa' => 'Roberto Gómez - Jefe de Planta',
            'token' => Str::uuid()->toString(),
        ]);

        $categorias = CategoriaChecklist::with('items')->get();
        $primerItemObs = null;
        $segundoItemObs = null;

        foreach ($categorias as $cat) {
            foreach ($cat->items as $idx => $tmplItem) {
                $estado = 'Cumple';
                $notas = 'Condición satisfactoria verificada según protocolo.';

                if ($cat->nombre === 'Instalaciones eléctricas' && $idx === 0) {
                    $estado = 'No Cumple';
                    $notas = 'Tablero secundario TS-03 sin cerradura y con cables de alimentación expuestos.';
                } elseif ($cat->nombre === 'Emergencias y evacuación' && $idx === 0) {
                    $estado = 'No Cumple';
                    $notas = 'Extintor nº 14 tipo ABC con tarjeta vencida hace 30 días y obstruido por pallets.';
                } elseif ($cat->nombre === 'Vehículos y autoelevadores' && $idx === 2) {
                    $estado = 'No Aplica';
                    $notas = 'El turno inspeccionado opera únicamente con transpaletas manuales.';
                }

                $evalItem = ItemInspeccion::create([
                    'inspeccion_id' => $inspeccion1->id,
                    'item_checklist_id' => $tmplItem->id,
                    'categoria_nombre' => $cat->nombre,
                    'titulo' => $tmplItem->titulo,
                    'referencia_normativa' => $tmplItem->referencia_normativa,
                    'metodo_verificacion' => $tmplItem->metodo_verificacion,
                    'estado' => $estado,
                    'nivel_riesgo' => $tmplItem->nivel_riesgo_defecto,
                    'notas' => $notas,
                    'es_personalizado' => false,
                ]);

                if ($estado === 'No Cumple' && !$primerItemObs) {
                    $primerItemObs = $evalItem;
                } elseif ($estado === 'No Cumple' && !$segundoItemObs) {
                    $segundoItemObs = $evalItem;
                }
            }
        }

        // Observaciones para inspección 1
        $obs1 = Observacion::create([
            'inspeccion_id' => $inspeccion1->id,
            'item_inspeccion_id' => $primerItemObs ? $primerItemObs->id : null,
            'tipo' => 'Hallazgo',
            'severidad' => 'Mayor',
            'ubicacion' => 'Nave 2 - Sector Taller de Mecanizado',
            'descripcion' => 'El tablero seccional eléctrico TS-03 no cuenta con tapa cubrebornes de acrílico ni traba de seguridad en la puerta, existiendo riesgo inminente de contacto eléctrico directo accidental.',
            'fotos' => null,
        ]);

        $obs2 = Observacion::create([
            'inspeccion_id' => $inspeccion1->id,
            'item_inspeccion_id' => $segundoItemObs ? $segundoItemObs->id : null,
            'tipo' => 'Hallazgo',
            'severidad' => 'Crítico',
            'ubicacion' => 'Depósito de Insumos - Portón Este',
            'descripcion' => 'Matafuegos con carga expirada y tapado por mercadería en pallets, impidiendo el rápido accionamiento en caso de foco de incendio.',
            'fotos' => null,
        ]);

        Observacion::create([
            'inspeccion_id' => $inspeccion1->id,
            'item_inspeccion_id' => null,
            'tipo' => 'Buena práctica',
            'severidad' => 'Menor',
            'ubicacion' => 'Línea de Ensamble Final',
            'descripcion' => 'Excelente señalización horizontal y uso consistente de cascos y protectores auditivos de copa por todo el personal de línea.',
            'fotos' => null,
        ]);

        // Medidas correctivas para inspección 1
        MedidaCorrectiva::create([
            'inspeccion_id' => $inspeccion1->id,
            'observacion_id' => $obs1->id,
            'descripcion' => 'Instalar contratapa aislante acrílica reglamentaria, colocar cerradura de seguridad y señalizar tablero TS-03 con advertencia de riesgo eléctrico.',
            'prioridad' => 'Alta',
            'recomendaciones' => 'Contratar electricista matriculado para el reemplazo inmediato de la protección de bornes.',
            'fecha_limite' => Carbon::now()->addDays(7),
            'responsable' => 'Ing. Roberto Gómez / Dpto. Mantenimiento',
            'costo_estimado' => 150000.00,
            'estado' => 'En Progreso',
            'notas' => 'Materiales solicitados al proveedor.',
        ]);

        MedidaCorrectiva::create([
            'inspeccion_id' => $inspeccion1->id,
            'observacion_id' => $obs2->id,
            'descripcion' => 'Realizar recarga y prueba hidráulica inmediata del extintor nº 14 y demarcar en el piso la zona de seguridad libre de obstáculos (1 m²).',
            'prioridad' => 'Crítica',
            'recomendaciones' => 'Reemplazar provisoriamente con extintor de reserva del pañol y despejar pasillo.',
            'fecha_limite' => Carbon::now()->addDays(2),
            'responsable' => 'Sr. Jorge Valenzuela (Seguridad Patrimonial)',
            'costo_estimado' => 45000.00,
            'estado' => 'Pendiente',
            'notas' => 'Urgente para cumplir Dec. 351/79 Art. 176.',
        ]);

        // 2. Inspección 2: EN PROGRESO
        $inspeccion2 = Inspeccion::create([
            'empresa_id' => $empresa2->id,
            'inspector_id' => $inspector1->id,
            'fecha_inicio' => Carbon::now(),
            'tipo' => 'Específica',
            'estado' => 'En Progreso',
            'start_time' => '10:30',
            'end_time' => null,
            'observaciones_generales' => 'Inspección técnica enfocada en trabajos en altura y uso de andamios en obra modular.',
            'porcentaje_avance' => 45,
            'token' => Str::uuid()->toString(),
        ]);

        foreach ($categorias->take(5) as $cat) {
            foreach ($cat->items as $idx => $tmplItem) {
                $estado = $idx === 0 ? 'Cumple' : 'Pendiente';
                ItemInspeccion::create([
                    'inspeccion_id' => $inspeccion2->id,
                    'item_checklist_id' => $tmplItem->id,
                    'categoria_nombre' => $cat->nombre,
                    'titulo' => $tmplItem->titulo,
                    'referencia_normativa' => $tmplItem->referencia_normativa,
                    'metodo_verificacion' => $tmplItem->metodo_verificacion,
                    'estado' => $estado,
                    'nivel_riesgo' => $tmplItem->nivel_riesgo_defecto,
                    'notas' => $estado === 'Cumple' ? 'Verificado en campo.' : null,
                    'es_personalizado' => false,
                ]);
            }
        }
        $inspeccion2->calcularAvance();

        // Notificaciones iniciales
        AppNotification::create([
            'user_id' => $inspector1->id,
            'title' => 'Medida correctiva de alta urgencia',
            'message' => 'La medida correctiva para el extintor de Siderúrgica del Plata tiene vencimiento en 2 días.',
            'type' => 'danger',
            'link' => '/inspecciones/' . $inspeccion1->id,
            'is_read' => false,
        ]);

        AppNotification::create([
            'user_id' => $admin->id,
            'title' => 'Nueva empresa registrada',
            'message' => 'El Lic. Carlos Rossi registró la empresa "Constructora Horizontes S.R.L."',
            'type' => 'info',
            'link' => '/empresas/' . $empresa2->id,
            'is_read' => false,
        ]);
    }
}