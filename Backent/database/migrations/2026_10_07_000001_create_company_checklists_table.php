<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name')->nullable();
            $table->date('surveyed_at');
            $table->timestamps();
            $table->index(['company_id', 'surveyed_at']);
        });

        Schema::table('company_checklist_items', function (Blueprint $table) {
            $table->foreignId('company_checklist_id')->nullable()->after('company_id')
                ->constrained('company_checklists')->cascadeOnDelete();
            $table->index(['company_checklist_id', 'item_number']);
        });

        // Conserva los relevamientos ya existentes como el primer historial de cada empresa.
        DB::table('company_checklist_items')
            ->select('company_id', DB::raw('MIN(created_at) as created_at'))
            ->groupBy('company_id')
            ->get()
            ->each(function ($group) {
                $id = DB::table('company_checklists')->insertGetId([
                    'company_id' => $group->company_id,
                    'name' => 'Relevamiento histórico',
                    'surveyed_at' => substr($group->created_at, 0, 10),
                    'created_at' => $group->created_at,
                    'updated_at' => $group->created_at,
                ]);

                DB::table('company_checklist_items')
                    ->where('company_id', $group->company_id)
                    ->update(['company_checklist_id' => $id]);
            });
    }

    public function down(): void
    {
        Schema::table('company_checklist_items', function (Blueprint $table) {
            $table->dropForeign(['company_checklist_id']);
            $table->dropIndex(['company_checklist_id', 'item_number']);
            $table->dropColumn('company_checklist_id');
        });
        Schema::dropIfExists('company_checklists');
    }
};
