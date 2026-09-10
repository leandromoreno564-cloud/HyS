<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChecklistController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CorrectiveMeasureController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ObservationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Redirección inicial
Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

// Autenticación pública
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Registro público de Licenciados (queda inactivo hasta que el admin lo apruebe)
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.post');

// Verificación pública de autenticidad por código QR
Route::get('/verify/{token}', [ReportController::class, 'verifyQr'])->name('reports.verify');

// Rutas protegidas (Usuario autenticado y activo)
Route::middleware(['auth', 'active'])->group(function () {
    // Panel de control
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Perfil de usuario
    Route::get('/profile', [AuthController::class, 'profile'])->name('profile');
    Route::post('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');

    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // Gestión de Empresas
    Route::resource('companies', CompanyController::class);

    // Módulo de Inspecciones
    Route::resource('inspections', InspectionController::class);
    Route::post('/inspections/{inspection}/status', [InspectionController::class, 'updateStatus'])->name('inspections.status');
    Route::post('/inspections/{inspection}/sign', [InspectionController::class, 'sign'])->name('inspections.sign');

    // Checklists interactivos
    Route::post('/inspections/{inspection}/checklist/{item}', [ChecklistController::class, 'updateItem'])->name('inspections.checklist.update');
    Route::post('/inspections/{inspection}/checklist-custom', [ChecklistController::class, 'addItem'])->name('inspections.checklist.custom');
    Route::delete('/inspections/{inspection}/checklist/{item}', [ChecklistController::class, 'destroyItem'])->name('inspections.checklist.destroy');

    // Observaciones en campo
    Route::post('/inspections/{inspection}/observations', [ObservationController::class, 'store'])->name('observations.store');
    Route::delete('/observations/{observation}', [ObservationController::class, 'destroy'])->name('observations.destroy');

    // Medidas Correctivas
    Route::get('/corrective-measures', [CorrectiveMeasureController::class, 'index'])->name('corrective-measures.index');
    Route::post('/inspections/{inspection}/measures', [CorrectiveMeasureController::class, 'store'])->name('corrective-measures.store');
    Route::post('/corrective-measures/{measure}/status', [CorrectiveMeasureController::class, 'updateStatus'])->name('corrective-measures.status');
    Route::delete('/corrective-measures/{measure}', [CorrectiveMeasureController::class, 'destroy'])->name('corrective-measures.destroy');

    // Informes y Reportes
    Route::get('/inspections/{inspection}/pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
    Route::get('/reports/export-csv', [ReportController::class, 'exportCsv'])->name('reports.csv');

    // Rutas exclusivas para Administradores
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class);
        Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('/companies/{id}/restore', [CompanyController::class, 'restore'])->name('companies.restore');
        Route::post('/companies/{company}/assign', [CompanyController::class, 'assignInspectors'])->name('companies.assign');
    });
});
