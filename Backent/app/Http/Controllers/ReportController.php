<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function exportPdf(Inspection $inspection)
    {
        $user = Auth::user();

        if ($user && !$user->isAdmin() && $inspection->user_id !== $user->id && !$inspection->company->isAccessibleBy($user)) {
            abort(403, 'No tiene permisos para descargar el informe de esta inspección.');
        }

        $inspection->load([
            'company',
            'user',
            'checklistItems',
            'observations',
            'correctiveMeasures.observation',
        ]);

        $groupedChecklist = $inspection->checklistItems->groupBy('category_name');
        $stats = $inspection->complianceStats();

        // Generar URL para código QR de verificación
        $qrUrl = route('reports.verify', ['token' => $inspection->token]);
        // Usar servicio seguro o QR SVG
        $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' . urlencode($qrUrl);

        $pdf = Pdf::loadView('reports.pdf', compact(
            'inspection',
            'groupedChecklist',
            'stats',
            'qrUrl',
            'qrImage'
        ));

        $pdf->setPaper('a4', 'portrait');

        $fileName = 'Informe_Inspeccion_' . str_replace([' ', '/', '\\'], '_', $inspection->company->business_name) . '_' . $inspection->inspection_date->format('Ymd') . '.pdf';

        return $pdf->download($fileName);
    }

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
            // UTF-8 BOM para apertura correcta en Microsoft Excel
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Encabezados
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

    public function verifyQr($token)
    {
        $inspection = Inspection::with(['company', 'user'])->where('token', $token)->firstOrFail();
        $stats = $inspection->complianceStats();

        return Inertia::render('Reports/Verify', compact('inspection', 'stats'));
    }
}
