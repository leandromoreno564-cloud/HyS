<?php

namespace App\Http\Controllers;

use App\Models\Inspeccion;
use App\Models\ItemInspeccion;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ItemInspeccionController extends Controller
{
    /**
     * Actualiza el estado, riesgo, observaciones y fotos de un ítem evaluado.
     */
    public function actualizarItem(Request $request, Inspeccion $inspeccion, ItemInspeccion $item)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'estado' => ['required', 'in:Cumple,No Cumple,No Aplica,Pendiente'],
            'nivel_riesgo' => ['required', 'in:Bajo,Medio,Alto'],
            'notas' => ['nullable', 'string'],
            'fotos.*' => ['nullable', 'image', 'max:5120'], // hasta 5MB por foto
        ]);

        $fotos = $item->fotos ?? [];

        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $foto) {
                $path = $foto->store('evidencias', 'public');
                $fotos[] = $path;
            }
        }

        $item->update([
            'estado' => $data['estado'],
            'nivel_riesgo' => $data['nivel_riesgo'],
            'notas' => $data['notas'] ?? null,
            'fotos' => $fotos,
        ]);

        $avance = $inspeccion->calcularAvance();

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Ítem actualizado correctamente',
                'progreso' => $avance,
                'estadisticas' => $inspeccion->obtenerEstadisticasCumplimiento(),
            ]);
        }

        return back()->with('success', 'Ítem del checklist actualizado correctamente.');
    }

    /**
     * Agrega un ítem personalizado directamente al checklist de la inspección.
     */
    public function agregarItem(Request $request, Inspeccion $inspeccion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'categoria_nombre' => ['required', 'string', 'max:255'],
            'titulo' => ['required', 'string', 'max:500'],
            'referencia_normativa' => ['nullable', 'string', 'max:255'],
            'metodo_verificacion' => ['nullable', 'string', 'max:255'],
            'estado' => ['required', 'in:Cumple,No Cumple,No Aplica,Pendiente'],
            'nivel_riesgo' => ['required', 'in:Bajo,Medio,Alto'],
            'notas' => ['nullable', 'string'],
        ]);

        $data['inspeccion_id'] = $inspeccion->id;
        $data['es_personalizado'] = true;

        ItemInspeccion::create($data);

        $inspeccion->calcularAvance();

        return back()->with('success', 'Ítem personalizado agregado al checklist de la inspección.');
    }

    /**
     * Elimina un ítem del checklist y sus fotografías asociadas.
     */
    public function eliminarItem(Inspeccion $inspeccion, ItemInspeccion $item)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        if (!empty($item->fotos)) {
            foreach ($item->fotos as $foto) {
                if (Storage::disk('public')->exists($foto)) {
                    Storage::disk('public')->delete($foto);
                }
            }
        }

        $item->delete();
        $inspeccion->calcularAvance();

        return back()->with('success', 'Ítem del checklist eliminado.');
    }
}