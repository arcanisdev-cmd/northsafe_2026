<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HazardReportController;
use Illuminate\Support\Facades\Route;

Route::post('/signup', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth.token')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/reports', [HazardReportController::class, 'index']);
    Route::get('/reports/mine', [HazardReportController::class, 'mine']);
    Route::post('/reports', [HazardReportController::class, 'store']);
});