<?php

use App\Http\Controllers\AppNotificationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaChecklistController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\EvidenciaController;
use App\Http\Controllers\InspeccionController;
use App\Http\Controllers\ItemChecklistController;
use App\Http\Controllers\ItemInspeccionController;
use App\Http\Controllers\MedidaCorrectivaController;
use App\Http\Controllers\ObservacionController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\VerificacionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas Públicas e Invitados
|--------------------------------------------------------------------------
*/

// Redirección inicial según estado de autenticación
Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

// Autenticación pública (protegida para no autenticados)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

// Verificación pública de autenticidad por código QR (sin requerir sesión)
Route::get('/verificar/{token}', VerificacionController::class)->name('verificar');

/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Requieren usuario autenticado)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // Cierre de sesión seguro
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Panel de Control Principal (Dashboard)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Perfil del Usuario
    Route::get('/perfil', [AuthController::class, 'profile'])->name('perfil');
    Route::post('/perfil', [AuthController::class, 'updateProfile'])->name('perfil.actualizar');

    // Centro de Notificaciones Internas
    Route::get('/notificaciones', [AppNotificationController::class, 'index'])->name('notificaciones.index');
    Route::post('/notificaciones/{notificacion}/marcar-leida', [AppNotificationController::class, 'marcarComoLeida'])->name('notificaciones.marcar-leida');
    Route::post('/notificaciones/marcar-todas-leidas', [AppNotificationController::class, 'marcarTodasComoLeidas'])->name('notificaciones.marcar-todas');

    // Gestión de Empresas
    Route::resource('empresas', EmpresaController::class);

    // Módulo General de Inspecciones
    Route::resource('inspecciones', InspeccionController::class);
    Route::post('/inspecciones/{inspeccion}/estado', [InspeccionController::class, 'actualizarEstado'])->name('inspecciones.estado');
    Route::post('/inspecciones/{inspeccion}/firmar', [InspeccionController::class, 'firmar'])->name('inspecciones.firmar');

    // Checklist e Ítems de Inspección en Terreno
    Route::post('/inspecciones/{inspeccion}/checklist/{item}', [ItemInspeccionController::class, 'actualizarItem'])->name('inspecciones.items.actualizar');
    Route::post('/inspecciones/{inspeccion}/checklist-custom', [ItemInspeccionController::class, 'agregarItem'])->name('inspecciones.items.agregar');
    Route::delete('/inspecciones/{inspeccion}/checklist/{item}', [ItemInspeccionController::class, 'eliminarItem'])->name('inspecciones.items.eliminar');

    // Registro de Observaciones y Hallazgos
    Route::post('/inspecciones/{inspeccion}/observaciones', [ObservacionController::class, 'store'])->name('observaciones.store');
    Route::delete('/observaciones/{observacion}', [ObservacionController::class, 'destroy'])->name('observaciones.destroy');

    // Carga y Eliminación de Evidencias Adjuntas
    Route::post('/evidencias', [EvidenciaController::class, 'store'])->name('evidencias.store');
    Route::delete('/evidencias/{evidencia}', [EvidenciaController::class, 'destroy'])->name('evidencias.destroy');

    // Gestión de Medidas Correctivas
    Route::get('/medidas-correctivas', [MedidaCorrectivaController::class, 'index'])->name('medidas-correctivas.index');
    Route::post('/inspecciones/{inspeccion}/medidas-correctivas', [MedidaCorrectivaController::class, 'store'])->name('medidas-correctivas.store');
    Route::post('/medidas-correctivas/{medida}/estado', [MedidaCorrectivaController::class, 'actualizarEstado'])->name('medidas-correctivas.estado');
    Route::delete('/medidas-correctivas/{medida}', [MedidaCorrectivaController::class, 'destroy'])->name('medidas-correctivas.destroy');

    // Exportación de Informes
    Route::get('/inspecciones/{inspeccion}/pdf', [ReporteController::class, 'exportarPdf'])->name('reportes.pdf');
    Route::get('/reportes/exportar-csv', [ReporteController::class, 'exportarCsv'])->name('reportes.csv');

    /*
    |--------------------------------------------------------------------------
    | Rutas Exclusivas para Administradores
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->group(function () {
        // Gestión de Usuarios y Roles
        Route::resource('usuarios', UsuarioController::class);
        Route::post('/usuarios/{usuario}/alternar-estado', [UsuarioController::class, 'alternarEstado'])->name('usuarios.alternar-estado');
        Route::resource('roles', RolController::class)->except(['create', 'edit']);

        // Mantenedores de Plantillas Base del Checklist
        Route::resource('categorias-checklist', CategoriaChecklistController::class)->except(['create', 'edit']);
        Route::resource('items-checklist', ItemChecklistController::class)->except(['create', 'edit']);

        // Acciones Administrativas sobre Empresas
        Route::post('/empresas/{id}/restaurar', [EmpresaController::class, 'restore'])->name('empresas.restaurar');
        Route::post('/empresas/{empresa}/asignar-inspectores', [EmpresaController::class, 'assignInspectors'])->name('empresas.asignar-inspectores');
    });
});