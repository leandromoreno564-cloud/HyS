<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use App\Models\InspectionChecklistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ChecklistController extends Controller
{
    public function updateItem(Request $request, Inspection $inspection, InspectionChecklistItem $item)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'status' => ['required', 'in:Cumple,No Cumple,No Aplica,Pendiente'],
            'risk_level' => ['required', 'in:Bajo,Medio,Alto'],
            'notes' => ['nullable', 'string'],
            'photos.*' => ['nullable', 'image', 'max:5120'], // hasta 5MB por foto
        ]);

        $photos = $item->photos ?? [];

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('evidence', 'public');
                $photos[] = $path;
            }
        }

        $item->update([
            'status' => $data['status'],
            'risk_level' => $data['risk_level'],
            'notes' => $data['notes'],
            'photos' => $photos,
        ]);

        $inspection->calculateProgress();

        return back()->with('success', 'Ítem del checklist actualizado correctamente.');
    }

    public function addItem(Request $request, Inspection $inspection)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'category_name' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:500'],
            'normative_reference' => ['nullable', 'string', 'max:255'],
            'verification_method' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:Cumple,No Cumple,No Aplica,Pendiente'],
            'risk_level' => ['required', 'in:Bajo,Medio,Alto'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['inspection_id'] = $inspection->id;
        $data['is_custom'] = true;

        InspectionChecklistItem::create($data);

        $inspection->calculateProgress();

        return back()->with('success', 'Ítem personalizado agregado al checklist de la inspección.');
    }

    public function destroyItem(Inspection $inspection, InspectionChecklistItem $item)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        // Eliminar fotos asociadas
        if (!empty($item->photos)) {
            foreach ($item->photos as $photo) {
                if (Storage::disk('public')->exists($photo)) {
                    Storage::disk('public')->delete($photo);
                }
            }
        }

        $item->delete();
        $inspection->calculateProgress();

        return back()->with('success', 'Ítem del checklist eliminado.');
    }
}