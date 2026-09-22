<?php

namespace App\Http\Controllers;

use App\Models\Inspeccion;
use App\Models\MedidaCorrectiva;
use App\Models\Observacion;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ObservacionController extends Controller
{
    /**
     * Almacena una nueva observación/hallazgo y opcionalmente su medida correctiva.
     */
    public function store(Request $request, Inspeccion $inspeccion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'tipo' => ['required', 'in:Hallazgo,Buena práctica,Mejora'],
            'severidad' => ['required', 'in:Menor,Moderado,Mayor,Crítico'],
            'ubicacion' => ['nullable', 'string', 'max:255'],
            'descripcion' => ['required', 'string'],
            'item_inspeccion_id' => ['nullable', 'exists:items_inspeccion,id'],
            'fotos.*' => ['nullable', 'image', 'max:5120'],
            // Campos opcionales para generar de una vez la medida correctiva
            'crear_medida' => ['nullable', 'boolean'],
            'medida_descripcion' => ['required_if:crear_medida,1', 'nullable', 'string'],
            'medida_prioridad' => ['nullable', 'in:Baja,Media,Alta,Crítica'],
            'medida_fecha_limite' => ['nullable', 'date'],
            'medida_responsable' => ['nullable', 'string', 'max:255'],
            'medida_costo' => ['nullable', 'numeric', 'min:0'],
        ]);

        $fotos = [];
        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $foto) {
                $path = $foto->store('observaciones', 'public');
                $fotos[] = $path;
            }
        }

        $observacion = Observacion::create([
            'inspeccion_id' => $inspeccion->id,
            'item_inspeccion_id' => $data['item_inspeccion_id'] ?? null,
            'tipo' => $data['tipo'],
            'severidad' => $data['severidad'],
            'ubicacion' => $data['ubicacion'] ?? null,
            'descripcion' => $data['descripcion'],
            'fotos' => $fotos,
        ]);

        // Si se solicitó crear la medida correctiva de inmediato
        if ($request->boolean('crear_medida') && !empty($data['medida_descripcion'])) {
            MedidaCorrectiva::create([
                'inspeccion_id' => $inspeccion->id,
                'observacion_id' => $observacion->id,
                'descripcion' => $data['medida_descripcion'],
                'prioridad' => $data['medida_prioridad'] ?? ($data['severidad'] === 'Crítico' ? 'Crítica' : 'Media'),
                'fecha_limite' => $data['medida_fecha_limite'] ?? null,
                'responsable' => $data['medida_responsable'] ?? null,
                'costo_estimado' => $data['medida_costo'] ?? null,
                'estado' => 'Pendiente',
            ]);
        }

        return back()->with('success', 'Observación registrada exitosamente.');
    }

    /**
     * Elimina una observación y sus archivos adjuntos.
     */
    public function destroy(Observacion $observacion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();
        $inspeccion = $observacion->inspeccion;

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para eliminar esta observación.');
        }

        if (!empty($observacion->fotos)) {
            foreach ($observacion->fotos as $foto) {
                if (Storage::disk('public')->exists($foto)) {
                    Storage::disk('public')->delete($foto);
                }
            }
        }

        $observacion->delete();

        return back()->with('success', 'Observación eliminada correctamente.');
    }
}