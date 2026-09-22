<?php

namespace App\Http\Controllers;

use App\Models\Evidencia;
use App\Models\Inspeccion;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class EvidenciaController extends Controller
{
    /**
     * Muestra el listado de evidencias filtradas por inspección, observación o ítem.
     */
    public function index(Request $request)
    {
        $query = Evidencia::with(['inspeccion', 'observacion', 'itemInspeccion']);

        if ($request->filled('inspeccion_id')) {
            $query->where('inspeccion_id', $request->input('inspeccion_id'));
        }

        if ($request->filled('observacion_id')) {
            $query->where('observacion_id', $request->input('observacion_id'));
        }

        if ($request->filled('item_inspeccion_id')) {
            $query->where('item_inspeccion_id', $request->input('item_inspeccion_id'));
        }

        $evidencias = $query->latest()->get();

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json($evidencias);
        }

        return back()->with('evidencias', $evidencias);
    }

    /**
     * Sube y almacena un archivo de evidencia fotográfica o documental en disco public.
     */
    public function store(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $data = $request->validate([
            'inspeccion_id' => ['required', 'exists:inspecciones,id'],
            'observacion_id' => ['nullable', 'exists:observacions,id'],
            'item_inspeccion_id' => ['nullable', 'exists:items_inspeccion,id'],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'archivo' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf,doc,docx', 'max:10240'], // Máximo 10MB
        ]);

        $inspeccion = Inspeccion::findOrFail($data['inspeccion_id']);

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para adjuntar evidencias en esta inspección.');
        }

        $file = $request->file('archivo');
        $path = $file->store('evidencias', 'public');

        $evidencia = Evidencia::create([
            'inspeccion_id' => $data['inspeccion_id'],
            'observacion_id' => $data['observacion_id'] ?? null,
            'item_inspeccion_id' => $data['item_inspeccion_id'] ?? null,
            'archivo_path' => $path,
            'nombre_original' => $file->getClientOriginalName(),
            'tipo_mime' => $file->getClientMimeType(),
            'descripcion' => $data['descripcion'] ?? null,
        ]);

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Evidencia subida correctamente.',
                'evidencia' => $evidencia,
            ]);
        }

        return back()->with('success', 'Evidencia adjuntada exitosamente.');
    }

    /**
     * Retorna los datos de una evidencia específica.
     */
    public function show(Evidencia $evidencia)
    {
        $evidencia->load(['inspeccion', 'observacion', 'itemInspeccion']);

        return response()->json($evidencia);
    }

    /**
     * Actualiza la descripción metadato de una evidencia.
     */
    public function update(Request $request, Evidencia $evidencia)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();
        $inspeccion = $evidencia->inspeccion;

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para modificar esta evidencia.');
        }

        $data = $request->validate([
            'descripcion' => ['nullable', 'string', 'max:500'],
        ]);

        $evidencia->update($data);

        return back()->with('success', 'Descripción de la evidencia actualizada.');
    }

    /**
     * Elimina el archivo físico de Storage y remueve el registro de la base de datos.
     */
    public function destroy(Evidencia $evidencia)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();
        $inspeccion = $evidencia->inspeccion;

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para eliminar esta evidencia.');
        }

        if (Storage::disk('public')->exists($evidencia->archivo_path)) {
            Storage::disk('public')->delete($evidencia->archivo_path);
        }

        $evidencia->delete();

        return back()->with('success', 'Evidencia eliminada correctamente.');
    }
}