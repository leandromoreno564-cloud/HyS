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
        // 1. Vistas de compatibilidad (Español <-> Inglés)
        DB::statement('CREATE OR REPLACE VIEW users AS SELECT * FROM usuarios');
        DB::statement('CREATE OR REPLACE VIEW companies AS SELECT * FROM empresas');
        DB::statement('CREATE OR REPLACE VIEW inspections AS SELECT * FROM inspecciones');
        DB::statement('CREATE OR REPLACE VIEW observations AS SELECT * FROM observacions');
        DB::statement('CREATE OR REPLACE VIEW corrective_measures AS SELECT * FROM medida_correctivas');
        DB::statement('CREATE OR REPLACE VIEW checklist_categories AS SELECT * FROM categoria_checklists');
        DB::statement('CREATE OR REPLACE VIEW checklist_items AS SELECT * FROM items_checklist');
        DB::statement('CREATE OR REPLACE VIEW inspection_checklist_items AS SELECT * FROM items_inspeccion');
        DB::statement('CREATE OR REPLACE VIEW company_user AS SELECT empresa_id AS company_id, usuario_id AS user_id, created_at, updated_at FROM empresa_usuario');

        // 2. Columnas virtuales para compatibilidad transparente de queries
        $this->addVirtualColumnIfNotExists('inspecciones', 'status', 'VARCHAR(50)', 'estado');
        $this->addVirtualColumnIfNotExists('inspecciones', 'user_id', 'BIGINT UNSIGNED', 'inspector_id');
        $this->addVirtualColumnIfNotExists('inspecciones', 'company_id', 'BIGINT UNSIGNED', 'empresa_id');
        $this->addVirtualColumnIfNotExists('inspecciones', 'inspection_date', 'DATETIME', 'fecha_inicio');
        $this->addVirtualColumnIfNotExists('inspecciones', 'progress_percentage', 'INT', 'porcentaje_avance');

        $this->addVirtualColumnIfNotExists('medida_correctivas', 'status', 'VARCHAR(50)', 'estado');
        $this->addVirtualColumnIfNotExists('medida_correctivas', 'priority', 'VARCHAR(50)', 'prioridad');
        $this->addVirtualColumnIfNotExists('medida_correctivas', 'deadline', 'DATE', 'fecha_limite');
        $this->addVirtualColumnIfNotExists('medida_correctivas', 'inspection_id', 'BIGINT UNSIGNED', 'inspeccion_id');

        $this->addVirtualColumnIfNotExists('empresas', 'business_name', 'VARCHAR(255)', 'razon_social');
        $this->addVirtualColumnIfNotExists('empresas', 'tax_id', 'VARCHAR(50)', 'cuit');
        $this->addVirtualColumnIfNotExists('empresas', 'address', 'VARCHAR(255)', 'direccion');
        $this->addVirtualColumnIfNotExists('empresas', 'phone', 'VARCHAR(50)', 'telefono');
        $this->addVirtualColumnIfNotExists('empresas', 'email', 'VARCHAR(255)', 'email_contacto');
        $this->addVirtualColumnIfNotExists('empresas', 'industry_sector', 'VARCHAR(100)', 'sector');
        $this->addVirtualColumnIfNotExists('empresas', 'employee_count', 'INT', 'cantidad_empleados');
        $this->addVirtualColumnIfNotExists('empresas', 'contact_person', 'VARCHAR(255)', 'persona_contacto');
        $this->addVirtualColumnIfNotExists('empresas', 'is_active', 'TINYINT(1)', 'activa');

        $this->addVirtualColumnIfNotExists('observacions', 'inspection_id', 'BIGINT UNSIGNED', 'inspeccion_id');
        $this->addVirtualColumnIfNotExists('observacions', 'severity', 'VARCHAR(50)', 'severidad');

        $this->addVirtualColumnIfNotExists('items_inspeccion', 'status', 'VARCHAR(50)', 'estado');
        $this->addVirtualColumnIfNotExists('items_inspeccion', 'inspection_id', 'BIGINT UNSIGNED', 'inspeccion_id');

        $this->addVirtualColumnIfNotExists('usuarios', 'name', 'VARCHAR(255)', 'nombre');
        $this->addVirtualColumnIfNotExists('usuarios', 'phone', 'VARCHAR(50)', 'telefono');
        $this->addVirtualColumnIfNotExists('usuarios', 'license_number', 'VARCHAR(100)', 'matricula');
        $this->addVirtualColumnIfNotExists('usuarios', 'is_active', 'TINYINT(1)', 'activo');
    }

    protected function addVirtualColumnIfNotExists(string $table, string $column, string $type, string $sourceColumn): void
    {
        $exists = Schema::hasColumn($table, $column);
        if (!$exists) {
            DB::statement("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$type} GENERATED ALWAYS AS (`{$sourceColumn}`) VIRTUAL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS users');
        DB::statement('DROP VIEW IF EXISTS companies');
        DB::statement('DROP VIEW IF EXISTS inspections');
        DB::statement('DROP VIEW IF EXISTS observations');
        DB::statement('DROP VIEW IF EXISTS corrective_measures');
        DB::statement('DROP VIEW IF EXISTS checklist_categories');
        DB::statement('DROP VIEW IF EXISTS checklist_items');
        DB::statement('DROP VIEW IF EXISTS inspection_checklist_items');
        DB::statement('DROP VIEW IF EXISTS company_user');
    }
};
