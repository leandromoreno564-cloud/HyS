<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyChecklist;
use App\Models\CompanyChecklistItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
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

    private function resolveChecklist(Request $request, Company $company): ?CompanyChecklist
    {
        $id = $request->input('checklist_id', $request->input('checklist'));

        if ($id === null) {
            return $company->checklists()->first();
        }

        return $company->checklists()->whereKey($id)->firstOrFail();
    }

    public function index(Request $request, Company $company)
    {
        $this->authorize404($company);
        $checklist = $request->boolean('new') ? null : $this->resolveChecklist($request, $company);

        return Inertia::render('Companies/Checklist', [
            'company' => $company->only(['id', 'business_name', 'tax_id']),
            'checklist' => $checklist,
            'checklists' => $company->checklists()->get(['id', 'name', 'surveyed_at', 'created_at']),
            'items' => $checklist?->items()->get() ?? [],
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
     * Guarda un nuevo relevamiento completo de la empresa: todos los ítems con su
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

        $checklist = DB::transaction(function () use ($company, $data) {
            $checklist = $company->checklists()->create([
                'created_by' => Auth::id(),
                'name' => 'Relevamiento ' . now()->format('d/m/Y H:i'),
                'surveyed_at' => now()->toDateString(),
            ]);

            foreach ($data['items'] as $item) {
                $checklist->items()->create([
                    'company_id' => $company->id,
                    'item_number' => $item['item_number'],
                    'category' => $item['category'] ?? null,
                    'question' => $item['question'],
                    'reference' => $item['reference'] ?? null,
                    'status' => $item['status'] ?? null,
                    'description' => $item['description'] ?? null,
                ]);
            }

            return $checklist;
        });

        // El front guarda por axios y necesita los IDs para subir las fotos que ya adjuntó
        if ($request->expectsJson()) {
            return response()->json(['checklist' => $checklist, 'items' => $checklist->items()->get()]);
        }

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
     * Agrega un ítem manual a un relevamiento ya guardado.
     */
    public function storeItem(Request $request, Company $company)
    {
        $this->authorize404($company);

        $data = $request->validate([
            'category' => ['nullable', 'string', 'max:255'],
            'question' => ['nullable', 'string'],
            'reference' => ['nullable', 'string'],
            'checklist_id' => ['required', 'integer'],
        ]);

        $checklist = $company->checklists()->whereKey($data['checklist_id'])->firstOrFail();

        $next = ((int) $checklist->items()->max('item_number')) + 1;

        $item = $checklist->items()->create([
            'company_id' => $company->id,
            'item_number' => $next,
            'category' => $data['category'] ?? null,
            'question' => $data['question'] ?: 'Nuevo ítem',
            'reference' => $data['reference'] ?? null,
        ]);

        return response()->json(['item' => $item->fresh()]);
    }

    /**
     * Elimina un ítem guardado junto con sus fotos.
     */
    public function destroyItem(Request $request, CompanyChecklistItem $item)
    {
        $this->authorize404($item->company);

        if ($item->photo_1) Storage::disk('public')->delete($item->photo_1);
        if ($item->photo_2) Storage::disk('public')->delete($item->photo_2);
        $item->delete();

        return response()->json(['deleted' => true]);
    }

    /**
     * Renombra una categoría (todos los ítems que la tengan). "from" null = ítems sin categoría.
     */
    public function renameCategory(Request $request, Company $company)
    {
        $this->authorize404($company);

        $data = $request->validate([
            'from' => ['nullable', 'string'],
            'to' => ['required', 'string', 'max:255'],
            'checklist_id' => ['required', 'integer'],
        ]);

        $query = CompanyChecklistItem::where('company_id', $company->id)
            ->where('company_checklist_id', $data['checklist_id']);
        $data['from'] === null ? $query->whereNull('category') : $query->where('category', $data['from']);
        $query->update(['category' => trim($data['to'])]);

        return response()->json(['ok' => true]);
    }

    /**
     * Asistente conversacional (vive en el widget de chat del checklist).
     *
     * Laravel actúa de "proxy de confianza": arma el contexto completo del relevamiento,
     * se lo manda a un workflow de n8n (que tiene el nodo de IA), y cuando n8n responde con
     * instrucciones de qué ítems cambiar, es Laravel quien aplica esos cambios a la base
     * de datos —nunca n8n directamente—, validando que los ítems pertenezcan a esta empresa.
     *
     * Requiere la variable de entorno N8N_CHECKLIST_CHAT_WEBHOOK_URL en el .env, apuntando
     * a la URL del nodo Webhook del workflow (ver guía del asistente).
     */
    public function chat(Request $request, Company $company)
    {
        $this->authorize404($company);

        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            // Historial corto que manda el front para que la IA tenga contexto de la charla.
            'history' => ['sometimes', 'array', 'max:20'],
            'history.*.role' => ['required_with:history', 'string', 'in:user,assistant'],
            'history.*.content' => ['required_with:history', 'string', 'max:2000'],
        ]);

        $webhookUrl = config('services.n8n.checklist_chat_webhook_url');
        if (!$webhookUrl) {
            return response()->json([
                'reply' => 'El asistente todavía no está configurado. Falta definir N8N_CHECKLIST_CHAT_WEBHOOK_URL en el servidor.',
                'updated_items' => [],
            ], 503);
        }

        $checklist = $this->resolveChecklist($request, $company);
        if (!$checklist) {
            return response()->json(['reply' => 'Primero seleccioná o creá un relevamiento.', 'updated_items' => []], 422);
        }

        $items = $checklist->items()
            ->orderBy('item_number')
            ->get(['id', 'item_number', 'category', 'question', 'reference', 'status', 'description'])
            ->map(fn (CompanyChecklistItem $it) => [
                'id' => $it->id,
                'item_number' => $it->item_number,
                'category' => $it->category,
                'question' => $it->question,
                'reference' => $it->reference,
                'status' => $it->status, // SI | NO | NO_APLICA | null
                'description' => $it->description,
            ]);

        $payload = [
            'company' => [
                'id' => $company->id,
                'business_name' => $company->business_name,
                'tax_id' => $company->tax_id,
            ],
            'message' => $data['message'],
            'history' => $data['history'] ?? [],
            'items' => $items,
        ];

        try {
            $headers = [];
            // Autenticación simple del webhook: evita que cualquiera con la URL pueda llamarlo.
            if ($secret = config('services.n8n.checklist_chat_secret')) {
                $headers['X-Webhook-Secret'] = $secret;
            }

            $response = Http::withHeaders($headers)
                ->timeout(30)
                ->post($webhookUrl, $payload);

            if (!$response->successful()) {
                Log::warning('n8n checklist chat webhook failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'reply' => 'El asistente no pudo responder en este momento. Probá de nuevo en unos segundos.',
                    'updated_items' => [],
                ], 502);
            }

            $result = $response->json();
        } catch (\Throwable $e) {
            Log::error('n8n checklist chat webhook error', ['message' => $e->getMessage()]);

            return response()->json([
                'reply' => 'No se pudo contactar al asistente. Revisá que n8n esté corriendo.',
                'updated_items' => [],
            ], 502);
        }

        $reply = is_string($result['reply'] ?? null) ? $result['reply'] : 'Listo.';
        $actions = is_array($result['actions'] ?? null) ? $result['actions'] : [];

        $updatedItems = collect();

        foreach ($actions as $action) {
            if (!is_array($action) || ($action['type'] ?? null) !== 'update_item') {
                continue;
            }

            // Se busca por item_number DENTRO de esta empresa: nunca se confía en un "id"
            // que venga de n8n, así una respuesta mal armada no puede tocar otra empresa.
            $itemNumber = $action['item_number'] ?? null;
            if (!is_numeric($itemNumber)) {
                continue;
            }

            /** @var CompanyChecklistItem|null $item */
            $item = CompanyChecklistItem::where('company_checklist_id', $checklist->id)
                ->where('item_number', (int) $itemNumber)
                ->first();

            if (!$item) {
                continue;
            }

            $fields = [];
            if (isset($action['status']) && in_array($action['status'], ['SI', 'NO', 'NO_APLICA', null], true)) {
                $fields['status'] = $action['status'];
            }
            if (isset($action['description']) && is_string($action['description'])) {
                $fields['description'] = $action['description'];
            }

            if ($fields !== []) {
                $item->update($fields);
                $updatedItems->push($item->fresh());
            }
        }

        return response()->json([
            'reply' => $reply,
            'updated_items' => $updatedItems->values(),
        ]);
    }

    /**
     * Descarga el relevamiento guardado (con todas las ediciones, estados, observaciones
     * y fotos) como PDF. Requiere: composer require barryvdh/laravel-dompdf
     */
    public function downloadPdf(Request $request, Company $company)
    {
        $this->authorize404($company);

        $checklist = $this->resolveChecklist($request, $company);
        abort_unless($checklist, 404, 'Todavía no hay un relevamiento guardado para esta empresa.');
        $items = $checklist->items()->get();
        if ($items->isEmpty()) {
            abort(404, 'Todavía no hay un relevamiento guardado para esta empresa.');
        }

        // Las fotos se reescalan e incrustan: con muchas fotos de celular el PDF pesaría cientos de MB
        @set_time_limit(300);
        @ini_set('memory_limit', '768M');

        $rows = $items->map(fn (CompanyChecklistItem $it) => [
            'item_number' => $it->item_number,
            'category' => $it->category ?: 'Sin categoría',
            'question' => $it->question,
            'reference' => $it->reference,
            'status' => $it->status,
            'description' => $it->description,
            'photos' => array_values(array_filter([
                $this->imageDataUri($it->photo_1),
                $this->imageDataUri($it->photo_2),
            ])),
        ]);

        $summary = [
            'total' => $rows->count(),
            'si' => $rows->where('status', 'SI')->count(),
            'no' => $rows->where('status', 'NO')->count(),
            'na' => $rows->where('status', 'NO_APLICA')->count(),
            'pending' => $rows->whereNull('status')->count(),
        ];

        $pdf = Pdf::loadView('pdf.checklist', [
            'company' => $company,
            'groups' => $rows->groupBy('category'),
            'summary' => $summary,
            'generatedAt' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'portrait')->setOptions([
            'defaultFont' => 'DejaVu Sans',
            'isRemoteEnabled' => false,
        ]);

        $filename = 'Relevamiento-' . (Str::slug($company->business_name) ?: 'empresa') . '-' . now()->format('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Devuelve la foto reescalada (máx. 1000 px) como data URI para incrustarla en el PDF,
     * corrigiendo la orientación EXIF de las fotos tomadas con el celular.
     */
    private function imageDataUri(?string $relativePath, int $maxSize = 1000): ?string
    {
        if (!$relativePath) return null;

        $path = Storage::disk('public')->path($relativePath);
        if (!is_file($path)) return null;

        $info = @getimagesize($path);
        if (!$info) return null;

        $binary = file_get_contents($path);

        // Sin GD no se puede reescalar: se incrusta tal cual
        if (!function_exists('imagecreatefromstring')) {
            return 'data:' . $info['mime'] . ';base64,' . base64_encode($binary);
        }

        $src = @imagecreatefromstring($binary);
        if (!$src) return null;

        if ($info['mime'] === 'image/jpeg' && function_exists('exif_read_data')) {
            $exif = @exif_read_data($path);
            $angle = [3 => 180, 6 => -90, 8 => 90][$exif['Orientation'] ?? 1] ?? 0;
            if ($angle !== 0) {
                $rotated = imagerotate($src, $angle, 0);
                if ($rotated) {
                    imagedestroy($src);
                    $src = $rotated;
                }
            }
        }

        $w = imagesx($src);
        $h = imagesy($src);
        $scale = min(1, $maxSize / max($w, $h));
        $nw = max(1, (int) round($w * $scale));
        $nh = max(1, (int) round($h * $scale));

        $dst = imagecreatetruecolor($nw, $nh);
        imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255)); // fondo blanco para PNG/WEBP transparentes
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);

        ob_start();
        imagejpeg($dst, null, 80);
        $jpeg = ob_get_clean();

        imagedestroy($src);
        imagedestroy($dst);

        return 'data:image/jpeg;base64,' . base64_encode($jpeg);
    }

    /**
     * Parser genérico de checklists numerados tipo "Relevamiento General de Riesgos
     * Laborales" (Anexo I - Res. 463/09) u otros formularios con la misma lógica:
     * número de ítem + pregunta + referencia normativa, agrupados bajo encabezados
     * de categoría en mayúsculas. No asume texto fijo: siempre relee lo que venga.
     *
     * Detalles que hay que tolerar porque el extractor de texto (smalot/pdfparser)
     * NO conserva los espacios del PDF:
     *  - El número puede venir pegado al texto: "10¿Existe...", "21Se desarrolla...".
     *  - El encabezado repetido de cada página ("SI NO NO Fecha", "GENERAL", "A",
     *    "Nombre de la Empresa...", "[2 de 8]") aparece al FINAL del texto de la página,
     *    pegado al último ítem, y hay que descartarlo entero.
     */
    private function parseChecklistItems(string $text): array
    {
        $lines = preg_split('/\r\n|\r|\n/', $text);

        // Encabezado/pie que se repite en cada página. Se descarta desde la línea
        // "SI NO NO Fecha" hasta el marcador "[n de N]" (tolera espacios faltantes).
        $footerStart = '/^\s*SI\s*NO\s*NO\s*Fecha/ui';
        $pageMarker = '/\[\s*\d+\s*de\s*\d+\s*\]/ui';
        $maxFooterLines = 40;

        // Líneas sueltas de ruido (por si el extractor las deja fuera del bloque anterior)
        $noisePatterns = [
            '/^\s*N\s*°\s*EMPRESAS/ui',
            '/^\s*APLICA\s*Regul/ui',
            '/^\s*G\s*E\s*N\s*E\s*R\s*A\s*L\s*$/ui',
            '/^\s*[A-Z]\s*$/u',
            '/^\s*FORMULARIO\s*$/ui',
            '/^\s*ANEXO\s/ui',
            '/^\s*RELEVAMIENTO GENERAL/ui',
            '/^\s*Decreto\s+\d+\/\d+\s*-/ui',
            '/AGRO O A LAS OBRAS/ui',
            '/^\s*(El presente relevamiento|El relevamiento deber|En caso de empresas|consideradas como)/ui',
            '/^\s*(Nombre de la Empresa|CUIT\s*\/|Domicilio Completo|\d?\s*Provincia\s*:|N[º°]\s*de Establecimiento)/ui',
            '/^\s*DATOS GENERALES DEL/ui',
            '/^\s*ESTADO DE CUMPLIMIENTO EN EL ESTABLECIMIENTO/ui',
        ];

        // Marcadores de que el listado numerado terminó (todo lo posterior se descarta)
        $stopPatterns = [
            '/^\s*PLANILLA\b/ui',
            '/Marcar con una cruz/ui',
            '/^\s*C[óo]digo\s*sustancia/ui',
            '/^\s*C[óo]d\.?\s*Difenilos/ui',
            '/DATOS LABORALES DEL PROFESIONAL/ui',
            '/^\s*RESPONSABILIDAD\s*$/ui',
            '/FIRMA Y SELLO/ui',
            '/listado de C[óo]digos de Agentes de Riesgo/ui',
        ];

        $maxItemChars = 600;
        $maxNumberJump = 5; // un número nuevo debe ser mayor al anterior y no saltar demasiado

        $isNoise = fn (string $l) => collect($noisePatterns)->contains(fn ($p) => preg_match($p, $l));
        $isStop = fn (string $l) => collect($stopPatterns)->contains(fn ($p) => preg_match($p, $l));

        $looksLikeCategory = function (string $line): bool {
            $stripped = trim($line);
            if (mb_strlen($stripped) < 3 || mb_strlen($stripped) > 90) return false;
            if (preg_match('/^\d/', $stripped)) return false;
            preg_match_all('/\p{L}/u', $stripped, $letters);
            if (empty($letters[0])) return false;
            preg_match_all('/\p{Lu}/u', $stripped, $upper);
            return (count($upper[0]) / count($letters[0])) > 0.9;
        };

        $items = [];
        $currentCategory = null;
        $current = null;
        $lastNumber = null;
        $footerLines = 0;
        $inFooter = false;

        $flush = function () use (&$current, &$items) {
            if ($current === null) return;
            $raw = trim(preg_replace('/\s+/u', ' ', $current['text']));
            $idx = mb_strrpos($raw, '?');
            if ($idx !== false) {
                $question = trim(mb_substr($raw, 0, $idx + 1));
                $reference = trim(ltrim(mb_substr($raw, $idx + 1), " :"));
            } elseif (preg_match('/^(.*?)\s+((?:Cap\.|Art\.|Arts\.|Anexo|Res\.|Dec\.|Dto\.|Ley)\s.*)$/u', $raw, $m)) {
                // Ítems sin signo de pregunta (ej. sub-ítems de mantenimiento preventivo)
                $question = trim($m[1]);
                $reference = trim($m[2]);
            } else {
                $question = $raw;
                $reference = '';
            }
            if ($question !== '') {
                $items[] = [
                    'item_number' => $current['number'],
                    'category' => $current['category'],
                    'question' => $question,
                    'reference' => $reference !== '' ? $reference : null,
                ];
            }
            $current = null;
        };

        foreach ($lines as $rawLine) {
            // ¿Estamos dentro del bloque de encabezado/pie de página? Lo salteamos entero.
            if ($inFooter) {
                $footerLines++;
                if (preg_match($pageMarker, $rawLine) || $footerLines > $maxFooterLines) {
                    $inFooter = false;
                }
                continue;
            }

            if ($isStop($rawLine)) {
                break;
            }

            if (preg_match($footerStart, $rawLine)) {
                $inFooter = true;
                $footerLines = 0;
                continue;
            }

            $line = preg_replace($pageMarker, '', $rawLine);
            if (trim($line) === '') continue;
            if ($isNoise($line)) continue;

            // Número de ítem: el espacio con el texto es OPCIONAL ("10¿Existe", "21Se desarrolla").
            // Se valida contra el número anterior para no confundir "2Provincia" ni "106,107 y110".
            if (preg_match('/^\s*(\d{1,3})\s*(?=[¿¡A-ZÁÉÍÓÚÑ])/u', $line, $m)) {
                $number = (int) $m[1];
                $validSequence = $lastNumber === null
                    ? $number <= $maxNumberJump
                    : ($number > $lastNumber && $number <= $lastNumber + $maxNumberJump);

                if ($validSequence) {
                    $flush();
                    $lastNumber = $number;
                    $current = [
                        'number' => $number,
                        'category' => $currentCategory,
                        'text' => mb_substr($line, mb_strlen($m[0])),
                    ];
                    continue;
                }
            }

            if ($looksLikeCategory($line)) {
                $flush();
                $currentCategory = trim($line);
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
