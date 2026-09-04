<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Empresas
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('business_name'); // Razón social
            $table->string('tax_id')->unique(); // CUIT/RUC
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('industry_sector'); // Sector industrial
            $table->integer('employee_count')->default(1);
            $table->string('website')->nullable();
            $table->string('contact_person')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Asignación de Inspectores a Empresas
        Schema::create('company_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['company_id', 'user_id']);
        });

        // 3. Categorías de Checklists Técnicos
        Schema::create('checklist_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->default('fa-clipboard-check');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 4. Plantillas de Items de Checklist
        Schema::create('checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('checklist_categories')->cascadeOnDelete();
            $table->string('title');
            $table->string('normative_reference')->nullable();
            $table->string('verification_method')->nullable();
            $table->string('industry_sector')->nullable(); // null = aplica a todos
            $table->string('inspection_type')->nullable(); // null = aplica a todos
            $table->string('default_risk_level')->default('Medio');
            $table->boolean('is_system')->default(true);
            $table->timestamps();
        });

        // 5. Inspecciones
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Licenciado responsable
            $table->date('inspection_date');
            $table->string('type')->default('General'); // General, Específica, Seguimiento
            $table->string('status')->default('Borrador'); // Borrador, En Progreso, Completada, Cancelada
            $table->string('start_time')->nullable();
            $table->string('end_time')->nullable();
            $table->text('general_observations')->nullable();
            $table->integer('progress_percentage')->default(0);
            $table->text('signature_inspector')->nullable();
            $table->text('signature_company')->nullable();
            $table->string('signature_company_name')->nullable();
            $table->string('token')->unique(); // Token único para validación QR
            $table->timestamps();
            $table->softDeletes();
        });

        // 6. Items Evaluados en la Inspección
        Schema::create('inspection_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained('inspections')->cascadeOnDelete();
            $table->foreignId('checklist_item_id')->nullable()->constrained('checklist_items')->nullOnDelete();
            $table->string('category_name');
            $table->string('title');
            $table->string('normative_reference')->nullable();
            $table->string('verification_method')->nullable();
            $table->string('status')->default('Pendiente'); // Cumple, No Cumple, No Aplica, Pendiente
            $table->string('risk_level')->default('Bajo'); // Bajo, Medio, Alto
            $table->text('notes')->nullable();
            $table->json('photos')->nullable();
            $table->boolean('is_custom')->default(false);
            $table->timestamps();
        });

        // 7. Observaciones Registradas
        Schema::create('observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained('inspections')->cascadeOnDelete();
            $table->foreignId('inspection_checklist_item_id')->nullable()->constrained('inspection_checklist_items')->nullOnDelete();
            $table->string('type')->default('Hallazgo'); // Hallazgo, Buena práctica, Mejora
            $table->string('severity')->default('Moderado'); // Menor, Moderado, Mayor, Crítico
            $table->string('location')->nullable();
            $table->text('description');
            $table->json('photos')->nullable();
            $table->timestamps();
        });

        // 8. Medidas Correctivas
        Schema::create('corrective_measures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained('inspections')->cascadeOnDelete();
            $table->foreignId('observation_id')->nullable()->constrained('observations')->nullOnDelete();
            $table->text('description');
            $table->string('priority')->default('Media'); // Baja, Media, Alta, Crítica
            $table->text('recommendations')->nullable();
            $table->date('deadline')->nullable();
            $table->string('responsible_person')->nullable();
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->string('status')->default('Pendiente'); // Pendiente, En Progreso, Completada, Vencida, Cancelada
            $table->date('verification_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 9. Notificaciones Internas
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('info'); // info, warning, danger, success
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
        Schema::dropIfExists('corrective_measures');
        Schema::dropIfExists('observations');
        Schema::dropIfExists('inspection_checklist_items');
        Schema::dropIfExists('inspections');
        Schema::dropIfExists('checklist_items');
        Schema::dropIfExists('checklist_categories');
        Schema::dropIfExists('company_user');
        Schema::dropIfExists('companies');
    }
};
