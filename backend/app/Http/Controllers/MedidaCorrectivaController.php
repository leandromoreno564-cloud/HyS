<?php

namespace App\Http\Controllers;

use App\Models\Inspeccion;
use App\Models\MedidaCorrectiva;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MedidaCorrectivaController extends Controller
{
    /**
     * Muestra el listado de medidas correctivas con filtros y contadores.
     */
    public function index(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $query = MedidaCorrectiva::with(['inspeccion.empresa', 'inspeccion.inspector', 'observacion']);

        // Filtrar por permisos del usuario
        if (!$usuario->esAdmin()) {
            $query->whereHas('inspeccion', function ($q) use ($usuario) {
                $q->where('inspector_id', $usuario->id)
                  ->orWhereHas('empresa', function ($cq) use ($usuario) {
                      $cq->where('creado_por', $usuario->id)
                         ->orWhereHas('usuarios', function ($iq) use ($usuario) {
                             $iq->where('usuarios.id', $usuario->id);
                         });
                  });
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        if ($request->filled('prioridad')) {
            $query->where('prioridad', $request->input('prioridad'));
        }

        if ($request->boolean('vencidas')) {
            $query->whereIn('estado', ['Pendiente', 'En Progreso'])
                  ->whereNotNull('fecha_limite')
                  ->where('fecha_limite', '<', Carbon::today());
        }

        $medidas = (clone $query)->orderByRaw("CASE 
            WHEN prioridad = 'Crítica' THEN 1 
            WHEN prioridad = 'Alta' THEN 2 
            WHEN prioridad = 'Media' THEN 3 
            ELSE 4 END")
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        $total = (clone $query)->count();
        $pendientes = (clone $query)->whereIn('estado', ['Pendiente', 'En Progreso'])->count();
        $vencidas = (clone $query)->whereIn('estado', ['Pendiente', 'En Progreso'])
            ->whereNotNull('fecha_limite')
            ->where('fecha_limite', '<', Carbon::today())
            ->count();

        return Inertia::render('MedidasCorrectivas/Index', compact('medidas', 'total', 'pendientes', 'vencidas'));
    }

    /**
     * Registra una nueva medida correctiva asociada a una inspección.
     */
    public function store(Request $request, Inspeccion $inspeccion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'descripcion' => ['required', 'string'],
            'prioridad' => ['required', 'in:Baja,Media,Alta,Crítica'],
            'recomendaciones' => ['nullable', 'string'],
            'fecha_limite' => ['nullable', 'date'],
            'responsable' => ['nullable', 'string', 'max:255'],
            'costo_estimado' => ['nullable', 'numeric', 'min:0'],
            'observacion_id' => ['nullable', 'exists:observacions,id'],
        ]);

        $data['inspeccion_id'] = $inspeccion->id;
        $data['estado'] = 'Pendiente';

        MedidaCorrectiva::create($data);

        return back()->with('success', 'Medida correctiva registrada exitosamente.');
    }

    /**
     * Actualiza el estado y fecha de verificación de una medida correctiva.
     */
    public function actualizarEstado(Request $request, MedidaCorrectiva $medida)
    {
        $data = $request->validate([
            'estado' => ['required', 'in:Pendiente,En Progreso,Completada,Vencida,Cancelada'],
            'fecha_verificacion' => ['nullable', 'date'],
            'notas' => ['nullable', 'string'],
        ]);

        if ($data['estado'] === 'Completada' && empty($data['fecha_verificacion'])) {
            $data['fecha_verificacion'] = Carbon::today();
        }

        $medida->update($data);

        return back()->with('success', "Estado de la medida correctiva actualizado a '{$data['estado']}'.");
    }

    /**
     * Elimina una medida correctiva.
     */
    public function destroy(MedidaCorrectiva $medida)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();
        $inspeccion = $medida->inspeccion;

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para eliminar esta medida.');
        }

        $medida->delete();

        return back()->with('success', 'Medida correctiva eliminada.');
    }
}