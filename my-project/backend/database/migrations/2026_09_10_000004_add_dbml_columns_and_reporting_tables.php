<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role', 20)->default('user')->after('password_hash');
            $table->unsignedInteger('reward_points')->default(0)->after('role');
            $table->string('status', 20)->default('active')->after('reward_points');
            $table->string('password_hash')->nullable()->after('email');
        });

        Schema::create('hazard_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('barangay', 255);
            $table->string('hazard_type', 100);
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('location_name', 255);
            $table->string('ai_hazard_type', 100)->nullable();
            $table->string('ai_severity', 50)->nullable();
            $table->decimal('ai_confidence', 5, 4)->nullable();
            $table->string('severity', 50)->nullable();
            $table->boolean('severity_overridden')->default(false);
            $table->text('severity_override_reason')->nullable();
            $table->foreignId('severity_overridden_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 50)->default('pending');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('report_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('report_id')->constrained('hazard_reports')->cascadeOnDelete();
            $table->text('image_url');
            $table->timestamp('uploaded_at')->useCurrent();
        });

        Schema::create('ai_classifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('report_id')->constrained('hazard_reports')->cascadeOnDelete();
            $table->string('hazard_type', 100)->nullable();
            $table->string('severity', 50)->nullable();
            $table->decimal('confidence', 5, 4)->nullable();
            $table->string('model', 100)->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('comments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('report_id')->constrained('hazard_reports')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('comment');
            $table->timestamps();
        });

        Schema::create('report_votes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('report_id')->constrained('hazard_reports')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('vote_type', 20);
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['report_id', 'user_id']);
        });

        Schema::create('notifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('report_id')->nullable()->constrained('hazard_reports')->nullOnDelete();
            $table->string('type', 50);
            $table->string('title', 255);
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('reward_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('report_id')->nullable()->constrained('hazard_reports')->nullOnDelete();
            $table->integer('points');
            $table->string('transaction_type', 50);
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('reward_redemptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('points_used');
            $table->decimal('amount', 10, 2);
            $table->string('mobile_number', 30);
            $table->string('status', 50)->default('pending');
            $table->string('reference_number', 100)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
        });

        Schema::create('report_status_history', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('report_id')->constrained('hazard_reports')->cascadeOnDelete();
            $table->foreignId('changed_by')->constrained('users')->cascadeOnDelete();
            $table->string('old_status', 50)->nullable();
            $table->string('new_status', 50);
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('entity_type', 100)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('weather_data', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('report_id')->constrained('hazard_reports')->cascadeOnDelete();
            $table->decimal('temperature', 5, 2)->nullable();
            $table->string('weather_condition', 100)->nullable();
            $table->decimal('humidity', 5, 2)->nullable();
            $table->decimal('wind_speed', 6, 2)->nullable();
            $table->decimal('rainfall', 8, 2)->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weather_data');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('report_status_history');
        Schema::dropIfExists('reward_redemptions');
        Schema::dropIfExists('reward_transactions');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('report_votes');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('ai_classifications');
        Schema::dropIfExists('report_images');
        Schema::dropIfExists('hazard_reports');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['role', 'reward_points', 'status', 'password_hash']);
        });
    }
};