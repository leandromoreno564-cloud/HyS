<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $query = Company::accessibleBy($user)->with(['creator', 'inspectors']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('tax_id', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sector')) {
            $query->where('industry_sector', $request->input('sector'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        // Si el admin pide ver papelera
        if ($user->isAdmin() && $request->boolean('trashed')) {
            $query->onlyTrashed();
        }

        $companies = $query->withCount('inspections')
            ->orderBy('business_name')
            ->paginate(10)
            ->withQueryString();

        $sectors = Company::select('industry_sector')
            ->distinct()
            ->pluck('industry_sector');

        return Inertia::render('Companies/Index', compact('companies', 'sectors'));
    }

    public function create()
    {
        $inspectors = User::where('role', 'inspector')->where('is_active', true)->get();
        return Inertia::render('Companies/Create', compact('inspectors'));
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'tax_id' => ['required', 'string', 'max:50', 'unique:companies,tax_id'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'industry_sector' => ['required', 'string', 'max:100'],
            'employee_count' => ['required', 'integer', 'min:1'],
            'website' => ['nullable', 'url', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location_accuracy' => ['nullable', 'numeric', 'min:0'],
            'location_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:8192'],
            'remove_location_photo' => ['nullable', 'boolean'],
            'is_active' => ['boolean'],
            'inspector_ids' => ['nullable', 'array'],
            'inspector_ids.*' => ['exists:users,id'],
        ]);

        $this->applyLocation($data, $request);

        $data['created_by'] = $user->id;
        $data['is_active'] = $request->boolean('is_active', true);

        $company = Company::create($data);

        // Si es inspector quien registra, se le auto-asigna a la empresa
        if ($user->isInspector()) {
            $company->inspectors()->syncWithoutDetaching([$user->id]);
        } elseif ($user->isAdmin() && !empty($data['inspector_ids'])) {
            $company->inspectors()->sync($data['inspector_ids']);
        }

        return redirect()->route('companies.show', $company)
            ->with('success', 'Empresa registrada correctamente en la plataforma.');
    }

    public function extractPdf(Request $request)
    {
        $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf,docx,odt,txt', 'max:20480'],
        ]);

        try {
            $text = \App\Support\DocumentText::fromUpload($request->file('pdf'));
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo leer el archivo. Verificá que no sea un escaneo/imagen sin texto seleccionable.',
            ], 422);
        }

        // Normaliza espacios para que los patrones no fallen por saltos de línea raros
        $flat = preg_replace('/[ \t]+/', ' ', $text);
        $flat = preg_replace('/\s*\n\s*/', ' ', $flat);

        $clean = function (?string $value): ?string {
            if ($value === null) {
                return null;
            }
            // Saca corridas de guiones bajos/puntos usados como líneas de completar
            $value = preg_replace('/[_\.]{3,}/', ' ', $value);
            $value = trim(preg_replace('/\s+/', ' ', $value));
            return $value !== '' ? $value : null;
        };

        // Descarta restos de formato (ej. "P 2" que queda de un campo vacío) exigiendo
        // al menos una secuencia de 2+ letras reales en el valor capturado
        $meaningful = function (?string $value): ?string {
            if ($value === null) {
                return null;
            }
            return preg_match('/\p{L}{2,}/u', $value) ? $value : null;
        };

        $match = function (string $pattern) use ($flat, $clean): ?string {
            if (preg_match($pattern, $flat, $m)) {
                return $clean($m[1] ?? null);
            }
            return null;
        };

        $businessName = $meaningful($match('/Nombre de la Empresa:?\s*([^:]+?)\s*(?:CUIT|C\.?U\.?I\.?T)/ui'));
        $taxId = $match('/CUIT\s*\/?\s*CUIP\s*N[ºo°]?:?\s*([\d]{2}[\-\s]?[\d]{7,8}[\-\s]?[\d])/ui');
        $industrySector = $meaningful($match('/Actividad Econ[oó]mica.*?Rev\.?\s*3:?\s*([^:]+?)\s*(?:Domicilio|$)/ui'));
        $domicilio = $meaningful($match('/Domicilio Completo:?\s*([^:]+?)\s*(?:C\.?P\.?\s*\/|Localidad)/ui'));
        $postalCode = $match('/C\.?P\.?\s*\/\s*C\.?P\.?A\.?:?\s*([A-Z0-9]{3,8})/ui');
        $locality = $meaningful($match('/Localidad:?\s*([^:]+?)\s*(?:P\s*\d*\s*rovincia|Provincia)/ui'));
        $province = $meaningful($match('/rovincia:?\s*([^:]+?)\s*(?:Cant\.?\s*de trabajadores)/ui'));
        $employeeCount = $match('/Cant\.?\s*de trabajadores:?\s*([\d]+)/ui');
        $establishmentNumber = $match('/N[ºo°]\s*de Establecimiento:?\s*([A-Za-z0-9\-]+)/ui');
        $surfaceM2 = $match('/Sup\.?\s*del Establec\.?:?\s*([\d\.,]+)/ui');

        // Cada campo se devuelve por separado para que el usuario pueda ver y editar
        // exactamente lo que se detectó en el PDF antes de que se combine/aplique al alta
        $fields = [
            'business_name' => $businessName,
            'tax_id' => $taxId,
            'industry_sector' => $industrySector,
            'employee_count' => $employeeCount,
            'domicilio' => $domicilio,
            'postal_code' => $postalCode,
            'locality' => $locality,
            'province' => $province,
            'establishment_number' => $establishmentNumber,
            'surface_m2' => $surfaceM2,
        ];

        // ------------------------------------------------------------------
        // Modo "escanear todo": si el PDF no sigue el formulario esperado, se buscan los
        // datos por etiqueta ("Etiqueta: valor") y se devuelve igualmente todo el contenido.
        // ------------------------------------------------------------------
        $utf = fn ($s) => mb_convert_encoding((string) $s, 'UTF-8', 'UTF-8');
        $norm = function (string $s): string {
            $s = mb_strtolower($s, 'UTF-8');
            $s = strtr($s, ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n']);
            return trim(preg_replace('/[^a-z0-9]+/', ' ', $s));
        };

        $pairs = [];
        foreach (preg_split('/\r\n|\r|\n/', $utf($text)) as $line) {
            $line = trim(preg_replace('/[ \t]+/', ' ', $line));
            if ($line === '' || mb_strlen($line) > 400) {
                continue;
            }
            if (!preg_match('/^([^:]{2,60}?)\s*:\s*(.+)$/u', $line, $m)) {
                continue;
            }
            $label = $clean($m[1]);
            $value = $clean($m[2]);
            if ($label === null || $value === null || !preg_match('/\p{L}{2,}/u', $label)) {
                continue;
            }
            $pairs[] = ['label' => $label, 'value' => $value];
        }

        $synonyms = [
            'business_name' => ['razon social', 'nombre de la empresa', 'denominacion', 'empresa', 'nombre'],
            'tax_id' => ['cuit', 'cuil', 'cuit cuip'],
            'industry_sector' => ['actividad economica', 'actividad principal', 'actividad', 'rubro', 'sector'],
            'employee_count' => ['cantidad de trabajadores', 'cant de trabajadores', 'trabajadores', 'empleados', 'dotacion', 'personal'],
            'domicilio' => ['domicilio completo', 'domicilio', 'direccion', 'calle'],
            'postal_code' => ['codigo postal', 'cp', 'cpa'],
            'locality' => ['localidad', 'ciudad', 'partido'],
            'province' => ['provincia'],
            'establishment_number' => ['numero de establecimiento', 'n de establecimiento', 'nro de establecimiento', 'establecimiento'],
            'surface_m2' => ['superficie', 'sup del establecimiento', 'sup del establec', 'sup', 'm2'],
        ];
        $shapes = [
            'tax_id' => fn ($v) => preg_match('/\d{2}[\-\s]?\d{7,8}[\-\s]?\d/', $v, $x) ? $x[0] : null,
            'employee_count' => fn ($v) => preg_match('/\d+/', $v, $x) ? $x[0] : null,
            'surface_m2' => fn ($v) => preg_match('/\d[\d\.,]*/', $v, $x) ? $x[0] : null,
            'postal_code' => fn ($v) => preg_match('/[A-Z]?\d{3,5}[A-Z]{0,3}/i', $v, $x) ? $x[0] : null,
        ];

        $used = [];
        foreach ($synonyms as $key => $list) {
            if (!empty($fields[$key])) {
                continue;
            }
            foreach ($pairs as $i => $pair) {
                if (isset($used[$i])) {
                    continue;
                }
                $l = $norm($pair['label']);
                $hit = false;
                foreach ($list as $syn) {
                    if ($l === $syn || (mb_strlen($syn) >= 6 && str_contains($l, $syn))) {
                        $hit = true;
                        break;
                    }
                }
                if (!$hit) {
                    continue;
                }
                $value = isset($shapes[$key]) ? $shapes[$key]($pair['value']) : $pair['value'];
                if ($value === null || $value === '') {
                    continue;
                }
                $fields[$key] = $value;
                $used[$i] = true;
                break;
            }
        }

        // CUIT suelto en cualquier parte del texto (prefijos válidos de CUIT/CUIL)
        if (empty($fields['tax_id']) && preg_match('/\b((?:20|23|24|27|30|33|34)[\-\s]?\d{8}[\-\s]?\d)\b/', $flat, $m)) {
            $fields['tax_id'] = $m[1];
        }

        // Todo lo que no tiene un campo propio se devuelve como "otros datos"
        $extras = [];
        $seen = [];
        foreach ($pairs as $i => $pair) {
            if (isset($used[$i])) {
                continue;
            }
            $sig = $norm($pair['label']) . '|' . $norm($pair['value']);
            if (isset($seen[$sig])) {
                continue;
            }
            $seen[$sig] = true;
            $extras[] = $pair;
            if (count($extras) >= 100) {
                break;
            }
        }

        $rawText = trim(preg_replace("/\n{3,}/", "\n\n", preg_replace('/[ \t]+/', ' ', $utf($text))));
        $rawText = mb_substr($rawText, 0, 12000);

        $foundAny = collect($fields)->filter()->isNotEmpty() || !empty($extras) || $rawText !== '';

        return response()->json([
            'success' => true,
            'found' => $foundAny,
            'fields' => $fields,
            'extras' => $extras,
            'raw_text' => $rawText,
            'message' => $rawText === ''
                ? 'El PDF no tiene texto seleccionable (parece una imagen escaneada). Completá el formulario a mano.'
                : null,
        ]);
    }

    public function show(Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$company->isAccessibleBy($user)) {
            abort(403, 'No tiene acceso a esta empresa.');
        }

        $company->load(['creator', 'inspectors', 'inspections.user', 'inspections.observations']);
        $inspectors = User::where('role', 'inspector')->where('is_active', true)->get();

        return Inertia::render('Companies/Show', compact('company', 'inspectors'));
    }

    public function edit(Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$company->isAccessibleBy($user)) {
            abort(403, 'No tiene permisos para editar esta empresa.');
        }

        $inspectors = User::where('role', 'inspector')->where('is_active', true)->get();

        return Inertia::render('Companies/Edit', compact('company', 'inspectors'));
    }

    public function update(Request $request, Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$company->isAccessibleBy($user)) {
            abort(403, 'No tiene permisos para editar esta empresa.');
        }

        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'tax_id' => ['required', 'string', 'max:50', Rule::unique('companies')->ignore($company->id)],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'industry_sector' => ['required', 'string', 'max:100'],
            'employee_count' => ['required', 'integer', 'min:1'],
            'website' => ['nullable', 'url', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location_accuracy' => ['nullable', 'numeric', 'min:0'],
            'location_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:8192'],
            'remove_location_photo' => ['nullable', 'boolean'],
            'is_active' => ['boolean'],
            'inspector_ids' => ['nullable', 'array'],
            'inspector_ids.*' => ['exists:users,id'],
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $this->applyLocation($data, $request, $company);
        $company->update($data);

        // Si es admin, puede actualizar asignaciones
        // (sync_inspectors permite vaciar la lista cuando el form viaja como multipart y el array vacío no se envía)
        if ($user->isAdmin() && ($request->has('inspector_ids') || $request->boolean('sync_inspectors'))) {
            $company->inspectors()->sync($data['inspector_ids'] ?? []);
        }

        return redirect()->route('companies.show', $company)
            ->with('success', 'Datos de la empresa actualizados exitosamente.');
    }

    public function assignInspectors(Request $request, Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin()) {
            abort(403, 'Solo administradores pueden asignar inspectores.');
        }

        $data = $request->validate([
            'inspector_ids' => ['nullable', 'array'],
            'inspector_ids.*' => ['exists:users,id'],
        ]);

        $company->inspectors()->sync($data['inspector_ids'] ?? []);

        return back()->with('success', 'Inspectores asignados correctamente a la empresa.');
    }

    public function destroy(Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin()) {
            abort(403, 'Solo administradores pueden eliminar empresas.');
        }

        $company->delete();

        return redirect()->route('companies.index')
            ->with('success', 'Empresa enviada a la papelera (eliminación lógica).');
    }

    public function restore($id)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin()) {
            abort(403, 'Solo administradores pueden restaurar empresas.');
        }

        $company = Company::onlyTrashed()->findOrFail($id);
        $company->restore();

        return redirect()->route('companies.show', $company)
            ->with('success', 'Empresa restaurada exitosamente.');
    }

    /**
     * Normaliza los datos de ubicación GPS y procesa la foto del lugar.
     * - Si no hay coordenadas completas, se limpia toda la ubicación.
     * - Si las coordenadas cambiaron, se registra la fecha/hora de captura.
     * - Reemplaza o elimina la foto anterior del disco según corresponda.
     */
    private function applyLocation(array &$data, Request $request, ?Company $company = null): void
    {
        unset($data['location_photo'], $data['remove_location_photo']);

        if (array_key_exists('latitude', $data) || array_key_exists('longitude', $data)) {
            $lat = $data['latitude'] ?? null;
            $lng = $data['longitude'] ?? null;

            if ($lat === null || $lng === null) {
                $data['latitude'] = $data['longitude'] = $data['location_accuracy'] = null;
                $data['location_captured_at'] = null;
            } elseif (
                !$company
                || round((float) $company->latitude, 7) !== round((float) $lat, 7)
                || round((float) $company->longitude, 7) !== round((float) $lng, 7)
            ) {
                $data['location_captured_at'] = now();
            }
        }

        if ($request->hasFile('location_photo')) {
            if ($company?->location_photo) {
                Storage::disk('public')->delete($company->location_photo);
            }
            $data['location_photo'] = $request->file('location_photo')->store('company-locations', 'public');
        } elseif ($company && $request->boolean('remove_location_photo')) {
            if ($company->location_photo) {
                Storage::disk('public')->delete($company->location_photo);
            }
            $data['location_photo'] = null;
        }
    }
}
