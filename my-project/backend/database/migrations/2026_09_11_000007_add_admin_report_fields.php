<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hazard_reports', function (Blueprint $table): void {
            $table->boolean('is_pinned')->default(false)->after('status');
            $table->text('rejection_reason')->nullable()->after('is_pinned');
        });
    }

    public function down(): void
    {
        Schema::table('hazard_reports', function (Blueprint $table): void {
            $table->dropColumn(['is_pinned', 'rejection_reason']);
        });
    }
};