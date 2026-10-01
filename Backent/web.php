<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyChecklistController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CorrectiveMeasureController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
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
    Route::post('/companies/extract-pdf', [CompanyController::class, 'extractPdf'])->name('companies.extract-pdf');
    Route::resource('companies', CompanyController::class);

    // Relevamiento / Checklist por Empresa
    Route::get('/companies/{company}/checklist', [CompanyChecklistController::class, 'index'])->name('companies.checklist.index');
    Route::post('/companies/{company}/checklist/extract', [CompanyChecklistController::class, 'extract'])->name('companies.checklist.extract');
    Route::post('/companies/{company}/checklist', [CompanyChecklistController::class, 'store'])->name('companies.checklist.store');
    Route::get('/companies/{company}/checklist/pdf', [CompanyChecklistController::class, 'downloadPdf'])->name('companies.checklist.pdf');
    Route::post('/companies/{company}/checklist/items', [CompanyChecklistController::class, 'storeItem'])->name('companies.checklist.items.store');
    Route::patch('/companies/{company}/checklist/category', [CompanyChecklistController::class, 'renameCategory'])->name('companies.checklist.category');
    Route::delete('/checklist-items/{item}', [CompanyChecklistController::class, 'destroyItem'])->name('checklist-items.destroy');
    Route::patch('/checklist-items/{item}', [CompanyChecklistController::class, 'updateItem'])->name('checklist-items.update');
    Route::post('/checklist-items/{item}/photo', [CompanyChecklistController::class, 'uploadPhoto'])->name('checklist-items.photo.upload');
    Route::delete('/checklist-items/{item}/photo', [CompanyChecklistController::class, 'deletePhoto'])->name('checklist-items.photo.delete');

    // Medidas Correctivas
    Route::get('/corrective-measures', [CorrectiveMeasureController::class, 'index'])->name('corrective-measures.index');
    Route::post('/corrective-measures/{measure}/status', [CorrectiveMeasureController::class, 'updateStatus'])->name('corrective-measures.status');
    Route::delete('/corrective-measures/{measure}', [CorrectiveMeasureController::class, 'destroy'])->name('corrective-measures.destroy');

    // Informes y Reportes
    Route::get('/reports/export-csv', [ReportController::class, 'exportCsv'])->name('reports.csv');

    // Rutas exclusivas para Administradores
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class);
        Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('/companies/{id}/restore', [CompanyController::class, 'restore'])->name('companies.restore');
        Route::post('/companies/{company}/assign', [CompanyController::class, 'assignInspectors'])->name('companies.assign');
    });
});
