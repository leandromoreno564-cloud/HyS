<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\ChecklistCategory;
use App\Models\Company;
use App\Models\CorrectiveMeasure;
use App\Models\Inspection;
use App\Models\InspectionChecklistItem;
use App\Models\Observation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Usuarios del sistema
        $admin = User::create([
            'name' => 'Ing. Alejandro Morales',
            'email' => 'admin@seguridad.local',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+54 11 4455-6677',
            'license_number' => 'MAT-NAC-00192',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Administrador General',
            'email' => 'admin@hys.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'phone' => '+54 11 4455-6677',
            'license_number' => 'MAT-NAC-00192',
            'is_active' => true,
        ]);

        $inspector1 = User::create([
            'name' => 'Lic. Carlos Rossi',
            'email' => 'inspector@seguridad.local',
            'password' => Hash::make('password'),
            'role' => 'inspector',
            'phone' => '+54 11 5566-7788',
            'license_number' => 'LIC-HYS-8492',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Lic. Inspector Técnico',
            'email' => 'inspector@hys.com',
            'password' => Hash::make('inspector123'),
            'role' => 'inspector',
            'phone' => '+54 11 5566-7788',
            'license_number' => 'LIC-HYS-8492',
            'is_active' => true,
        ]);

        $inspector2 = User::create([
            'name' => 'Lic. María Fernández',
            'email' => 'maria@seguridad.local',
            'password' => Hash::make('password'),
            'role' => 'inspector',
            'phone' => '+54 11 6677-8899',
            'license_number' => 'LIC-HYS-3120',
            'is_active' => true,
        ]);

        // 2. Checklists técnicos normativos
        $this->call(ChecklistTemplateSeeder::class);

        // 3. Empresas clientes
        $empresa1 = Company::create([
            'business_name' => 'Siderúrgica del Plata S.A.',
            'tax_id' => '30-71234567-8',
            'address' => 'Av. Industrial 4500, Zárate, Buenos Aires',
            'phone' => '+54 11 4899-1000',
            'email' => 'contacto@siderurgicadelplata.com.ar',
            'industry_sector' => 'Metalmecánica',
            'employee_count' => 185,
            'website' => 'https://siderurgicadelplata.com.ar',
            'contact_person' => 'Ing. Roberto Gómez (Jefe de Planta)',
            'created_by' => $admin->id,
            'is_active' => true,
        ]);
        $empresa1->inspectors()->attach([$inspector1->id]);

        $empresa2 = Company::create([
            'business_name' => 'Constructora Horizontes S.R.L.',
            'tax_id' => '30-65432198-4',
            'address' => 'Ruta Panamericana Km 42, Pilar, Buenos Aires',
            'phone' => '+54 11 4780-3344',
            'email' => 'info@horizontesobras.com',
            'industry_sector' => 'Construcción',
            'employee_count' => 95,
            'website' => 'https://horizontesobras.com',
            'contact_person' => 'Arq. Martín Benítez (Director de Obra)',
            'created_by' => $inspector1->id,
            'is_active' => true,
        ]);
        $empresa2->inspectors()->attach([$inspector1->id, $inspector2->id]);

        $empresa3 = Company::create([
            'business_name' => 'Laboratorios BioQuim S.A.',
            'tax_id' => '30-88997766-2',
            'address' => 'Parque Industrial Burzaco, Lote 14, Buenos Aires',
            'phone' => '+54 11 4299-8800',
            'email' => 'hys@bioquimsa.com',
            'industry_sector' => 'Química y Farmacéutica',
            'employee_count' => 52,
            'website' => 'https://bioquimsa.com',
            'contact_person' => 'Dra. Silvina Castro (Responsable Calidad)',
            'created_by' => $admin->id,
            'is_active' => true,
        ]);
        $empresa3->inspectors()->attach([$inspector2->id]);

        $empresa4 = Company::create([
            'business_name' => 'Logística y Distribución Austral',
            'tax_id' => '30-55443322-1',
            'address' => 'Colectora Oeste 1240, Benavídez, Buenos Aires',
            'phone' => '+54 11 5032-4411',
            'email' => 'seguridad@logisticaaustral.com',
            'industry_sector' => 'Logística y Transporte',
            'employee_count' => 140,
            'website' => 'https://logisticaaustral.com',
            'contact_person' => 'Sr. Claudio Suárez (Gerente de Operaciones)',
            'created_by' => $inspector2->id,
            'is_active' => true,
        ]);
        $empresa4->inspectors()->attach([$inspector1->id]);

        // 4. Inspección 1: COMPLETADA con evaluación completa, observaciones y medidas
        $inspection1 = Inspection::create([
            'company_id' => $empresa1->id,
            'user_id' => $inspector1->id,
            'inspection_date' => Carbon::now()->subDays(5),
            'type' => 'General',
            'status' => 'Completada',
            'start_time' => '09:00',
            'end_time' => '13:30',
            'general_observations' => 'Auditoría integral semestral de condiciones de higiene y seguridad laboral. Se recorrió nave de conformado, pañol y sector de expedición.',
            'progress_percentage' => 100,
            'signature_inspector' => 'Lic. Carlos Rossi - Mat. 8492',
            'signature_company' => 'Ing. Roberto Gómez',
            'signature_company_name' => 'Roberto Gómez - Jefe de Planta',
            'token' => Str::uuid()->toString(),
        ]);

        // Generar items evaluados para la inspección 1
        $categories = ChecklistCategory::with('items')->get();
        $firstItemForObs = null;
        $secondItemForObs = null;

        foreach ($categories as $cat) {
            foreach ($cat->items as $idx => $tmplItem) {
                $status = 'Cumple';
                $notes = 'Condición satisfactoria verificado según protocolo.';

                if ($cat->name === 'Instalaciones eléctricas' && $idx === 0) {
                    $status = 'No Cumple';
                    $notes = 'Tablero secundario TS-03 sin cerradura y con cables de alimentación expuestos.';
                } elseif ($cat->name === 'Emergencias y evacuación' && $idx === 0) {
                    $status = 'No Cumple';
                    $notes = 'Extintor nº 14 tipo ABC con tarjeta vencida hace 30 días y obstruido por pallets.';
                } elseif ($cat->name === 'Vehículos y autoelevadores' && $idx === 2) {
                    $status = 'No Aplica';
                    $notes = 'El turno inspeccionado opera únicamente con transpaletas manuales.';
                }

                $evalItem = InspectionChecklistItem::create([
                    'inspection_id' => $inspection1->id,
                    'checklist_item_id' => $tmplItem->id,
                    'category_name' => $cat->name,
                    'title' => $tmplItem->title,
                    'normative_reference' => $tmplItem->normative_reference,
                    'verification_method' => $tmplItem->verification_method,
                    'status' => $status,
                    'risk_level' => $tmplItem->default_risk_level,
                    'notes' => $notes,
                    'is_custom' => false,
                ]);

                if ($status === 'No Cumple' && !$firstItemForObs) {
                    $firstItemForObs = $evalItem;
                } elseif ($status === 'No Cumple' && !$secondItemForObs) {
                    $secondItemForObs = $evalItem;
                }
            }
        }

        // Observaciones para inspección 1
        $obs1 = Observation::create([
            'inspection_id' => $inspection1->id,
            'inspection_checklist_item_id' => $firstItemForObs ? $firstItemForObs->id : null,
            'type' => 'Hallazgo',
            'severity' => 'Mayor',
            'location' => 'Nave 2 - Sector Taller de Mecanizado',
            'description' => 'El tablero seccional eléctrico TS-03 no cuenta con tapa cubrebornes de acrílico ni traba de seguridad en la puerta, existiendo riesgo inminente de contacto eléctrico directo accidental.',
            'photos' => null,
        ]);

        $obs2 = Observation::create([
            'inspection_id' => $inspection1->id,
            'inspection_checklist_item_id' => $secondItemForObs ? $secondItemForObs->id : null,
            'type' => 'Hallazgo',
            'severity' => 'Crítico',
            'location' => 'Depósito de Insumos - Portón Este',
            'description' => 'Matafuegos con carga expirada y tapado por mercadería en pallets, impidiendo el rápido accionamiento en caso de foco de incendio.',
            'photos' => null,
        ]);

        $obs3 = Observation::create([
            'inspection_id' => $inspection1->id,
            'inspection_checklist_item_id' => null,
            'type' => 'Buena práctica',
            'severity' => 'Menor',
            'location' => 'Línea de Ensamble Final',
            'description' => 'Excelente señalización horizontal y uso consistente de cascos y protectores auditivos de copa por todo el personal de línea.',
            'photos' => null,
        ]);

        // Medidas correctivas para inspección 1
        CorrectiveMeasure::create([
            'inspection_id' => $inspection1->id,
            'observation_id' => $obs1->id,
            'description' => 'Instalar contratapa aislante acrílica reglamentaria, colocar cerradura de seguridad y señalizar tablero TS-03 con advertencia de riesgo eléctrico.',
            'priority' => 'Alta',
            'recommendations' => 'Contratar electricista matriculado para el reemplazo inmediato de la protección de bornes.',
            'deadline' => Carbon::now()->addDays(7),
            'responsible_person' => 'Ing. Roberto Gómez / Dpto. Mantenimiento',
            'estimated_cost' => 150000.00,
            'status' => 'En Progreso',
            'notes' => 'Materiales solicitados al proveedor.',
        ]);

        CorrectiveMeasure::create([
            'inspection_id' => $inspection1->id,
            'observation_id' => $obs2->id,
            'description' => 'Realizar recarga y prueba hidráulica inmediata del extintor nº 14 y demarcar en el piso la zona de seguridad libre de obstáculos (1 m²).',
            'priority' => 'Crítica',
            'recommendations' => 'Reemplazar provisoriamente con extintor de reserva del pañol y despejar pasillo.',
            'deadline' => Carbon::now()->addDays(2),
            'responsible_person' => 'Sr. Jorge Valenzuela (Seguridad Patrimonial)',
            'estimated_cost' => 45000.00,
            'status' => 'Pendiente',
            'notes' => 'Urgente para cumplir Dec. 351/79 Art. 176.',
        ]);

        // 5. Inspección 2: EN PROGRESO (Para interactuar en la demo)
        $inspection2 = Inspection::create([
            'company_id' => $empresa2->id,
            'user_id' => $inspector1->id,
            'inspection_date' => Carbon::now(),
            'type' => 'Específica',
            'status' => 'En Progreso',
            'start_time' => '10:30',
            'end_time' => null,
            'general_observations' => 'Inspección técnica enfocada en trabajos en altura y uso de andamios en obra modular.',
            'progress_percentage' => 45,
            'token' => Str::uuid()->toString(),
        ]);

        // Generar items para inspección 2 (algunos evaluados, otros pendientes)
        foreach ($categories->take(5) as $cat) {
            foreach ($cat->items as $idx => $tmplItem) {
                $status = $idx === 0 ? 'Cumple' : 'Pendiente';
                InspectionChecklistItem::create([
                    'inspection_id' => $inspection2->id,
                    'checklist_item_id' => $tmplItem->id,
                    'category_name' => $cat->name,
                    'title' => $tmplItem->title,
                    'normative_reference' => $tmplItem->normative_reference,
                    'verification_method' => $tmplItem->verification_method,
                    'status' => $status,
                    'risk_level' => $tmplItem->default_risk_level,
                    'notes' => $status === 'Cumple' ? 'Verificado en campo.' : null,
                    'is_custom' => false,
                ]);
            }
        }
        $inspection2->calculateProgress();

        // 6. Notificaciones iniciales
        AppNotification::create([
            'user_id' => $inspector1->id,
            'title' => 'Medida correctiva de alta urgencia',
            'message' => 'La medida correctiva para el extintor de Siderúrgica del Plata tiene vencimiento en 2 días.',
            'type' => 'danger',
            'link' => '/inspections/' . $inspection1->id,
            'is_read' => false,
        ]);

        AppNotification::create([
            'user_id' => $admin->id,
            'title' => 'Nueva empresa registrada',
            'message' => 'El Lic. Carlos Rossi registró la empresa "Constructora Horizontes S.R.L."',
            'type' => 'info',
            'link' => '/companies/' . $empresa2->id,
            'is_read' => false,
        ]);
    }
}
