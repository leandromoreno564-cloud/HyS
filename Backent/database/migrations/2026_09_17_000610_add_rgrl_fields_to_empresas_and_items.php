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
        Schema::table('empresas', function (Blueprint $table) {
            if (!Schema::hasColumn('empresas', 'numero_contrato')) {
                $table->string('numero_contrato', 50)->nullable()->after('cuit')->comment('Nº Contrato Afiliación ART');
            }
            if (!Schema::hasColumn('empresas', 'numero_establecimiento')) {
                $table->string('numero_establecimiento', 50)->nullable()->after('numero_contrato')->comment('Nº Establecimiento SRT');
            }
            if (!Schema::hasColumn('empresas', 'art_nombre')) {
                $table->string('art_nombre', 100)->nullable()->after('numero_establecimiento')->comment('Aseguradora de Riesgos del Trabajo');
            }
            if (!Schema::hasColumn('empresas', 'superficie_m2')) {
                $table->decimal('superficie_m2', 10, 2)->nullable()->after('cantidad_empleados');
            }
        });

        Schema::table('inspecciones', function (Blueprint $table) {
            if (!Schema::hasColumn('inspecciones', 'formulario_tipo')) {
                $table->string('formulario_tipo', 100)->default('Formulario A - Res. 463/09 (Dec. 351/79)')->after('tipo');
            }
            if (!Schema::hasColumn('inspecciones', 'proxima_inspeccion_sugerida')) {
                $table->date('proxima_inspeccion_sugerida')->nullable()->after('fecha_fin')->comment('Aviso para inspección anual');
            }
        });

        Schema::table('items_inspeccion', function (Blueprint $table) {
            if (!Schema::hasColumn('items_inspeccion', 'numero_pregunta')) {
                $table->integer('numero_pregunta')->nullable()->after('item_checklist_id')->comment('Nº pregunta Formulario A (1 a 161)');
            }
            if (!Schema::hasColumn('items_inspeccion', 'fecha_regularizacion')) {
                $table->date('fecha_regularizacion')->nullable()->after('observacion')->comment('Fecha límite de regularización si NO cumple');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn(['numero_contrato', 'numero_establecimiento', 'art_nombre', 'superficie_m2']);
        });

        Schema::table('inspecciones', function (Blueprint $table) {
            $table->dropColumn(['formulario_tipo', 'proxima_inspeccion_sugerida']);
        });

        Schema::table('items_inspeccion', function (Blueprint $table) {
            $table->dropColumn(['numero_pregunta', 'fecha_regularizacion']);
        });
    }
};
