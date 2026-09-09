<?php

namespace App\Http\Controllers;

use App\Models\CorrectiveMeasure;
use App\Models\Inspection;
use App\Models\Observation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ObservationController extends Controller
{
    public function store(Request $request, Inspection $inspection)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'type' => ['required', 'in:Hallazgo,Buena práctica,Mejora'],
            'severity' => ['required', 'in:Menor,Moderado,Mayor,Crítico'],
            'location' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'inspection_checklist_item_id' => ['nullable', 'exists:items_inspeccion,id'],
            'photos.*' => ['nullable', 'image', 'max:5120'],
            // Campos opcionales para generar de una vez la medida correctiva
            'create_measure' => ['nullable', 'boolean'],
            'measure_description' => ['required_if:create_measure,1', 'nullable', 'string'],
            'measure_priority' => ['nullable', 'in:Baja,Media,Alta,Crítica'],
            'measure_deadline' => ['nullable', 'date'],
            'measure_responsible' => ['nullable', 'string', 'max:255'],
            'measure_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $photos = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('observations', 'public');
                $photos[] = $path;
            }
        }

        $observation = Observation::create([
            'inspection_id' => $inspection->id,
            'inspection_checklist_item_id' => $data['inspection_checklist_item_id'] ?? null,
            'type' => $data['type'],
            'severity' => $data['severity'],
            'location' => $data['location'] ?? null,
            'description' => $data['description'],
            'photos' => $photos,
        ]);

        // Si se solicitó crear la medida correctiva de inmediato
        if ($request->boolean('create_measure') && !empty($data['measure_description'])) {
            CorrectiveMeasure::create([
                'inspection_id' => $inspection->id,
                'observation_id' => $observation->id,
                'description' => $data['measure_description'],
                'priority' => $data['measure_priority'] ?? ($data['severity'] === 'Crítico' ? 'Crítica' : 'Media'),
                'deadline' => $data['measure_deadline'] ?? null,
                'responsible_person' => $data['measure_responsible'] ?? null,
                'estimated_cost' => $data['measure_cost'] ?? null,
                'status' => 'Pendiente',
            ]);
        }

        return back()->with('success', 'Observación registrada exitosamente.');
    }

    public function destroy(Observation $observation)
    {
        $user = Auth::user();
        $inspection = $observation->inspection;

        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para eliminar esta observación.');
        }

        if (!empty($observation->photos)) {
            foreach ($observation->photos as $photo) {
                if (Storage::disk('public')->exists($photo)) {
                    Storage::disk('public')->delete($photo);
                }
            }
        }

        $observation->delete();

        return back()->with('success', 'Observación eliminada correctamente.');
    }
}
