<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReportController extends Controller
{
    public function exportExcel(Request $request)
    {
        $user = Auth::user();
        $inspectionsByCompany = Inspection::accessibleBy($user)
            ->with(['company', 'user'])
            ->withCount(['checklistItems', 'observations'])
            ->latest('inspection_date')
            ->get()
            ->groupBy('company_id');

        $spreadsheet = new Spreadsheet();
        $spreadsheet->removeSheetByIndex(0);
        $usedTitles = [];

        foreach ($inspectionsByCompany as $companyInspections) {
            $company = $companyInspections->first()->company;
            $sheet = $spreadsheet->createSheet();
            $sheet->setTitle($this->sheetTitle($company?->business_name ?? 'Empresa', $usedTitles));

            $sheet->mergeCells('A1:K1');
            $sheet->setCellValue('A1', 'Inspecciones — ' . ($company?->business_name ?? 'Empresa sin nombre'));
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('1E3A8A');

            $headers = [
                'ID Inspección', 'CUIT', 'Sector Industrial', 'Fecha', 'Tipo', 'Estado',
                'Inspector Responsable', 'Matrícula', 'Avance %', 'Ítems Evaluados', 'Observaciones',
            ];
            $sheet->fromArray($headers, null, 'A3');
            $sheet->getStyle('A3:K3')->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1D4ED8']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                    'wrapText' => true,
                ],
            ]);
            $sheet->getRowDimension(3)->setRowHeight(30);

            $row = 4;
            foreach ($companyInspections as $inspection) {
                $sheet->fromArray([
                    $inspection->id,
                    $company?->tax_id ?? 'N/A',
                    $company?->industry_sector ?? 'N/A',
                    $inspection->inspection_date ? Date::PHPToExcel($inspection->inspection_date) : null,
                    $inspection->type,
                    $inspection->status,
                    $inspection->user?->name ?? 'N/A',
                    $inspection->user?->license_number ?? 'N/A',
                    $inspection->progress_percentage / 100,
                    $inspection->checklist_items_count,
                    $inspection->observations_count,
                ], null, "A{$row}");
                $sheet->getStyle("D{$row}")->getNumberFormat()->setFormatCode('dd/mm/yyyy');
                $sheet->getStyle("I{$row}")->getNumberFormat()->setFormatCode('0%');
                $row++;
            }

            $sheet->setAutoFilter('A3:K' . ($row - 1));
            $sheet->freezePane('A4');
            foreach (range('A', 'K') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }
        }

        if ($spreadsheet->getSheetCount() === 0) {
            $sheet = $spreadsheet->createSheet();
            $sheet->setTitle('Sin datos');
            $sheet->setCellValue('A1', 'No hay inspecciones disponibles para exportar.');
        }

        $spreadsheet->setActiveSheetIndex(0);
        $fileName = 'reporte_inspecciones_' . now()->format('Ymd_His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function sheetTitle(string $companyName, array &$usedTitles): string
    {
        $base = trim(preg_replace('/[\\\\\/:*?\[\]]/', ' ', $companyName)) ?: 'Empresa';
        $base = mb_substr($base, 0, 31);
        $title = $base;
        $suffix = 2;

        while (isset($usedTitles[mb_strtolower($title)])) {
            $number = ' (' . $suffix++ . ')';
            $title = mb_substr($base, 0, 31 - mb_strlen($number)) . $number;
        }

        $usedTitles[mb_strtolower($title)] = true;
        return $title;
    }
}
