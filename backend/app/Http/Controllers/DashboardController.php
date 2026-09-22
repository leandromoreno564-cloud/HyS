<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Inspeccion;
use App\Models\MedidaCorrectiva;
use App\Models\Observacion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Redirige al panel correspondiente según el rol del usuario autenticado.
     */
    public function index()
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        if ($usuario->esAdmin()) {
            return $this->adminDashboard();
        }

        return $this->inspectorDashboard($usuario);
    }

    /**
     * Carga y procesa métricas consolidadas para el panel de administración.
     */
    protected function adminDashboard()
    {
        $totalEmpresas = Empresa::count();
        $totalUsuarios = Usuario::count();
        $totalInspecciones = Inspeccion::count();
        $inspeccionesCompletadas = Inspeccion::where('estado', 'Completada')->count();
        $inspeccionesEnProgreso = Inspeccion::where('estado', 'En Progreso')->count();
        
        $medidasPendientes = MedidaCorrectiva::whereIn('estado', ['Pendiente', 'En Progreso'])->count();
        $medidasVencidas = MedidaCorrectiva::whereIn('estado', ['Pendiente', 'En Progreso'])
            ->whereNotNull('fecha_limite')
            ->where('fecha_limite', '<', Carbon::today())
            ->count();

        // Alertas de medidas correctivas críticas o vencidas
        $alertasCriticas = MedidaCorrectiva::with(['inspeccion.empresa', 'observacion'])
            ->whereIn('estado', ['Pendiente', 'En Progreso'])
            ->where(function ($q) {
                $q->where('prioridad', 'Crítica')
                  ->orWhere('fecha_limite', '<', Carbon::today());
            })
            ->orderBy('fecha_limite', 'asc')
            ->limit(5)
            ->get();

        // Gráfico de inspecciones por mes (últimos 6 meses)
        $meses = [];
        $conteosMensuales = [];
        for ($i = 5; $i >= 0; $i--) {
            $fechaMes = Carbon::now()->subMonths($i);
            $nombreMes = $fechaMes->translatedFormat('M Y');
            $meses[] = ucfirst($nombreMes);
            $conteo = Inspeccion::whereYear('fecha_inicio', $fechaMes->year)
                ->whereMonth('fecha_inicio', $fechaMes->month)
                ->count();
            $conteosMensuales[] = $conteo;
        }

        // Inspecciones por estado para gráfico de torta
        $conteosPorEstado = [
            'Completadas' => Inspeccion::where('estado', 'Completada')->count(),
            'En Progreso' => Inspeccion::where('estado', 'En Progreso')->count(),
            'Borradores' => Inspeccion::where('estado', 'Borrador')->count(),
            'Canceladas' => Inspeccion::where('estado', 'Cancelada')->count(),
        ];

        // Ranking de empresas con más observaciones
        $topEmpresasObservaciones = Empresa::withCount('observaciones')
            ->orderByDesc('observaciones_count')
            ->limit(5)
            ->get();

        // Inspecciones recientes
        $inspeccionesRecientes = Inspeccion::with(['empresa', 'inspector'])
            ->latest()
            ->limit(6)
            ->get();

        return Inertia::render('Dashboard/Admin', compact(
            'totalEmpresas',
            'totalUsuarios',
            'totalInspecciones',
            'inspeccionesCompletadas',
            'inspeccionesEnProgreso',
            'medidasPendientes',
            'medidasVencidas',
            'alertasCriticas',
            'meses',
            'conteosMensuales',
            'conteosPorEstado',
            'topEmpresasObservaciones',
            'inspeccionesRecientes'
        ));
    }

    /**
     * Carga y procesa métricas personalizadas para el panel del inspector.
     */
    protected function inspectorDashboard(Usuario $usuario)
    {
        $consultaMisInspecciones = Inspeccion::where('inspector_id', $usuario->id);

        $totalMisInspecciones = (clone $consultaMisInspecciones)->count();
        $conteoEnProgreso = (clone $consultaMisInspecciones)->where('estado', 'En Progreso')->count();
        $conteoCompletadas = (clone $consultaMisInspecciones)->where('estado', 'Completada')->count();

        // Observaciones críticas activas en sus inspecciones
        $conteoObservacionesCriticas = Observacion::whereHas('inspeccion', function ($q) use ($usuario) {
            $q->where('inspector_id', $usuario->id);
        })->whereIn('severidad', ['Crítico', 'Mayor'])->count();

        // Medidas correctivas pendientes en sus inspecciones
        $misMedidasPendientes = MedidaCorrectiva::whereHas('inspeccion', function ($q) use ($usuario) {
            $q->where('inspector_id', $usuario->id);
        })->whereIn('estado', ['Pendiente', 'En Progreso'])->count();

        // Alertas inmediatas
        $misAlertas = MedidaCorrectiva::with(['inspeccion.empresa'])
            ->whereHas('inspeccion', function ($q) use ($usuario) {
                $q->where('inspector_id', $usuario->id);
            })
            ->whereIn('estado', ['Pendiente', 'En Progreso'])
            ->where(function ($q) {
                $q->where('prioridad', 'Crítica')
                  ->orWhere('fecha_limite', '<=', Carbon::today()->addDays(3));
            })
            ->orderBy('fecha_limite', 'asc')
            ->limit(5)
            ->get();

        // Gráfico últimos 6 meses para este inspector
        $meses = [];
        $conteosMensuales = [];
        for ($i = 5; $i >= 0; $i--) {
            $fechaMes = Carbon::now()->subMonths($i);
            $nombreMes = $fechaMes->translatedFormat('M Y');
            $meses[] = ucfirst($nombreMes);
            $conteo = Inspeccion::where('inspector_id', $usuario->id)
                ->whereYear('fecha_inicio', $fechaMes->year)
                ->whereMonth('fecha_inicio', $fechaMes->month)
                ->count();
            $conteosMensuales[] = $conteo;
        }

        // Mis inspecciones recientes
        $inspeccionesRecientes = Inspeccion::with(['empresa'])
            ->where('inspector_id', $usuario->id)
            ->latest()
            ->limit(6)
            ->get();

        // Mis empresas asignadas o creadas
        $misEmpresas = Empresa::accesiblesPor($usuario)->activas()->limit(5)->get();

        return Inertia::render('Dashboard/Inspector', compact(
            'totalMisInspecciones',
            'conteoEnProgreso',
            'conteoCompletadas',
            'conteoObservacionesCriticas',
            'misMedidasPendientes',
            'misAlertas',
            'meses',
            'conteosMensuales',
            'inspeccionesRecientes',
            'misEmpresas'
        ));
    }
}