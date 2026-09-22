<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    /**
     * Muestra el listado de usuarios del sistema con filtros de búsqueda.
     */
    public function index(Request $request)
    {
        $query = Usuario::query()->with('rol');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('matricula', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('estado')) {
            $query->where('activo', $request->input('estado') === 'activo');
        }

        $usuarios = $query->withCount(['inspecciones', 'empresas'])
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Usuarios/Index', compact('usuarios'));
    }

    /**
     * Muestra el formulario para registrar un nuevo usuario.
     */
    public function create()
    {
        return Inertia::render('Usuarios/Create');
    }

    /**
     * Almacena un nuevo usuario en la base de datos.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:usuarios,email'],
            'password' => ['required', Password::min(6)],
            'role' => ['required', 'in:admin,inspector'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'matricula' => ['nullable', 'string', 'max:100'],
            'activo' => ['boolean'],
        ]);

        $data['password'] = Hash::make($data['password']);
        $data['activo'] = $request->boolean('activo', true);
        $data['rol_id'] = ($data['role'] === 'admin') ? 1 : 2;

        Usuario::create($data);

        return redirect()->route('usuarios.index')->with('success', 'Usuario registrado exitosamente.');
    }

    /**
     * Muestra el formulario para editar un usuario.
     */
    public function edit(Usuario $usuario)
    {
        return Inertia::render('Usuarios/Edit', compact('usuario'));
    }

    /**
     * Actualiza la información de un usuario.
     */
    public function update(Request $request, Usuario $usuario)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('usuarios', 'email')->ignore($usuario->id)],
            'password' => ['nullable', Password::min(6)],
            'role' => ['required', 'in:admin,inspector'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'matricula' => ['nullable', 'string', 'max:100'],
            'activo' => ['boolean'],
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $data['activo'] = $request->boolean('activo');
        $data['rol_id'] = ($data['role'] === 'admin') ? 1 : 2;

        // Impedir que el administrador se desactive o quite su propio rol de admin
        if ($usuario->id === Auth::id()) {
            $data['activo'] = true;
            $data['role'] = 'admin';
            $data['rol_id'] = 1;
        }

        $usuario->update($data);

        return redirect()->route('usuarios.index')->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Alterna el estado activo/inactivo de un usuario.
     */
    public function alternarEstado(Usuario $usuario)
    {
        if ($usuario->id === Auth::id()) {
            return back()->with('error', 'No puedes deshabilitar tu propia cuenta de administrador.');
        }

        $usuario->activo = !$usuario->activo;
        $usuario->save();

        $estadoTexto = $usuario->activo ? 'habilitado' : 'deshabilitado';
        return back()->with('success', "Usuario {$usuario->nombre} {$estadoTexto} correctamente.");
    }

    /**
     * Elimina lógicamente a un usuario.
     */
    public function destroy(Usuario $usuario)
    {
        if ($usuario->id === Auth::id()) {
            return back()->with('error', 'No puedes eliminar tu propia cuenta.');
        }

        $usuario->delete();

        return redirect()->route('usuarios.index')->with('success', 'Usuario eliminado correctamente.');
    }
}