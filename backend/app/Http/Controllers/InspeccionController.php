<?php

namespace App\Http\Controllers;

use App\Models\CategoriaChecklist;
use App\Models\Empresa;
use App\Models\Inspeccion;
use App\Models\ItemChecklist;
use App\Models\ItemInspeccion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InspeccionController extends Controller
{
    /**
     * Muestra el listado de inspecciones accesibles para el usuario con filtros.
     */
    public function index(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $query = Inspeccion::accesiblesPor($usuario)->with(['empresa', 'inspector']);

        if ($request->filled('empresa_id')) {
            $query->where('empresa_id', $request->input('empresa_id'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->input('tipo'));
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_inicio', '>=', $request->input('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_inicio', '<=', $request->input('fecha_hasta'));
        }

        $inspecciones = $query->latest('fecha_inicio')
            ->paginate(10)
            ->withQueryString();

        $empresas = Empresa::accesiblesPor($usuario)->activas()->orderBy('razon_social')->get();

        return Inertia::render('Inspecciones/Index', compact('inspecciones', 'empresas'));
    }

    /**
     * Muestra el formulario para iniciar una nueva inspección.
     */
    public function create(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $empresas = Empresa::accesiblesPor($usuario)->activas()->orderBy('razon_social')->get();
        $empresaIdSeleccionada = $request->query('empresa_id');

        return Inertia::render('Inspecciones/Create', compact('empresas', 'empresaIdSeleccionada'));
    }

    /**
     * Crea la inspección y genera automáticamente la lista de ítems a evaluar.
     */
    public function store(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $data = $request->validate([
            'empresa_id' => ['required', 'exists:empresas,id'],
            'fecha_inicio' => ['required', 'date'],
            'tipo' => ['required', 'in:General,Específica,Seguimiento'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'observaciones_generales' => ['nullable', 'string'],
        ]);

        $empresa = Empresa::findOrFail($data['empresa_id']);

        if (!$empresa->esAccesiblePor($usuario)) {
            abort(403, 'No tiene acceso para inspeccionar esta empresa.');
        }

        $data['inspector_id'] = $usuario->id;
        $data['estado'] = 'En Progreso';
        $data['token'] = Str::uuid()->toString();

        $inspeccion = Inspeccion::create($data);

        // Generar items de checklist automáticamente según el sector de la empresa y tipo de inspección (RF-27)
        $categoriasPlantilla = CategoriaChecklist::with(['items' => function ($q) use ($empresa, $inspeccion) {
            $q->where(function ($sq) use ($empresa) {
                $sq->whereNull('sector_industrial')
                   ->orWhere('sector_industrial', $empresa->sector);
            })->where(function ($tq) use ($inspeccion) {
                $tq->whereNull('tipo_inspeccion')
                   ->orWhere('tipo_inspeccion', $inspeccion->tipo);
            });
        }])->orderBy('orden')->get();

        foreach ($categoriasPlantilla as $cat) {
            foreach ($cat->items as $tmplItem) {
                ItemInspeccion::create([
                    'inspeccion_id' => $inspeccion->id,
                    'item_checklist_id' => $tmplItem->id,
                    'categoria_nombre' => $cat->nombre,
                    'titulo' => $tmplItem->titulo,
                    'referencia_normativa' => $tmplItem->referencia_normativa,
                    'metodo_verificacion' => $tmplItem->metodo_verificacion,
                    'estado' => 'Pendiente',
                    'nivel_riesgo' => $tmplItem->nivel_riesgo_defecto ?? 'Medio',
                    'es_personalizado' => false,
                ]);
            }
        }

        $inspeccion->calcularAvance();

        return redirect()->route('inspecciones.show', $inspeccion)
            ->with('success', 'Inspección creada. Los checklists técnicos se han generado automáticamente.');
    }

    /**
     * Muestra la vista detallada de una inspección con sus ítems agrupados.
     */
    public function show(Inspeccion $inspeccion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id && !$inspeccion->empresa->esAccesiblePor($usuario)) {
            abort(403, 'No tiene acceso a esta inspección.');
        }

        $inspeccion->load([
            'empresa',
            'inspector',
            'items',
            'observaciones.itemInspeccion',
            'observaciones.medidasCorrectivas',
            'medidasCorrectivas.observacion',
        ]);

        // Agrupar ítems evaluados por nombre de categoría
        $checklistAgrupado = $inspeccion->items->groupBy('categoria_nombre');
        $estadisticas = $inspeccion->obtenerEstadisticasCumplimiento();

        return Inertia::render('Inspecciones/Show', compact('inspeccion', 'checklistAgrupado', 'estadisticas'));
    }

    /**
     * Formulario de edición de encabezado de inspección.
     */
    public function edit(Inspeccion $inspeccion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'Solo el inspector asignado o el administrador pueden editar esta inspección.');
        }

        $empresas = Empresa::accesiblesPor($usuario)->activas()->get();

        return Inertia::render('Inspecciones/Edit', compact('inspeccion', 'empresas'));
    }

    /**
     * Actualiza los datos de la inspección.
     */
    public function update(Request $request, Inspeccion $inspeccion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'fecha_inicio' => ['required', 'date'],
            'tipo' => ['required', 'in:General,Específica,Seguimiento'],
            'estado' => ['required', 'in:Borrador,En Progreso,Completada,Cancelada'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'observaciones_generales' => ['nullable', 'string'],
        ]);

        $inspeccion->update($data);
        $inspeccion->calcularAvance();

        return redirect()->route('inspecciones.show', $inspeccion)
            ->with('success', 'Inspección actualizada correctamente.');
    }

    /**
     * Cambia el estado de una inspección (ej: finalizar/cerrar).
     */
    public function actualizarEstado(Request $request, Inspeccion $inspeccion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para cambiar el estado de esta inspección.');
        }

        $data = $request->validate([
            'estado' => ['required', 'in:Borrador,En Progreso,Completada,Cancelada'],
        ]);

        if ($data['estado'] === 'Completada') {
            $pendientes = $inspeccion->items()->where('estado', 'Pendiente')->count();
            if ($pendientes > 0 && !$request->boolean('forzar')) {
                return back()->with('warning', "Aún quedan {$pendientes} ítems del checklist en estado 'Pendiente'. Puedes evaluarlos o forzar el cierre.");
            }
            if (!$inspeccion->end_time) {
                $inspeccion->end_time = Carbon::now()->format('H:i');
            }
        }

        $inspeccion->estado = $data['estado'];
        $inspeccion->save();
        $inspeccion->calcularAvance();

        return back()->with('success', "Estado de la inspección actualizado a '{$data['estado']}'.");
    }

    /**
     * Almacena las firmas digitales y conformidades de la inspección.
     */
    public function firmar(Request $request, Inspeccion $inspeccion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para firmar esta inspección.');
        }

        $data = $request->validate([
            'firma_inspector' => ['nullable', 'string'],
            'firma_empresa' => ['nullable', 'string'],
            'nombre_firmante_empresa' => ['nullable', 'string', 'max:255'],
        ]);

        $inspeccion->update($data);

        return back()->with('success', 'Firmas y conformidades registradas exitosamente.');
    }

    /**
     * Elimina lógicamente una inspección.
     */
    public function destroy(Inspeccion $inspeccion)
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario->esAdmin() && $inspeccion->inspector_id !== $usuario->id) {
            abort(403, 'No tiene permisos para eliminar esta inspección.');
        }

        $inspeccion->delete();

        return redirect()->route('inspecciones.index')
            ->with('success', 'Inspección eliminada correctamente.');
    }
}