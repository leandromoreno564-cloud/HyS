<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Inspection;
use App\Models\User;
use App\Models\AppNotification;
use Database\Seeders\ChecklistTemplateSeeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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
        $response->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));
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
        $dashboardResponse->assertInertia(fn (Assert $page) => $page->component('Dashboard/Admin'));
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
        $dashboardResponse->assertInertia(fn (Assert $page) => $page->component('Dashboard/Inspector'));
    }

    public function test_inspector_cannot_access_user_management(): void
    {
        $inspector = User::where('role', 'inspector')->first();

        $response = $this->actingAs($inspector)->get('/users');
        $response->assertStatus(403);
    }

    public function test_inspector_can_view_all_companies_including_unassigned_ones(): void
    {
        // Las páginas de Inertia viven en el proyecto Frontend, fuera de Backent.
        config(['inertia.testing.ensure_pages_exist' => false]);

        $inspector = User::where('email', 'inspector@seguridad.local')->firstOrFail();
        $unassignedCompany = Company::where('business_name', 'Laboratorios BioQuim S.A.')->firstOrFail();

        $this->actingAs($inspector)
            ->get('/companies')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Companies/Index')
                ->where('companies.total', 4)
            );

        $this->actingAs($inspector)
            ->get("/companies/{$unassignedCompany->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Companies/Show')
                ->where('company.id', $unassignedCompany->id)
            );

        $this->actingAs($inspector)
            ->get("/companies/{$unassignedCompany->id}/edit")
            ->assertForbidden();
    }

    public function test_inspector_is_assigned_when_creating_a_company(): void
    {
        $inspector = User::where('email', 'inspector@seguridad.local')->firstOrFail();

        $this->actingAs($inspector)
            ->post('/companies', [
                'business_name' => 'Empresa creada por inspector S.A.',
                'tax_id' => '30-12345678-9',
                'industry_sector' => 'Servicios',
                'employee_count' => 12,
                'is_active' => true,
            ])
            ->assertRedirect();

        $company = Company::where('tax_id', '30-12345678-9')->firstOrFail();

        $this->assertDatabaseHas('company_user', [
            'company_id' => $company->id,
            'user_id' => $inspector->id,
        ]);
    }

    public function test_company_cannot_be_registered_with_an_existing_business_name(): void
    {
        $inspector = User::where('email', 'inspector@seguridad.local')->firstOrFail();
        $existingCompany = Company::firstOrFail();

        $this->actingAs($inspector)
            ->from('/companies/create')
            ->post('/companies', [
                'business_name' => $existingCompany->business_name,
                'tax_id' => '30-98765432-1',
                'industry_sector' => 'Servicios',
                'employee_count' => 12,
                'is_active' => true,
            ])
            ->assertRedirect('/companies/create')
            ->assertSessionHasErrors('business_name');

        $this->assertDatabaseMissing('companies', [
            'tax_id' => '30-98765432-1',
        ]);
    }

    public function test_inspector_can_request_assignment_for_an_existing_company(): void
    {
        $inspector = User::where('email', 'inspector@seguridad.local')->firstOrFail();
        $company = Company::where('business_name', 'Laboratorios BioQuim S.A.')->firstOrFail();
        $notificationCount = AppNotification::count();
        $adminCount = User::where('role', 'admin')->where('is_active', true)->count();

        $this->actingAs($inspector)
            ->post("/companies/{$company->id}/request-inspector")
            ->assertRedirect()
            ->assertSessionHas('success', 'Solicitud enviada a los administradores.');

        $this->assertDatabaseCount('app_notifications', $notificationCount + $adminCount);
        $this->assertDatabaseHas('app_notifications', [
            'user_id' => User::where('role', 'admin')->firstOrFail()->id,
            'title' => 'Solicitud de asignación de inspector',
            'message' => "{$inspector->name} solicita ser asignado como inspector de {$company->business_name}.",
            'link' => route('companies.edit', $company),
        ]);

        $this->actingAs($inspector)
            ->post("/companies/{$company->id}/request-inspector")
            ->assertRedirect()
            ->assertSessionHas('info', 'La solicitud ya fue enviada a los administradores.');

        $this->assertSame($notificationCount + $adminCount, AppNotification::count());
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
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Reports/Verify')
            ->has('inspection')
        );
    }
}
