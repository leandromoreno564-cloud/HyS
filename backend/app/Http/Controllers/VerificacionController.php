<?php

namespace App\Http\Controllers;

use App\Models\Inspeccion;
use Inertia\Inertia;

class VerificacionController extends Controller
{
    /**
     * Muestra el certificado público de la inspección leyendo el archivo Reportes/Verificar.jsx
     */
    public function __invoke(string $token)
    {
        $inspeccion = Inspeccion::where('token', $token)
            ->with(['empresa', 'inspector'])
            ->firstOrFail();

        $estadisticas = $inspeccion->obtenerEstadisticasCumplimiento();

        return Inertia::render('Reportes/Verificar', [
            'inspection' => $inspeccion,
            'stats' => $estadisticas,
        ]);
    }
}