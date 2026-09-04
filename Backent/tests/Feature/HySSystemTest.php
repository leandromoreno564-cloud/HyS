<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Inspection;
use App\Models\User;
use Database\Seeders\ChecklistTemplateSeeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HySSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_login_page_renders_successfully(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
        $response->assertSee('HyS Control');
        $response->assertSee('admin@seguridad.local');
    }

    public function test_admin_can_login_and_access_dashboard(): void
    {
        $response = $this->post('/login', [
            'email' => 'admin@seguridad.local',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();

        $dashboardResponse = $this->get('/dashboard');
        $dashboardResponse->assertStatus(200);
        $dashboardResponse->assertSee('Panel de Control Global');
        $dashboardResponse->assertSee('Gestión de Usuarios');
    }

    public function test_inspector_can_login_and_see_inspector_dashboard(): void
    {
        $response = $this->post('/login', [
            'email' => 'inspector@seguridad.local',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();

        $dashboardResponse = $this->get('/dashboard');
        $dashboardResponse->assertStatus(200);
        $dashboardResponse->assertSee('Mis Inspecciones');
        $dashboardResponse->assertDontSee('Gestión de Usuarios');
    }

    public function test_inspector_cannot_access_user_management(): void
    {
        $inspector = User::where('role', 'inspector')->first();

        $response = $this->actingAs($inspector)->get('/users');
        $response->assertStatus(403);
    }

    public function test_inspection_creation_generates_checklist_automatically(): void
    {
        $inspector = User::where('role', 'inspector')->first();
        $company = Company::first();

        $response = $this->actingAs($inspector)->post('/inspections', [
            'company_id' => $company->id,
            'inspection_date' => now()->format('Y-m-d'),
            'type' => 'General',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'general_observations' => 'Auditoría de prueba automatizada',
        ]);

        $this->assertDatabaseHas('inspections', [
            'company_id' => $company->id,
            'user_id' => $inspector->id,
            'type' => 'General',
            'status' => 'En Progreso',
        ]);

        $createdInspection = Inspection::where('general_observations', 'Auditoría de prueba automatizada')->first();
        $this->assertNotNull($createdInspection);
        $this->assertGreaterThan(0, $createdInspection->checklistItems()->count());
    }

    public function test_inspection_pdf_report_is_generated(): void
    {
        $admin = User::where('role', 'admin')->first();
        $inspection = Inspection::first();

        $response = $this->actingAs($admin)->get("/inspections/{$inspection->id}/pdf");
        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_public_qr_verification_endpoint(): void
    {
        $inspection = Inspection::first();

        $response = $this->get("/verify/{$inspection->token}");
        $response->assertStatus(200);
        $response->assertSee('Certificado de Autenticidad');
        $response->assertSee($inspection->company->business_name);
    }
}
