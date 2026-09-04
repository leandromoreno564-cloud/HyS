<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('license_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $users = $query->withCount(['inspections', 'assignedCompanies'])
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return view('users.index', compact('users'));
    }

    public function create()
    {
        return view('users.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', Password::min(6)],
            'role' => ['required', 'in:admin,inspector'],
            'phone' => ['nullable', 'string', 'max:50'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        $data['password'] = Hash::make($data['password']);
        $data['is_active'] = $request->boolean('is_active', true);

        User::create($data);

        return redirect()->route('users.index')->with('success', 'Usuario registrado exitosamente.');
    }

    public function edit(User $user)
    {
        return view('users.edit', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', Password::min(6)],
            'role' => ['required', 'in:admin,inspector'],
            'phone' => ['nullable', 'string', 'max:50'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $data['is_active'] = $request->boolean('is_active');

        // Impedir que el admin se desactive o quite el rol de admin a sí mismo
        if ($user->id === Auth::id()) {
            $data['is_active'] = true;
            $data['role'] = 'admin';
        }

        $user->update($data);

        return redirect()->route('users.index')->with('success', 'Usuario actualizado exitosamente.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'No puedes deshabilitar tu propia cuenta de administrador.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $statusText = $user->is_active ? 'habilitado' : 'deshabilitado';
        return back()->with('success', "Usuario {$user->name} {$statusText} correctamente.");
    }

    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'No puedes eliminar tu propia cuenta.');
        }

        $user->delete();
        return redirect()->route('users.index')->with('success', 'Usuario eliminado correctamente.');
    }
}
