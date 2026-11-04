<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_checklist_items', function (Blueprint $table) {
            $table->date('regulation_date')->nullable()->after('description');
            $table->text('correction_notes')->nullable()->after('regulation_date');
            $table->string('review_status', 20)->nullable()->after('correction_notes'); // 'en_revision', 'revisado'
        });
    }

    public function down(): void
    {
        Schema::table('company_checklist_items', function (Blueprint $table) {
            $table->dropColumn(['regulation_date', 'correction_notes', 'review_status']);
        });
    }
};
