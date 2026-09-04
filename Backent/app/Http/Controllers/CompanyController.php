<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $query = Company::accessibleBy($user)->with(['creator', 'inspectors']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('tax_id', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sector')) {
            $query->where('industry_sector', $request->input('sector'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        // Si el admin pide ver papelera
        if ($user->isAdmin() && $request->boolean('trashed')) {
            $query->onlyTrashed();
        }

        $companies = $query->withCount('inspections')
            ->orderBy('business_name')
            ->paginate(10)
            ->withQueryString();

        $sectors = Company::select('industry_sector')
            ->distinct()
            ->pluck('industry_sector');

        return view('companies.index', compact('companies', 'sectors'));
    }

    public function create()
    {
        $inspectors = User::where('role', 'inspector')->where('is_active', true)->get();
        return view('companies.create', compact('inspectors'));
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'tax_id' => ['required', 'string', 'max:50', 'unique:companies,tax_id'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'industry_sector' => ['required', 'string', 'max:100'],
            'employee_count' => ['required', 'integer', 'min:1'],
            'website' => ['nullable', 'url', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'inspector_ids' => ['nullable', 'array'],
            'inspector_ids.*' => ['exists:users,id'],
        ]);

        $data['created_by'] = $user->id;
        $data['is_active'] = $request->boolean('is_active', true);

        $company = Company::create($data);

        // Si es inspector quien registra, se le auto-asigna a la empresa
        if ($user->isInspector()) {
            $company->inspectors()->syncWithoutDetaching([$user->id]);
        } elseif ($user->isAdmin() && !empty($data['inspector_ids'])) {
            $company->inspectors()->sync($data['inspector_ids']);
        }

        return redirect()->route('companies.show', $company)
            ->with('success', 'Empresa registrada correctamente en la plataforma.');
    }

    public function show(Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$company->isAccessibleBy($user)) {
            abort(403, 'No tiene acceso a esta empresa.');
        }

        $company->load(['creator', 'inspectors', 'inspections.user', 'inspections.observations']);
        $inspectors = User::where('role', 'inspector')->where('is_active', true)->get();

        return view('companies.show', compact('company', 'inspectors'));
    }

    public function edit(Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$company->isAccessibleBy($user)) {
            abort(403, 'No tiene permisos para editar esta empresa.');
        }

        $inspectors = User::where('role', 'inspector')->where('is_active', true)->get();

        return view('companies.edit', compact('company', 'inspectors'));
    }

    public function update(Request $request, Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$company->isAccessibleBy($user)) {
            abort(403, 'No tiene permisos para editar esta empresa.');
        }

        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'tax_id' => ['required', 'string', 'max:50', Rule::unique('companies')->ignore($company->id)],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'industry_sector' => ['required', 'string', 'max:100'],
            'employee_count' => ['required', 'integer', 'min:1'],
            'website' => ['nullable', 'url', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'inspector_ids' => ['nullable', 'array'],
            'inspector_ids.*' => ['exists:users,id'],
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $company->update($data);

        // Si es admin, puede actualizar asignaciones
        if ($user->isAdmin() && isset($data['inspector_ids'])) {
            $company->inspectors()->sync($data['inspector_ids']);
        }

        return redirect()->route('companies.show', $company)
            ->with('success', 'Datos de la empresa actualizados exitosamente.');
    }

    public function assignInspectors(Request $request, Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin()) {
            abort(403, 'Solo administradores pueden asignar inspectores.');
        }

        $data = $request->validate([
            'inspector_ids' => ['nullable', 'array'],
            'inspector_ids.*' => ['exists:users,id'],
        ]);

        $company->inspectors()->sync($data['inspector_ids'] ?? []);

        return back()->with('success', 'Inspectores asignados correctamente a la empresa.');
    }

    public function destroy(Company $company)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin()) {
            abort(403, 'Solo administradores pueden eliminar empresas.');
        }

        $company->delete();

        return redirect()->route('companies.index')
            ->with('success', 'Empresa enviada a la papelera (eliminación lógica).');
    }

    public function restore($id)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin()) {
            abort(403, 'Solo administradores pueden restaurar empresas.');
        }

        $company = Company::onlyTrashed()->findOrFail($id);
        $company->restore();

        return redirect()->route('companies.show', $company)
            ->with('success', 'Empresa restaurada exitosamente.');
    }
}
