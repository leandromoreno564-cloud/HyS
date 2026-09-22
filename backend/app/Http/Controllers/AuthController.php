<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Muestra la vista de inicio de sesión.
     */
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Procesa la autenticación del usuario.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            /** @var Usuario $usuario */
            $usuario = Auth::user();

            // Verificación adaptativa del estado activo del usuario
            $estaActivo = $usuario->activo ?? $usuario->is_active ?? true;

            if (!$estaActivo) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'email' => 'Su usuario se encuentra inactivo. Comuníquese con el administrador.',
                ])->onlyInput('email');
            }

            $request->session()->regenerate();

            $nombreMostrar = $usuario->nombre ?? $usuario->name ?? 'Usuario';

            return redirect()->intended(route('dashboard'))
                ->with('success', "¡Bienvenido al sistema, {$nombreMostrar}!");
        }

        return back()->withErrors([
            'email' => 'Las credenciales ingresadas no coinciden con nuestros registros.',
        ])->onlyInput('email');
    }

    /**
     * Cierra la sesión activa.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('info', 'Sesión cerrada correctamente.');
    }

    /**
     * Muestra la vista del perfil del usuario autenticado.
     */
    public function profile()
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        return Inertia::render('Auth/Profile', [
            'usuario' => $usuario->relationLoaded('rol') ? $usuario : $usuario->load('rol'),
        ]);
    }

    /**
     * Actualiza la información del perfil de usuario.
     */
    public function updateProfile(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $data = $request->validate([
            'nombre' => ['nullable', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:50'],
            'matricula' => ['nullable', 'string', 'max:100'],
            'numero_matricula' => ['nullable', 'string', 'max:100'],
            'password' => ['nullable', 'confirmed', Password::min(6)],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        // Asignación bilingüe adaptativa de atributos del usuario
        $nombre = $data['nombre'] ?? $data['name'] ?? null;
        if ($nombre) {
            if (isset($usuario->nombre) || array_key_exists('nombre', $usuario->getAttributes())) {
                $usuario->nombre = $nombre;
            }
            if (isset($usuario->name) || array_key_exists('name', $usuario->getAttributes())) {
                $usuario->name = $nombre;
            }
        }

        $telefono = $data['telefono'] ?? $data['phone'] ?? null;
        if ($telefono !== null) {
            if (isset($usuario->telefono) || array_key_exists('telefono', $usuario->getAttributes())) {
                $usuario->telefono = $telefono;
            }
            if (isset($usuario->phone) || array_key_exists('phone', $usuario->getAttributes())) {
                $usuario->phone = $telefono;
            }
        }

        $matricula = $data['matricula'] ?? $data['numero_matricula'] ?? null;
        if ($matricula !== null) {
            if (isset($usuario->matricula) || array_key_exists('matricula', $usuario->getAttributes())) {
                $usuario->matricula = $matricula;
            }
            if (isset($usuario->numero_matricula) || array_key_exists('numero_matricula', $usuario->getAttributes())) {
                $usuario->numero_matricula = $matricula;
            }
        }

        if (!empty($data['password'])) {
            $usuario->password = Hash::make($data['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($usuario->avatar && Storage::disk('public')->exists($usuario->avatar)) {
                Storage::disk('public')->delete($usuario->avatar);
            }
            $usuario->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $usuario->save();

        return back()->with('success', 'Perfil actualizado exitosamente.');
    }
}