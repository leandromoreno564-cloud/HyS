<?php

use App\Http\Controllers\Api\ApiAuthController;
use App\Http\Controllers\Api\ApiInspectionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for Android (Java) Mobile App & External Services
|--------------------------------------------------------------------------
| Rutas RESTful en formato JSON para la aplicación móvil en Android (Java)
| con soporte para toma de fotos con la cámara y subida multipart.
*/

// Autenticación pública
Route::post('/login', [ApiAuthController::class, 'login']);

// Rutas protegidas para el Inspector en Android
Route::middleware('auth:sanctum')->group(function () {
    // Perfil del inspector autenticado
    Route::get('/me', [ApiAuthController::class, 'me']);
    Route::post('/logout', [ApiAuthController::class, 'logout']);

    // Módulo de Inspecciones de Campo
    Route::get('/inspecciones', [ApiInspectionController::class, 'index']);
    Route::get('/inspecciones/{id}', [ApiInspectionController::class, 'show']);
    Route::post('/inspecciones/{id}/checklist/{itemId}', [ApiInspectionController::class, 'updateChecklistItem']);
    
    // Subida de evidencias fotográficas capturadas con la cámara del celular
    Route::post('/inspecciones/{id}/evidencias', [ApiInspectionController::class, 'uploadEvidence']);
    
    // Finalización de inspección y registro de firmas
    Route::post('/inspecciones/{id}/finalizar', [ApiInspectionController::class, 'finalize']);
});
