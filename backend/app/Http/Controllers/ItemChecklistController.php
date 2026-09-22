<?php

namespace App\Http\Controllers;

use App\Models\CategoriaChecklist;
use App\Models\ItemChecklist;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ItemChecklistController extends Controller
{
    /**
     * Muestra el listado de ítems de checklist con filtros por categoría, sector o búsqueda.
     */
    public function index(Request $request)
    {
        $query = ItemChecklist::with('categoria');

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->input('categoria_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                  ->orWhere('codigo', 'like', "%{$search}%")
                  ->orWhere('referencia_normativa', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sector')) {
            $query->where('sector_industrial', $request->input('sector'));
        }

        $items = $query->orderBy('categoria_id')->orderBy('id')->get();
        $categorias = CategoriaChecklist::orderBy('orden')->get();

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json($items);
        }

        return Inertia::render('ItemsChecklist/Index', compact('items', 'categorias'));
    }

    /**
     * Almacena un nuevo ítem maestro de checklist.
     */
    public function store(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden crear ítems de checklist.');
        }

        $data = $request->validate([
            'categoria_id' => ['required', 'exists:categoria_checklists,id'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'titulo' => ['required', 'string', 'max:500'],
            'descripcion' => ['nullable', 'string'],
            'referencia_normativa' => ['nullable', 'string', 'max:255'],
            'metodo_verificacion' => ['nullable', 'string', 'max:255'],
            'nivel_riesgo_defecto' => ['required', 'in:Bajo,Medio,Alto'],
            'sector_industrial' => ['nullable', 'string', 'max:100'],
            'tipo_inspeccion' => ['nullable', 'in:General,Específica,Seguimiento'],
            'activo' => ['boolean'],
        ]);

        $data['activo'] = $request->boolean('activo', true);

        ItemChecklist::create($data);

        return back()->with('success', 'Ítem de checklist registrado exitosamente.');
    }

    /**
     * Muestra el detalle de un ítem de checklist.
     */
    public function show(ItemChecklist $itemChecklist)
    {
        $itemChecklist->load('categoria');

        return response()->json($itemChecklist);
    }

    /**
     * Actualiza la información de un ítem de checklist.
     */
    public function update(Request $request, ItemChecklist $itemChecklist)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden modificar ítems de checklist.');
        }

        $data = $request->validate([
            'categoria_id' => ['required', 'exists:categoria_checklists,id'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'titulo' => ['required', 'string', 'max:500'],
            'descripcion' => ['nullable', 'string'],
            'referencia_normativa' => ['nullable', 'string', 'max:255'],
            'metodo_verificacion' => ['nullable', 'string', 'max:255'],
            'nivel_riesgo_defecto' => ['required', 'in:Bajo,Medio,Alto'],
            'sector_industrial' => ['nullable', 'string', 'max:100'],
            'tipo_inspeccion' => ['nullable', 'in:General,Específica,Seguimiento'],
            'activo' => ['boolean'],
        ]);

        $data['activo'] = $request->boolean('activo');

        $itemChecklist->update($data);

        return back()->with('success', 'Ítem de checklist actualizado exitosamente.');
    }

    /**
     * Elimina un ítem maestro de checklist.
     */
    public function destroy(ItemChecklist $itemChecklist)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden eliminar ítems de checklist.');
        }

        $itemChecklist->delete();

        return back()->with('success', 'Ítem de checklist eliminado correctamente.');
    }
}