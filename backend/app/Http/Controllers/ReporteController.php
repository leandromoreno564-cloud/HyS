<?php

namespace App\Http\Controllers;

use App\Models\Inspeccion;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReporteController extends Controller
{
    /**
     * Exporta el listado general de inspecciones en formato CSV.
     */
    public function exportarCsv(): StreamedResponse
    {
        $nombreArchivo = 'reporte-inspecciones-' . date('Y-m-d-H-i') . '.csv';

        return response()->streamDownload(function () {
            $archivo = fopen('php://output', 'w');

            // BOM de UTF-8 para compatibilidad con Excel
            fputs($archivo, "\xEF\xBB\xBF");

            // Encabezados
            fputcsv($archivo, [
                'ID',
                'Título / Código',
                'Estado',
                'Fecha de Inspección',
                'Usuario / Inspector',
                'Fecha de Registro',
            ]);

            // Obtención de datos por lotes
            Inspeccion::with('usuario')->chunk(100, function ($inspecciones) use ($archivo) {
                foreach ($inspecciones as $inspeccion) {
                    $inspector = optional($inspeccion->usuario)->nombre 
                        ?? optional($inspeccion->usuario)->name 
                        ?? 'N/A';

                    $fechaRegistro = $inspeccion->created_at 
                        ? Carbon::parse($inspeccion->created_at)->format('Y-m-d H:i:s') 
                        : 'N/A';

                    $fechaInspeccion = $inspeccion->fecha 
                        ?? ($inspeccion->created_at ? Carbon::parse($inspeccion->created_at)->format('Y-m-d') : 'N/A');

                    fputcsv($archivo, [
                        $inspeccion->id,
                        $inspeccion->titulo ?? $inspeccion->codigo ?? ('Inspección #' . $inspeccion->id),
                        $inspeccion->estado ?? 'En Progreso',
                        $fechaInspeccion,
                        $inspector,
                        $fechaRegistro,
                    ]);
                }
            });

            fclose($archivo);
        }, $nombreArchivo, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}