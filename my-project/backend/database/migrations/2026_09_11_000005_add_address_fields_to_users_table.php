<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('house_number')->nullable()->after('barangay');
            $table->string('street')->nullable()->after('house_number');
            $table->string('zip_code', 20)->nullable()->after('street');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['house_number', 'street', 'zip_code']);
        });
    }
};