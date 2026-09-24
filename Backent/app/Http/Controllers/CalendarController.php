<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CorrectiveMeasure;
use App\Models\Inspection;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        // Mes y año seleccionados (por defecto mes y año actual)
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);

        if ($month < 1 || $month > 12) {
            $month = Carbon::now()->month;
        }
        if ($year < 2000 || $year > 2100) {
            $year = Carbon::now()->year;
        }

        $currentDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        // Rango ampliado (+/- 7 días) para rellenar la grilla visual del mes
        $startDate = $currentDate->copy()->subDays(7)->startOfDay();
        $endDate = $currentDate->copy()->endOfMonth()->addDays(7)->endOfDay();

        // 1. Inspecciones en el rango del calendario
        $inspectionsQuery = Inspection::accessibleBy($user)
            ->with(['company', 'user'])
            ->whereBetween('inspection_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);

        if ($request->filled('inspector_id') && $user->isAdmin()) {
            $inspectionsQuery->where('user_id', $request->input('inspector_id'));
        }

        if ($request->filled('company_id')) {
            $inspectionsQuery->where('company_id', $request->input('company_id'));
        }

        $inspections = $inspectionsQuery->orderBy('inspection_date')->get();

        $events = [];

        foreach ($inspections as $insp) {
            $events[] = [
                'id' => 'insp_' . $insp->id,
                'raw_id' => $insp->id,
                'type' => 'inspection',
                'title' => 'Inspección: ' . ($insp->company?->business_name ?? 'Empresa'),
                'date' => Carbon::parse($insp->inspection_date)->format('Y-m-d'),
                'start_time' => $insp->start_time ?: '09:00',
                'end_time' => $insp->end_time ?: '12:00',
                'status' => $insp->status ?: 'Borrador',
                'inspection_type' => $insp->type ?: 'General',
                'company_id' => $insp->company_id,
                'company_name' => $insp->company?->business_name ?? 'Empresa',
                'company_address' => $insp->company?->address ?? '',
                'inspector_name' => $insp->user?->name ?? 'Sin asignar',
                'inspector_id' => $insp->user_id,
                'notes' => $insp->general_observations ?? '',
                'progress_percentage' => $insp->progress_percentage,
            ];
        }

        // 2. Medidas Correctivas con fecha límite (deadline) en el rango
        $measuresQuery = CorrectiveMeasure::whereNotNull('deadline')
            ->whereBetween('deadline', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->whereHas('inspection', function ($iq) use ($user) {
                $iq->accessibleBy($user);
            })
            ->with(['inspection.company', 'inspection.user']);

        if ($request->filled('company_id')) {
            $measuresQuery->whereHas('inspection', function ($iq) use ($request) {
                $iq->where('company_id', $request->input('company_id'));
            });
        }

        $measures = $measuresQuery->orderBy('deadline')->get();

        foreach ($measures as $m) {
            $deadline = Carbon::parse($m->deadline);
            $isOverdue = $m->isOverdue();
            $events[] = [
                'id' => 'measure_' . $m->id,
                'raw_id' => $m->id,
                'type' => 'corrective_measure',
                'title' => 'Vence: ' . Str::limit($m->description, 35),
                'description' => $m->description,
                'date' => $deadline->format('Y-m-d'),
                'priority' => $m->priority ?: 'Media',
                'status' => $m->status ?: 'Pendiente',
                'company_id' => $m->inspection?->company_id,
                'company_name' => $m->inspection?->company?->business_name ?? 'Empresa',
                'responsible' => $m->responsible_person,
                'recommendations' => $m->recommendations,
                'is_overdue' => $isOverdue,
            ];
        }

        // Métricas / Resumen del mes consultado
        $monthStart = $currentDate->copy()->startOfMonth()->format('Y-m-d');
        $monthEnd = $currentDate->copy()->endOfMonth()->format('Y-m-d');

        $stats = [
            'total_inspections' => Inspection::accessibleBy($user)
                ->whereBetween('inspection_date', [$monthStart, $monthEnd])
                ->count(),
            'completed_inspections' => Inspection::accessibleBy($user)
                ->whereBetween('inspection_date', [$monthStart, $monthEnd])
                ->where('status', 'Completada')
                ->count(),
            'pending_measures' => CorrectiveMeasure::whereBetween('deadline', [$monthStart, $monthEnd])
                ->whereHas('inspection', function ($iq) use ($user) {
                    $iq->accessibleBy($user);
                })
                ->whereIn('status', ['Pendiente', 'En Progreso'])
                ->count(),
            'overdue_measures' => CorrectiveMeasure::whereHas('inspection', function ($iq) use ($user) {
                    $iq->accessibleBy($user);
                })
                ->whereIn('status', ['Pendiente', 'En Progreso'])
                ->whereNotNull('deadline')
                ->where('deadline', '<', Carbon::today())
                ->count(),
        ];

        // Empresas accesibles para el formulario de programar inspección
        $companies = Company::accessibleBy($user)
            ->active()
            ->orderBy('business_name')
            ->get(['id', 'business_name', 'tax_id', 'address']);

        // Inspectores activos (para que el admin pueda asignar a cualquiera)
        $inspectors = $user->isAdmin()
            ? User::where('is_active', true)->where('role', 'inspector')->orderBy('name')->get(['id', 'name', 'email'])
            : [];

        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'currentMonth' => $month,
            'currentYear' => $year,
            'stats' => $stats,
            'companies' => $companies,
            'inspectors' => $inspectors,
            'filters' => [
                'inspector_id' => $request->input('inspector_id'),
                'company_id' => $request->input('company_id'),
            ],
        ]);
    }

    public function storeInspection(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $data = $request->validate([
            'company_id' => ['required', 'exists:companies,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'inspection_date' => ['required', 'date'],
            'start_time' => ['nullable', 'string', 'max:10'],
            'end_time' => ['nullable', 'string', 'max:10'],
            'type' => ['required', 'in:General,Específica,Seguimiento'],
            'general_observations' => ['nullable', 'string', 'max:2000'],
        ]);

        $company = Company::findOrFail($data['company_id']);
        if (!$company->isAccessibleBy($user)) {
            abort(403, 'No tiene acceso a esta empresa.');
        }

        // Si es inspector, la inspección es asignada a él mismo; si es admin, puede elegir o autoasignarse
        $assignedUserId = $user->isAdmin() && !empty($data['user_id'])
            ? $data['user_id']
            : $user->id;

        Inspection::create([
            'company_id' => $company->id,
            'user_id' => $assignedUserId,
            'inspection_date' => $data['inspection_date'],
            'start_time' => $data['start_time'] ?? '09:00',
            'end_time' => $data['end_time'] ?? '12:00',
            'type' => $data['type'],
            'status' => 'Borrador',
            'general_observations' => $data['general_observations'] ?? null,
            'progress_percentage' => 0,
        ]);

        return redirect()->back()->with('success', '¡Inspección programada con éxito en la agenda!');
    }

    public function updateInspectionStatus(Request $request, Inspection $inspection)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$inspection->company->isAccessibleBy($user)) {
            abort(403, 'No tiene acceso a esta inspección.');
        }

        $data = $request->validate([
            'status' => ['required', 'in:Borrador,En Progreso,Completada,Cancelada'],
        ]);

        $inspection->update(['status' => $data['status']]);

        return redirect()->back()->with('success', 'Estado de la inspección actualizado a "' . $data['status'] . '"');
    }
}
