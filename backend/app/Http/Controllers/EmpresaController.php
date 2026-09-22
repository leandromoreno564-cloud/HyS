<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EmpresaController extends Controller
{
    /**
     * Muestra el listado de empresas con filtros de búsqueda y paginación.
     */
    public function index(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $query = Empresa::accesiblesPor($usuario)->with(['creador', 'usuarios']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('razon_social', 'like', "%{$search}%")
                  ->orWhere('cuit', 'like', "%{$search}%")
                  ->orWhere('persona_contacto', 'like', "%{$search}%")
                  ->orWhere('direccion', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sector')) {
            $query->where('sector', $request->input('sector'));
        }

        if ($request->filled('estado')) {
            $query->where('activa', $request->input('estado') === 'activa');
        }

        // Si el administrador solicita ver la papelera
        if ($usuario->esAdmin() && $request->boolean('eliminadas')) {
            $query->onlyTrashed();
        }

        $empresas = $query->withCount('inspecciones')
            ->orderBy('razon_social')
            ->paginate(10)
            ->withQueryString();

        $sectores = Empresa::select('sector')
            ->whereNotNull('sector')
            ->distinct()
            ->pluck('sector');

        return Inertia::render('Empresas/Index', compact('empresas', 'sectores'));
    }

    /**
     * Muestra el formulario para crear una nueva empresa.
     */
    public function create()
    {
        $inspectores = Usuario::where('role', 'inspector')->where('activo', true)->get();

        return Inertia::render('Empresas/Create', compact('inspectores'));
    }

    /**
     * Almacena una nueva empresa en la base de datos.
     */
    public function store(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $data = $request->validate([
            'razon_social' => ['required', 'string', 'max:255'],
            'cuit' => ['required', 'string', 'max:50', 'unique:empresas,cuit'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'email_contacto' => ['nullable', 'email', 'max:255'],
            'sector' => ['required', 'string', 'max:100'],
            'cantidad_empleados' => ['required', 'integer', 'min:1'],
            'sitio_web' => ['nullable', 'url', 'max:255'],
            'persona_contacto' => ['nullable', 'string', 'max:255'],
            'activa' => ['boolean'],
            'inspector_ids' => ['nullable', 'array'],
            'inspector_ids.*' => ['exists:usuarios,id'],
        ]);

        $data['creado_por'] = $usuario->id;
        $data['activa'] = $request->boolean('activa', true);

        $empresa = Empresa::create($data);

        // Si quien crea la empresa es un inspector, se le auto-asigna
        if ($usuario->esInspector()) {
            $empresa->usuarios()->syncWithoutDetaching([$usuario->id]);
        } elseif ($usuario->esAdmin() && !empty($data['inspector_ids'])) {
            $empresa->usuarios()->sync($data['inspector_ids']);
        }

        return redirect()->route('empresas.show', $empresa)
            ->with('success', 'Empresa registrada correctamente en la plataforma.');
    }

    /**
     * Muestra el detalle de una empresa y sus inspecciones asociadas.
     */
    public function show(Empresa $empresa)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$empresa->esAccesiblePor($usuario)) {
            abort(403, 'No tiene acceso a esta empresa.');
        }

        $empresa->load(['creador', 'usuarios', 'inspecciones.inspector', 'inspecciones.observaciones']);
        $inspectores = Usuario::where('role', 'inspector')->where('activo', true)->get();

        return Inertia::render('Empresas/Show', compact('empresa', 'inspectores'));
    }

    /**
     * Muestra el formulario para editar una empresa.
     */
    public function edit(Empresa $empresa)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$empresa->esAccesiblePor($usuario)) {
            abort(403, 'No tiene permisos para editar esta empresa.');
        }

        $inspectores = Usuario::where('role', 'inspector')->where('activo', true)->get();

        return Inertia::render('Empresas/Edit', compact('empresa', 'inspectores'));
    }

    /**
     * Actualiza la información de una empresa existente.
     */
    public function update(Request $request, Empresa $empresa)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$empresa->esAccesiblePor($usuario)) {
            abort(403, 'No tiene permisos para editar esta empresa.');
        }

        $data = $request->validate([
            'razon_social' => ['required', 'string', 'max:255'],
            'cuit' => ['required', 'string', 'max:50', Rule::unique('empresas', 'cuit')->ignore($empresa->id)],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'email_contacto' => ['nullable', 'email', 'max:255'],
            'sector' => ['required', 'string', 'max:100'],
            'cantidad_empleados' => ['required', 'integer', 'min:1'],
            'sitio_web' => ['nullable', 'url', 'max:255'],
            'persona_contacto' => ['nullable', 'string', 'max:255'],
            'activa' => ['boolean'],
            'inspector_ids' => ['nullable', 'array'],
            'inspector_ids.*' => ['exists:usuarios,id'],
        ]);

        $data['activa'] = $request->boolean('activa');
        $empresa->update($data);

        if ($usuario->esAdmin() && isset($data['inspector_ids'])) {
            $empresa->usuarios()->sync($data['inspector_ids']);
        }

        return redirect()->route('empresas.show', $empresa)
            ->with('success', 'Datos de la empresa actualizados exitosamente.');
    }

    /**
     * Asigna inspectores/usuarios a una empresa.
     */
    public function assignInspectors(Request $request, Empresa $empresa)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden asignar inspectores.');
        }

        $data = $request->validate([
            'inspector_ids' => ['nullable', 'array'],
            'inspector_ids.*' => ['exists:usuarios,id'],
        ]);

        $empresa->usuarios()->sync($data['inspector_ids'] ?? []);

        return back()->with('success', 'Inspectores asignados correctamente a la empresa.');
    }

    /**
     * Elimina lógicamente una empresa (Soft Delete).
     */
    public function destroy(Empresa $empresa)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden eliminar empresas.');
        }

        $empresa->delete();

        return redirect()->route('empresas.index')
            ->with('success', 'Empresa enviada a la papelera (eliminación lógica).');
    }

    /**
     * Restaura una empresa previamente eliminada.
     */
    public function restore($id)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin()) {
            abort(403, 'Solo administradores pueden restaurar empresas.');
        }

        $empresa = Empresa::onlyTrashed()->findOrFail($id);
        $empresa->restore();

        return redirect()->route('empresas.show', $empresa)
            ->with('success', 'Empresa restaurada exitosamente.');
    }
}