<?php

namespace App\Http\Controllers;

use App\Models\CorrectiveMeasure;
use App\Models\Inspection;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CorrectiveMeasureController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $query = CorrectiveMeasure::with(['inspection.company', 'inspection.user', 'observation']);

        // Filtrar por permisos
        if (!$user->isAdmin()) {
            $query->whereHas('inspection', function ($q) use ($user) {
                $q->where('inspector_id', $user->id)
                  ->orWhereHas('company', function ($cq) use ($user) {
                      $cq->where('creado_por', $user->id)
                         ->orWhereHas('inspectors', function ($iq) use ($user) {
                             $iq->where('usuarios.id', $user->id);
                         });
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('estado', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('prioridad', $request->input('priority'));
        }

        if ($request->boolean('overdue')) {
            $query->whereIn('estado', ['Pendiente', 'En Progreso'])
                  ->whereNotNull('fecha_limite')
                  ->where('fecha_limite', '<', Carbon::today());
        }

        $measures = $query->orderByRaw("CASE 
            WHEN prioridad = 'Crítica' THEN 1 
            WHEN prioridad = 'Alta' THEN 2 
            WHEN prioridad = 'Media' THEN 3 
            ELSE 4 END")
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        $totalCount = (clone $query)->count();
        $pendingCount = CorrectiveMeasure::whereIn('estado', ['Pendiente', 'En Progreso'])->count();
        $overdueCount = CorrectiveMeasure::whereIn('estado', ['Pendiente', 'En Progreso'])
            ->whereNotNull('fecha_limite')
            ->where('fecha_limite', '<', Carbon::today())
            ->count();

        return Inertia::render('CorrectiveMeasures/Index', compact('measures', 'totalCount', 'pendingCount', 'overdueCount'));
    }

    public function store(Request $request, Inspection $inspection)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'description' => ['required', 'string'],
            'priority' => ['required', 'in:Baja,Media,Alta,Crítica'],
            'recommendations' => ['nullable', 'string'],
            'deadline' => ['nullable', 'date'],
            'responsible_person' => ['nullable', 'string', 'max:255'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'observation_id' => ['nullable', 'exists:observacions,id'],
        ]);

        $data['inspection_id'] = $inspection->id;
        $data['status'] = 'Pendiente';

        CorrectiveMeasure::create($data);

        return back()->with('success', 'Medida correctiva registrada exitosamente.');
    }

    public function updateStatus(Request $request, CorrectiveMeasure $measure)
    {
        $data = $request->validate([
            'status' => ['required', 'in:Pendiente,En Progreso,Completada,Vencida,Cancelada'],
            'verification_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($data['status'] === 'Completada' && empty($data['verification_date'])) {
            $data['verification_date'] = Carbon::today();
        }

        $measure->update($data);

        return back()->with('success', "Estado de la medida correctiva actualizado a '{$data['status']}'.");
    }

    public function destroy(CorrectiveMeasure $measure)
    {
        $user = Auth::user();
        $inspection = $measure->inspection;

        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para eliminar esta medida.');
        }

        $measure->delete();

        return back()->with('success', 'Medida correctiva eliminada.');
    }
}
