<?php

namespace App\Http\Controllers;

use App\Models\CategoriaChecklist;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CategoriaChecklistController extends Controller
{
    /**
     * Muestra el listado de categorías del checklist con el conteo de ítems.
     */
    public function index(Request $request)
    {
        $categorias = CategoriaChecklist::withCount('items')
            ->orderBy('orden')
            ->orderBy('id')
            ->get();

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json($categorias);
        }

        return Inertia::render('CategoriasChecklist/Index', compact('categorias'));
    }

    /**
     * Almacena una nueva categoría de checklist en la base de datos.
     */
    public function store(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden crear categorías de checklist.');
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'icono' => ['nullable', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string'],
            'orden' => ['nullable', 'integer', 'min:0'],
        ]);

        $data['orden'] = $data['orden'] ?? (CategoriaChecklist::max('orden') + 1);

        CategoriaChecklist::create($data);

        return back()->with('success', 'Categoría de checklist registrada exitosamente.');
    }

    /**
     * Muestra el detalle de una categoría y sus ítems de checklist asociados.
     */
    public function show(CategoriaChecklist $categoriaChecklist)
    {
        $categoriaChecklist->load('items');

        return Inertia::render('CategoriasChecklist/Show', [
            'categoria' => $categoriaChecklist,
        ]);
    }

    /**
     * Actualiza la información de una categoría de checklist existente.
     */
    public function update(Request $request, CategoriaChecklist $categoriaChecklist)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden modificar categorías de checklist.');
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'icono' => ['nullable', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string'],
            'orden' => ['nullable', 'integer', 'min:0'],
        ]);

        $categoriaChecklist->update($data);

        return back()->with('success', 'Categoría de checklist actualizada exitosamente.');
    }

    /**
     * Elimina una categoría de checklist si no posee ítems vinculados.
     */
    public function destroy(CategoriaChecklist $categoriaChecklist)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden eliminar categorías de checklist.');
        }

        if ($categoriaChecklist->items()->count() > 0) {
            return back()->with('warning', 'No se puede eliminar la categoría porque tiene ítems asignados.');
        }

        $categoriaChecklist->delete();

        return back()->with('success', 'Categoría eliminada correctamente.');
    }
}