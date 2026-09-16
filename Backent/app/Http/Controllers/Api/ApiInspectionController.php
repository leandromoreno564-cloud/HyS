<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Inspection;
use App\Models\InspectionChecklistItem;
use App\Models\Observation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ApiInspectionController extends Controller
{
    /**
     * Listar inspecciones asignadas al inspector autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Inspection::with(['company:id,razon_social,cuit,direccion,sector'])
            ->accessibleBy($user);

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        } elseif ($request->filled('status')) {
            $query->where('estado', $request->input('status'));
        }

        $inspections = $query->latest('fecha_inicio')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $inspections,
        ]);
    }

    /**
     * Detalle completo de una inspección (checklist, empresa, observaciones).
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $inspection = Inspection::with([
            'company',
            'checklistItems' => function ($q) {
                $q->orderBy('id', 'asc');
            },
            'observations',
            'correctiveMeasures',
        ])->accessibleBy($user)->findOrFail($id);

        // Agrupar items de checklist por categoría para la interfaz de Android
        $groupedChecklist = $inspection->checklistItems->groupBy('categoria_nombre');

        return response()->json([
            'success' => true,
            'inspection' => $inspection,
            'grouped_checklist' => $groupedChecklist,
            'stats' => $inspection->getComplianceStats(),
        ]);
    }

    /**
     * Evaluar un ítem del checklist desde Android.
     */
    public function updateChecklistItem(Request $request, $inspectionId, $itemId): JsonResponse
    {
        $user = $request->user();

        $inspection = Inspection::accessibleBy($user)->findOrFail($inspectionId);

        $item = InspectionChecklistItem::where('inspeccion_id', $inspection->id)
            ->findOrFail($itemId);

        $data = $request->validate([
            'estado' => ['required', 'in:Cumple,No Cumple,No Aplica,Pendiente'],
            'observacion' => ['nullable', 'string'],
            'nivel_riesgo' => ['nullable', 'in:Bajo,Medio,Alto,Crítico'],
            'notas' => ['nullable', 'string'],
        ]);

        $item->update($data);

        // Si es "No Cumple" y se envía observación, podemos crear o vincular una observación
        if ($data['estado'] === 'No Cumple' && !empty($data['observacion'])) {
            Observation::firstOrCreate(
                [
                    'inspeccion_id' => $inspection->id,
                    'item_inspeccion_id' => $item->id,
                ],
                [
                    'tipo' => 'Hallazgo Negativo',
                    'severidad' => $data['nivel_riesgo'] ?? 'Medio',
                    'descripcion' => $data['observacion'],
                ]
            );
        }

        // Recalcular progreso
        $progress = $inspection->calculateProgress();

        return response()->json([
            'success' => true,
            'message' => 'Ítem actualizado correctamente',
            'item' => $item,
            'progress_percentage' => $progress,
            'stats' => $inspection->getComplianceStats(),
        ]);
    }

    /**
     * Subir evidencia fotográfica tomada con la cámara de Android (multipart/form-data).
     * Soporta subida individual ('foto' o 'file') o en lote ('fotos' como array de imágenes).
     */
    public function uploadEvidence(Request $request, $inspectionId): JsonResponse
    {
        $user = $request->user();

        $inspection = Inspection::accessibleBy($user)->findOrFail($inspectionId);

        $request->validate([
            'foto' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
            'fotos' => ['nullable', 'array'],
            'fotos.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
            'file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
            'item_inspeccion_id' => ['nullable', 'exists:items_inspeccion,id'],
            'observacion_id' => ['nullable', 'exists:observacions,id'],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'severidad' => ['nullable', 'in:Bajo,Medio,Alto,Crítico'],
            'ubicacion' => ['nullable', 'string', 'max:255'],
        ]);

        // Recolectar todos los archivos enviados (sea uno solo o múltiples)
        $uploadedFiles = [];
        if ($request->hasFile('fotos')) {
            $uploadedFiles = $request->file('fotos');
        } elseif ($request->hasFile('foto')) {
            $uploadedFiles = [$request->file('foto')];
        } elseif ($request->hasFile('file')) {
            $uploadedFiles = [$request->file('file')];
        }

        if (empty($uploadedFiles)) {
            return response()->json([
                'success' => false,
                'message' => 'No se recibió ninguna imagen para subir.',
            ], 422);
        }

        $savedPaths = [];
        $savedUrls = [];

        foreach ($uploadedFiles as $file) {
            $path = $file->store('evidencias/' . $inspection->id, 'public');
            $savedPaths[] = $path;
            $savedUrls[] = Storage::disk('public')->url($path);
        }

        $itemId = $request->input('item_inspeccion_id');
        $obsId = $request->input('observacion_id');

        // 1. Si está vinculado a un ítem de inspección, actualizar su array de fotos
        if ($itemId) {
            $item = InspectionChecklistItem::where('inspeccion_id', $inspection->id)->find($itemId);
            if ($item) {
                $currentFotos = is_array($item->fotos) ? $item->fotos : [];
                $item->fotos = array_values(array_unique(array_merge($currentFotos, $savedPaths)));
                $item->save();
            }
        }

        // 2. Si se especificó una observación existente, anexar las fotos
        if ($obsId) {
            $observation = Observation::where('inspeccion_id', $inspection->id)->find($obsId);
            if ($observation) {
                $currentFotos = is_array($observation->fotos) ? $observation->fotos : [];
                $observation->fotos = array_values(array_unique(array_merge($currentFotos, $savedPaths)));
                if ($request->filled('descripcion')) {
                    $observation->descripcion = $request->input('descripcion');
                }
                $observation->save();
            }
        } else {
            // Si no existe observación previa, crear una nueva con el lote de fotos
            $observation = Observation::create([
                'inspeccion_id' => $inspection->id,
                'item_inspeccion_id' => $itemId,
                'tipo' => 'Evidencia Fotográfica',
                'severidad' => $request->input('severidad', 'Medio'),
                'ubicacion' => $request->input('ubicacion'),
                'descripcion' => $request->input('descripcion', 'Evidencia capturada con la cámara en campo'),
                'fotos' => $savedPaths,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => count($savedPaths) === 1 ? 'Foto subida correctamente' : count($savedPaths) . ' fotos subidas correctamente',
            'paths' => $savedPaths,
            'urls' => $savedUrls,
            'observation' => $observation ?? null,
        ], 201);
    }

    /**
     * Finalizar auditoría y registrar firmas digitales desde Android.
     */
    public function finalize(Request $request, $inspectionId): JsonResponse
    {
        $user = $request->user();

        $inspection = Inspection::accessibleBy($user)->findOrFail($inspectionId);

        $data = $request->validate([
            'firma_inspector' => ['nullable', 'string'], // base64 data URL
            'firma_empresa' => ['nullable', 'string'],   // base64 data URL
            'nombre_firmante_empresa' => ['nullable', 'string', 'max:255'],
            'observaciones_generales' => ['nullable', 'string'],
        ]);

        $inspection->update([
            'estado' => 'Completada',
            'fecha_fin' => now(),
            'end_time' => now()->format('H:i:s'),
            'firma_inspector' => $data['firma_inspector'] ?? $inspection->firma_inspector,
            'firma_empresa' => $data['firma_empresa'] ?? $inspection->firma_empresa,
            'nombre_firmante_empresa' => $data['nombre_firmante_empresa'] ?? $inspection->nombre_firmante_empresa,
            'observaciones_generales' => $data['observaciones_generales'] ?? $inspection->observaciones_generales,
            'porcentaje_avance' => 100,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inspección finalizada exitosamente.',
            'inspection' => $inspection->fresh(['company']),
            'verification_token' => $inspection->token,
            'report_url' => route('reports.verify', $inspection->token),
        ]);
    }
}
