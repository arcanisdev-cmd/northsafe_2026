<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('first_name')->after('id');
            $table->string('middle_name')->after('first_name');
            $table->string('last_name')->after('middle_name');
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('barangay')->nullable()->after('phone');
            $table->string('company_website')->nullable()->after('barangay');
            $table->string('api_token_hash', 64)->nullable()->unique()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['api_token_hash']);
            $table->dropColumn([
                'first_name',
                'middle_name',
                'last_name',
                'phone',
                'barangay',
                'company_website',
                'api_token_hash',
            ]);
        });
    }
};