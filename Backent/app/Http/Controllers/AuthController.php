<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\Company;
use App\Models\PortalSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }
        return Inertia::render('Auth/Login');
    }

    public function showRegister()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'dni' => ['required', 'string', 'max:20', 'regex:/^\d+$/', 'unique:users'],
            'legajo' => ['nullable', 'string', 'max:50', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => ['nullable', 'string', 'max:50', 'regex:/^\d+$/'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $newUser = User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'dni' => $data['dni'],
            'legajo' => $data['legajo'] ?? null,
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'license_number' => $data['license_number'] ?? null,
            'role' => 'inspector', // El auto-registro solo crea Licenciados, nunca administradores
            'is_active' => false, // Debe ser aprobado por un administrador antes de poder ingresar
        ]);

        // Durante la etapa inicial, cada nuevo inspector recibe acceso a todas
        // las empresas activas para poder trabajar sin pedir asignaciones.
        if ($newUser->isInspector() && PortalSetting::read('inspector_open_access') !== '0') {
            $newUser->assignedCompanies()->sync(Company::active()->pluck('id'));
        }

        if ($request->hasFile('avatar')) {
            $newUser->avatar = $request->file('avatar')->store('avatars', 'public');
            $newUser->save();
        }

        // Avisar a todos los administradores que hay una cuenta nueva esperando aprobación
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            AppNotification::create([
                'user_id' => $admin->id,
                'title' => 'Nuevo Licenciado pendiente de aprobación',
                'message' => "{$newUser->name} ({$newUser->email}) se registró y espera que habilites su acceso.",
                'type' => 'warning',
                // Abre el listado y destaca la cuenta exacta que debe aprobarse.
                'link' => '/users?focus=' . $newUser->id,
                'is_read' => false,
            ]);
        }

        return redirect()->route('login')->with(
            'success',
            'Tu cuenta fue creada. Un administrador debe habilitarla antes de que puedas ingresar al sistema.'
        )->with('registration_completed', true);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();

            if (!$user->is_active) {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Su usuario se encuentra inactivo. Comuníquese con el administrador.',
                ])->onlyInput('email');
            }

            $request->session()->regenerate();
            return redirect()->intended(route('dashboard'))
                ->with('success', '¡Bienvenido al sistema, ' . $user->name . '!');
        }

        return back()->withErrors([
            'email' => 'Las credenciales ingresadas no coinciden con nuestros registros.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Borra el historial del navegador: con "atrás" no se puede volver al sistema
        Inertia::clearHistory();

        return redirect()->route('login')->with('success', 'Sesión cerrada correctamente.');
    }

    public function profile()
    {
        $user = Auth::user();
        return Inertia::render('Auth/Profile', compact('user'));
    }

    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'dni' => ['required', 'string', 'max:20', 'regex:/^\d+$/', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:50', 'regex:/^\d+$/'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'password' => ['nullable', 'confirmed', Password::min(6)],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $user->first_name = $data['first_name'];
        $user->last_name = $data['last_name'];
        $user->email = $data['email'];
        $user->dni = $data['dni'];
        $user->phone = $data['phone'] ?? null;
        $user->license_number = $data['license_number'] ?? null;

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $user->save();

        return back()
            ->with('success', 'Perfil actualizado exitosamente.')
            ->with('toast_id', Str::uuid()->toString());
    }

    public function updateAvatar(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->avatar = $request->file('avatar')->store('avatars', 'public');
        $user->save();

        return back()
            ->with('success', 'Foto de perfil actualizada exitosamente.')
            ->with('toast_id', Str::uuid()->toString());
    }

    public function deleteAvatar(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->avatar = null;
        $user->save();

        return back()
            ->with('success', 'Foto de perfil eliminada.')
            ->with('toast_id', Str::uuid()->toString());
    }
}
