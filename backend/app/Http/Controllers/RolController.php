<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RolController extends Controller
{
    /**
     * Muestra el listado de roles registrados con el conteo de usuarios asignados.
     */
    public function index(Request $request)
    {
        $roles = Rol::withCount('usuarios')->orderBy('id')->get();

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json($roles);
        }

        return Inertia::render('Roles/Index', compact('roles'));
    }

    /**
     * Almacena un nuevo rol en el sistema.
     */
    public function store(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden crear nuevos roles.');
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:roles,nombre'],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ]);

        Rol::create($data);

        return back()->with('success', 'Rol registrado exitosamente.');
    }

    /**
     * Muestra la información de un rol específico y sus usuarios vinculados.
     */
    public function show(Rol $rol)
    {
        $rol->load('usuarios');

        return response()->json($rol);
    }

    /**
     * Actualiza la información de un rol existente.
     */
    public function update(Request $request, Rol $rol)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden modificar roles.');
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100', Rule::unique('roles', 'nombre')->ignore($rol->id)],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ]);

        $rol->update($data);

        return back()->with('success', 'Rol actualizado exitosamente.');
    }

    /**
     * Elimina un rol siempre que no sea un rol base del sistema ni tenga usuarios vinculados.
     */
    public function destroy(Rol $rol)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden eliminar roles.');
        }

        // Impedir la eliminación de los roles base (1: Admin, 2: Inspector)
        if (in_array($rol->id, [1, 2])) {
            return back()->with('error', 'No se pueden eliminar los roles base del sistema.');
        }

        if ($rol->usuarios()->count() > 0) {
            return back()->with('warning', 'No se puede eliminar el rol porque tiene usuarios asignados.');
        }

        $rol->delete();

        return back()->with('success', 'Rol eliminado correctamente.');
    }
}