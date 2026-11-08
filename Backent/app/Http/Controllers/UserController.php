<?php

namespace App\Http\Controllers;

use App\Mail\ProfessionalStatusMail;
use App\Models\Company;
use App\Models\PortalSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();
        $focusedUserId = $request->integer('focus') ?: null;

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

        // Una notificación puede llevar a una cuenta que no estaría en la primera página.
        // La colocamos primero para poder identificarla y aprobarla sin buscarla manualmente.
        if ($focusedUserId && User::whereKey($focusedUserId)->exists()) {
            $query->orderByRaw('id = ? desc', [$focusedUserId]);
        }

        $users = $query->withCount(['inspections', 'assignedCompanies'])
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        // Si no se configuró todavía, el modo inicial se considera abierto.
        $inspectorOpenAccess = PortalSetting::read('inspector_open_access') !== '0';

        return Inertia::render('Users/Index', compact('users', 'focusedUserId', 'inspectorOpenAccess'));
    }

    public function create()
    {
        return Inertia::render('Users/Create');
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
        $user->load('assignedCompanies:id,business_name');
        $companies = Company::active()
            ->orderBy('business_name')
            ->get(['id', 'business_name', 'tax_id']);

        return Inertia::render('Users/Edit', compact('user', 'companies'));
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
            'company_ids' => ['nullable', 'array'],
            'company_ids.*' => [Rule::exists('companies', 'id')->whereNull('deleted_at')],
        ]);

        $companyIds = $data['company_ids'] ?? [];
        $shouldSyncCompanies = $request->has('company_ids') || $data['role'] !== 'inspector';
        unset($data['company_ids']);

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

        if ($shouldSyncCompanies) {
            // Las empresas se asignan únicamente a inspectores. Si el usuario
            // pasa a ser administrador se eliminan sus asignaciones vigentes.
            $user->assignedCompanies()->sync($data['role'] === 'inspector' ? $companyIds : []);
        }

        return redirect()->route('users.index')->with('success', 'Usuario actualizado exitosamente.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'No puedes deshabilitar tu propia cuenta de administrador.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        // Avisar por correo al profesional si su cuenta fue aceptada (habilitada) o no
        Mail::to($user->email)->send(new ProfessionalStatusMail($user, $user->is_active));

        $statusText = $user->is_active ? 'habilitado' : 'deshabilitado';
        return back()->with('success', "Usuario {$user->name} {$statusText} correctamente.");
    }

    /** Activa o desactiva la asignación automática de empresas al registrarse un inspector. */
    public function updateInspectorOpenAccess(Request $request)
    {
        $data = $request->validate(['enabled' => ['required', 'boolean']]);

        PortalSetting::put('inspector_open_access', $data['enabled'] ? '1' : '0');

        return back()->with(
            'success',
            $data['enabled']
                ? 'Modo de acceso inicial abierto. Los nuevos inspectores recibirán todas las empresas activas.'
                : 'Modo de acceso inicial cerrado. Los nuevos inspectores requerirán asignación manual.'
        );
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
