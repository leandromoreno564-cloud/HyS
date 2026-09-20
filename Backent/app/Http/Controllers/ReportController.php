<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function exportCsv(Request $request)
    {
        $user = Auth::user();
        $query = Inspection::accessibleBy($user)->with(['company', 'user']);

        $inspections = $query->latest('inspection_date')->get();

        $csvFileName = 'reporte_inspecciones_' . date('Ymd_His') . '.csv';

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($inspections) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, [
                'ID Inspección',
                'Empresa',
                'CUIT',
                'Sector Industrial',
                'Fecha',
                'Tipo',
                'Estado',
                'Inspector Responsable',
                'Matrícula',
                'Avance %',
                'Items Evaluados',
                'Observaciones Registradas',
                'Medidas Correctivas'
            ], ';');

            foreach ($inspections as $ins) {
                fputcsv($file, [
                    $ins->id,
                    $ins->company->business_name ?? 'N/A',
                    $ins->company->tax_id ?? 'N/A',
                    $ins->company->industry_sector ?? 'N/A',
                    $ins->inspection_date->format('d/m/Y'),
                    $ins->type,
                    $ins->status,
                    $ins->user->name ?? 'N/A',
                    $ins->user->license_number ?? 'N/A',
                    $ins->progress_percentage . '%',
                    $ins->checklistItems()->count(),
                    $ins->observations()->count(),
                    $ins->correctiveMeasures()->count(),
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
