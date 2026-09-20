<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyChecklistItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanyChecklistController extends Controller
{
    private function authorize404(Company $company): void
    {
        /** @var User $user */
        $user = Auth::user();
        if (!$company->isAccessibleBy($user)) {
            abort(403, 'No tiene acceso a esta empresa.');
        }
    }

    public function index(Company $company)
    {
        $this->authorize404($company);

        return Inertia::render('Companies/Checklist', [
            'company' => $company->only(['id', 'business_name', 'tax_id']),
            'items' => $company->checklistItems()->get(),
        ]);
    }

    /**
     * Lee el PDF subido y devuelve los ítems detectados (número, categoría, pregunta,
     * referencia normativa) SIN guardar nada todavía. El parser no asume un PDF fijo:
     * siempre relee el archivo que se suba en este momento.
     */
    public function extract(Request $request, Company $company)
    {
        $this->authorize404($company);

        $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:20480'],
        ]);

        try {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($request->file('pdf')->getRealPath());
            $text = $pdf->getText();
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo leer el PDF. Verificá que no sea un escaneo/imagen sin texto seleccionable.',
            ], 422);
        }

        $items = $this->parseChecklistItems($text);

        if (empty($items)) {
            return response()->json([
                'success' => false,
                'message' => 'No encontramos ítems numerados de checklist en este PDF.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'items' => $items,
        ]);
    }

    /**
     * Guarda (o reemplaza) el relevamiento completo de la empresa: todos los ítems con su
     * estado (SI/NO/NO_APLICA) y descripción. No incluye fotos: eso se sube aparte, ítem por
     * ítem, para no chocar con el límite de archivos por request de PHP.
     */
    public function store(Request $request, Company $company)
    {
        $this->authorize404($company);

        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_number' => ['required', 'integer'],
            'items.*.category' => ['nullable', 'string'],
            'items.*.question' => ['required', 'string'],
            'items.*.reference' => ['nullable', 'string'],
            'items.*.status' => ['nullable', 'in:SI,NO,NO_APLICA'],
            'items.*.description' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($company, $data) {
            // Al reemplazar el relevamiento, borramos las fotos viejas del disco también
            foreach ($company->checklistItems()->get() as $old) {
                if ($old->photo_1) Storage::disk('public')->delete($old->photo_1);
                if ($old->photo_2) Storage::disk('public')->delete($old->photo_2);
            }
            $company->checklistItems()->delete();

            foreach ($data['items'] as $item) {
                $company->checklistItems()->create([
                    'item_number' => $item['item_number'],
                    'category' => $item['category'] ?? null,
                    'question' => $item['question'],
                    'reference' => $item['reference'] ?? null,
                    'status' => $item['status'] ?? null,
                    'description' => $item['description'] ?? null,
                ]);
            }
        });

        return back()->with('success', 'Relevamiento guardado correctamente.');
    }

    /**
     * Edita un ítem ya guardado (estado y/o descripción).
     */
    public function updateItem(Request $request, CompanyChecklistItem $item)
    {
        $this->authorize404($item->company);

        $data = $request->validate([
            'category' => ['sometimes', 'nullable', 'string'],
            'question' => ['sometimes', 'required', 'string'],
            'reference' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'nullable', 'in:SI,NO,NO_APLICA'],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $item->update($data);

        if ($request->expectsJson()) {
            return response()->json(['item' => $item]);
        }

        return back()->with('success', 'Ítem actualizado.');
    }

    /**
     * Sube UNA foto para UN ítem, en el slot 1 o 2. Se hace ítem por ítem (no en el guardado
     * masivo) justamente para evitar el límite max_file_uploads de PHP con checklists largos.
     */
    public function uploadPhoto(Request $request, CompanyChecklistItem $item)
    {
        $this->authorize404($item->company);

        $data = $request->validate([
            'slot' => ['required', 'in:1,2'],
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $field = 'photo_' . $data['slot'];

        if ($item->$field) {
            Storage::disk('public')->delete($item->$field);
        }

        $item->$field = $request->file('photo')->store('checklist-photos/' . $item->company_id, 'public');
        $item->save();

        if ($request->expectsJson()) {
            return response()->json(['item' => $item, 'url' => Storage::disk('public')->url($item->$field)]);
        }

        return back()->with('success', 'Foto agregada.');
    }

    public function deletePhoto(Request $request, CompanyChecklistItem $item)
    {
        $this->authorize404($item->company);

        $data = $request->validate([
            'slot' => ['required', 'in:1,2'],
        ]);

        $field = 'photo_' . $data['slot'];

        if ($item->$field) {
            Storage::disk('public')->delete($item->$field);
            $item->$field = null;
            $item->save();
        }

        if ($request->expectsJson()) {
            return response()->json(['item' => $item]);
        }

        return back()->with('success', 'Foto eliminada.');
    }

    /**
     * Parser genérico de checklists numerados tipo "Relevamiento General de Riesgos
     * Laborales" (Anexo I - Res. 463/09) u otros formularios con la misma lógica:
     * número de ítem + pregunta + referencia normativa, agrupados bajo encabezados
     * de categoría en mayúsculas. No asume texto fijo: siempre relee lo que venga.
     */
    private function parseChecklistItems(string $text): array
    {
        $lines = preg_split('/\r\n|\r|\n/', $text);

        $noisePatterns = [
            '/^SI\s+NO\s+NO\s+Fecha/ui',
            '/^APLICA\s+Regul/ui',
            '/^G\s*E\s*N\s*E\s*R\s*A\s*L\s*$/ui',
            '/^FORMULARIO$/ui',
            '/^ANEXO\s/ui',
            '/^RELEVAMIENTO GENERAL/ui',
            '/^Decreto\s+\d/ui',
            '/AGRO O A LAS OBRAS/ui',
        ];

        // Marcadores de que el listado numerado terminó (todo lo posterior se descarta)
        $stopPatterns = [
            '/^PLANILLA\b/ui',
            '/Marcar con una cruz/ui',
            '/^C[óo]digo\s+sustancia/ui',
            '/^CÓDIGO SUSTANCIA/ui',
            '/DATOS LABORALES DEL PROFESIONAL/ui',
            '/^RESPONSABILIDAD$/ui',
            '/FIRMA Y SELLO/ui',
            '/listado de C[óo]digos de Agentes de Riesgo/ui',
        ];

        $pageMarker = '/\[\s*\d+\s*de\s*\d+\s*\]/ui';
        $maxItemChars = 600;

        $isNoise = fn (string $l) => collect($noisePatterns)->contains(fn ($p) => preg_match($p, $l));
        $isStop = fn (string $l) => collect($stopPatterns)->contains(fn ($p) => preg_match($p, $l));

        $looksLikeCategory = function (string $line): bool {
            $stripped = trim($line);
            if ($stripped === '' || mb_strlen($stripped) > 90) return false;
            if (preg_match('/^\d/', $stripped)) return false;
            preg_match_all('/\p{L}/u', $stripped, $letters);
            if (empty($letters[0])) return false;
            preg_match_all('/\p{Lu}/u', $stripped, $upper);
            return (count($upper[0]) / count($letters[0])) > 0.9;
        };

        $items = [];
        $currentCategory = null;
        $current = null;
        $stopped = false;

        $flush = function () use (&$current, &$items, &$currentCategory) {
            if ($current === null) return;
            $raw = trim(preg_replace('/\s+/u', ' ', $current['text']));
            $idx = mb_strrpos($raw, '?');
            if ($idx !== false) {
                $question = trim(mb_substr($raw, 0, $idx + 1));
                $reference = trim(mb_substr($raw, $idx + 1));
                $reference = $reference !== '' ? $reference : null;
            } else {
                $question = $raw;
                $reference = null;
            }
            if ($question !== '') {
                $items[] = [
                    'item_number' => $current['number'],
                    'category' => $currentCategory,
                    'question' => $question,
                    'reference' => $reference,
                ];
            }
            $current = null;
        };

        foreach ($lines as $rawLine) {
            if ($stopped) break;
            $line = preg_replace($pageMarker, '', $rawLine);
            if (trim($line) === '') continue;

            if ($isStop($line)) {
                $flush();
                $stopped = true;
                break;
            }
            if ($isNoise($line)) continue;

            if ($looksLikeCategory($line)) {
                $flush();
                $currentCategory = trim($line);
                continue;
            }

            if (preg_match('/^\s*(\d{1,3})\s+(?=[¿A-ZÁÉÍÓÚÑ])/u', $line, $m)) {
                $flush();
                $current = ['number' => (int) $m[1], 'text' => mb_substr($line, mb_strlen($m[0]))];
                continue;
            }

            if ($current !== null) {
                $current['text'] .= ' ' . $line;
                if (!str_contains($current['text'], '?') && mb_strlen($current['text']) > $maxItemChars) {
                    $flush();
                }
            }
        }
        $flush();

        return $items;
    }
}
