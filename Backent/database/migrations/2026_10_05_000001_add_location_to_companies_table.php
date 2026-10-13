<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable()->after('address');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->float('location_accuracy')->nullable()->after('longitude'); // precisión del GPS en metros
            $table->timestamp('location_captured_at')->nullable()->after('location_accuracy');
            $table->string('location_photo')->nullable()->after('location_captured_at');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'location_accuracy',
                'location_captured_at',
                'location_photo',
            ]);
        });
    }
};
