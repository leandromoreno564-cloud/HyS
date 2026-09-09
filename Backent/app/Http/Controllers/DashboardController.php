<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CorrectiveMeasure;
use App\Models\Inspection;
use App\Models\Observation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->isAdmin()) {
            return $this->adminDashboard();
        }

        return $this->inspectorDashboard($user);
    }

    protected function adminDashboard()
    {
        $totalCompanies = Company::count();
        $totalUsers = User::count();
        $totalInspections = Inspection::count();
        $completedInspections = Inspection::where('status', 'Completada')->count();
        $inProgressInspections = Inspection::where('status', 'En Progreso')->count();
        
        $pendingMeasures = CorrectiveMeasure::whereIn('status', ['Pendiente', 'En Progreso'])->count();
        $overdueMeasures = CorrectiveMeasure::whereIn('status', ['Pendiente', 'En Progreso'])
            ->whereNotNull('deadline')
            ->where('deadline', '<', Carbon::today())
            ->count();

        // Alertas de medidas correctivas críticas o vencidas
        $criticalAlerts = CorrectiveMeasure::with(['inspection.company', 'observation'])
            ->whereIn('status', ['Pendiente', 'En Progreso'])
            ->where(function ($q) {
                $q->where('priority', 'Crítica')
                  ->orWhere('deadline', '<', Carbon::today());
            })
            ->orderBy('deadline', 'asc')
            ->limit(5)
            ->get();

        // Gráfico de inspecciones por mes (últimos 6 meses)
        $months = [];
        $monthlyCounts = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $monthName = $monthDate->translatedFormat('M Y');
            $months[] = ucfirst($monthName);
            $count = Inspection::whereYear('inspection_date', $monthDate->year)
                ->whereMonth('inspection_date', $monthDate->month)
                ->count();
            $monthlyCounts[] = $count;
        }

        // Inspecciones por estado para gráfico de torta
        $statusCounts = [
            'Completadas' => Inspection::where('status', 'Completada')->count(),
            'En Progreso' => Inspection::where('status', 'En Progreso')->count(),
            'Borradores' => Inspection::where('status', 'Borrador')->count(),
            'Canceladas' => Inspection::where('status', 'Cancelada')->count(),
        ];

        // Ranking de empresas con más observaciones
        $topCompaniesWithObs = Company::withCount('observations')
            ->orderByDesc('observations_count')
            ->limit(5)
            ->get();

        // Inspecciones recientes
        $recentInspections = Inspection::with(['company', 'user'])
            ->latest()
            ->limit(6)
            ->get();

        return Inertia::render('Dashboard/Admin', compact(
            'totalCompanies',
            'totalUsers',
            'totalInspections',
            'completedInspections',
            'inProgressInspections',
            'pendingMeasures',
            'overdueMeasures',
            'criticalAlerts',
            'months',
            'monthlyCounts',
            'statusCounts',
            'topCompaniesWithObs',
            'recentInspections'
        ));
    }

    protected function inspectorDashboard(User $user)
    {
        $myInspectionsQuery = Inspection::where('user_id', $user->id);

        $totalMyInspections = (clone $myInspectionsQuery)->count();
        $inProgressCount = (clone $myInspectionsQuery)->where('status', 'En Progreso')->count();
        $completedCount = (clone $myInspectionsQuery)->where('status', 'Completada')->count();

        // Observaciones críticas activas en sus inspecciones
        $criticalObsCount = Observation::whereHas('inspection', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->whereIn('severity', ['Crítico', 'Mayor'])->count();

        // Medidas correctivas pendientes en sus inspecciones
        $myPendingMeasures = CorrectiveMeasure::whereHas('inspection', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->whereIn('status', ['Pendiente', 'En Progreso'])->count();

        // Alertas inmediatas
        $myAlerts = CorrectiveMeasure::with(['inspection.company'])
            ->whereHas('inspection', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereIn('status', ['Pendiente', 'En Progreso'])
            ->where(function ($q) {
                $q->where('priority', 'Crítica')
                  ->orWhere('deadline', '<=', Carbon::today()->addDays(3));
            })
            ->orderBy('deadline', 'asc')
            ->limit(5)
            ->get();

        // Gráfico últimos 6 meses para este inspector
        $months = [];
        $monthlyCounts = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $monthName = $monthDate->translatedFormat('M Y');
            $months[] = ucfirst($monthName);
            $count = Inspection::where('user_id', $user->id)
                ->whereYear('inspection_date', $monthDate->year)
                ->whereMonth('inspection_date', $monthDate->month)
                ->count();
            $monthlyCounts[] = $count;
        }

        // Mis inspecciones recientes
        $recentInspections = Inspection::with(['company'])
            ->where('user_id', $user->id)
            ->latest()
            ->limit(6)
            ->get();

        // Mis empresas asignadas o creadas
        $myCompanies = Company::accessibleBy($user)->active()->limit(5)->get();

        return Inertia::render('Dashboard/Inspector', compact(
            'totalMyInspections',
            'inProgressCount',
            'completedCount',
            'criticalObsCount',
            'myPendingMeasures',
            'myAlerts',
            'months',
            'monthlyCounts',
            'recentInspections',
            'myCompanies'
        ));
    }
}
