<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HazardReportController;
use Illuminate\Support\Facades\Route;

Route::post('/signup', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/report-images/{path}', [HazardReportController::class, 'image'])
    ->where('path', '.*');
Route::get('/profile-images/{path}', [AuthController::class, 'profileImage'])
    ->where('path', '.*');

Route::middleware('auth.token')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/reports', [HazardReportController::class, 'index']);
    Route::get('/reports/mine', [HazardReportController::class, 'mine']);
    Route::post('/reports', [HazardReportController::class, 'store']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/analytics', [HazardReportController::class, 'adminAnalytics']);
        Route::get('/reports', [HazardReportController::class, 'adminReports']);
        Route::put('/hazards/{report}', [HazardReportController::class, 'updateAdminReport']);
    });
});