<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\CalendarEvent;
use App\Models\Company;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Calendario de actividades.
 *  - El administrador asigna actividades (revisiones, seguimientos, capacitaciones...) a los inspectores.
 *  - Cada inspector ve solo las suyas y las marca como completadas.
 *  - Cada alta, cambio o baja le llega al inspector como notificación.
 *
 * Las fechas se interpretan en hora de Buenos Aires (el servidor está en UTC).
 */
class CalendarController extends Controller
{
    private const TZ = 'America/Argentina/Buenos_Aires';

    // ------------------------------------------------------------------ Vista

    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $isAdmin = $user->isAdmin();

        $today = Carbon::now(self::TZ)->startOfDay();

        $month = (string) $request->query('month', '');
        if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month)) {
            $month = $today->format('Y-m');
        }

        $first = Carbon::createFromFormat('Y-m-d', $month . '-01', self::TZ)->startOfDay();
        $gridStart = $first->copy()->startOfWeek(Carbon::MONDAY);
        $gridEnd = $first->copy()->endOfMonth()->endOfWeek(Carbon::SUNDAY);

        $inspectorFilter = $isAdmin ? $request->integer('inspector_id') : 0;

        $scope = function ($q) use ($user, $isAdmin, $inspectorFilter) {
            if (!$isAdmin) {
                $q->where('inspector_id', $user->id);
            } elseif ($inspectorFilter) {
                $q->where('inspector_id', $inspectorFilter);
            }
        };

        $events = CalendarEvent::with(['company:id,business_name', 'inspector:id,name'])
            ->whereBetween('date', [$gridStart->toDateString(), $gridEnd->toDateString()])
            ->where($scope)
            ->orderBy('date')
            ->orderByRaw('start_time IS NULL')
            ->orderBy('start_time')
            ->get();

        $upcoming = CalendarEvent::with(['company:id,business_name', 'inspector:id,name'])
            ->where('date', '>=', $today->toDateString())
            ->where('status', 'pendiente')
            ->where($scope)
            ->orderBy('date')
            ->orderByRaw('start_time IS NULL')
            ->orderBy('start_time')
            ->limit(6)
            ->get();

        $inMonth = $events->filter(fn ($e) => $e->date->format('Y-m') === $month);

        $payload = [
            'month' => $month,
            'gridStart' => $gridStart->toDateString(),
            'gridEnd' => $gridEnd->toDateString(),
            'events' => $events->map(fn ($e) => $this->present($e, $user))->values(),
            'upcoming' => $upcoming->map(fn ($e) => $this->present($e, $user))->values(),
            'stats' => [
                'total' => $inMonth->count(),
                'pendientes' => $inMonth->where('status', 'pendiente')->count(),
                'completadas' => $inMonth->where('status', 'completada')->count(),
            ],
            'types' => CalendarEvent::TYPES,
            'filters' => ['inspector_id' => $inspectorFilter ?: null],
            'inspectors' => [],
            'companies' => [],
        ];

        if ($isAdmin) {
            // company_ids = empresas que cada inspector puede ver (las del formulario se filtran con esto)
            $payload['inspectors'] = User::where('role', 'inspector')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'company_ids' => Company::accessibleBy($u)->pluck('companies.id')->all(),
                ])->values();

            $payload['companies'] = Company::active()->orderBy('business_name')->get(['id', 'business_name']);
        }

        return Inertia::render('Calendar/Index', $payload);
    }

    // ------------------------------------------------------------------ Altas, cambios y bajas (admin)

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $event = CalendarEvent::create($data + [
            'status' => 'pendiente',
            'created_by' => Auth::id(),
        ]);

        $this->notify($event->inspector_id, 'Nueva actividad asignada', $this->summary($event), $event);

        return back()->with('success', 'Actividad asignada al inspector.');
    }

    public function update(Request $request, CalendarEvent $event)
    {
        $data = $this->validated($request);
        $oldInspectorId = $event->inspector_id;

        $event->fill($data);
        $dirty = $event->isDirty(['title', 'type', 'company_id', 'inspector_id', 'date', 'start_time', 'end_time']);
        $event->save();

        if ($dirty) {
            if ((int) $oldInspectorId !== (int) $event->inspector_id) {
                $this->notify($oldInspectorId, 'Actividad reasignada', 'Ya no tenés asignada: ' . $this->summary($event), $event);
                $this->notify($event->inspector_id, 'Nueva actividad asignada', $this->summary($event), $event);
            } else {
                $this->notify($event->inspector_id, 'Actividad modificada', $this->summary($event), $event);
            }
        }

        return back()->with('success', 'Actividad actualizada.');
    }

    public function destroy(CalendarEvent $event)
    {
        $this->notify($event->inspector_id, 'Actividad cancelada', $this->summary($event), $event);
        $event->delete();

        return back()->with('success', 'Actividad eliminada.');
    }

    // ------------------------------------------------------------------ Estado (admin o el inspector asignado)

    public function toggleStatus(Request $request, CalendarEvent $event)
    {
        /** @var User $user */
        $user = Auth::user();

        abort_unless($user->isAdmin() || (int) $event->inspector_id === (int) $user->id, 403);

        $allowed = $user->isAdmin() ? CalendarEvent::STATUSES : ['pendiente', 'completada'];
        $data = $request->validate(['status' => ['required', Rule::in($allowed)]]);

        $event->status = $data['status'];
        $event->completed_at = $data['status'] === 'completada' ? now() : null;
        $event->save();

        // Si lo completa el inspector, se le avisa a quien lo asignó
        if ($data['status'] === 'completada' && $user->isInspector() && $event->created_by && (int) $event->created_by !== (int) $user->id) {
            $this->notify($event->created_by, 'Actividad completada', "{$user->name} completó: " . $this->summary($event), $event);
        }

        return back()->with('success', 'Estado de la actividad actualizado.');
    }

    // ------------------------------------------------------------------ Helpers

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(array_keys(CalendarEvent::TYPES))],
            'description' => ['nullable', 'string', 'max:1000'],
            'inspector_id' => ['required', Rule::exists('users', 'id')->where('role', 'inspector')->where('is_active', true)],
            'company_id' => ['nullable', 'integer', Rule::exists('companies', 'id')->whereNull('deleted_at')],
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['nullable', 'date_format:H:i', 'required_with:end_time'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
        ], [
            'inspector_id.required' => 'Elegí el inspector que va a realizar la actividad.',
            'inspector_id.exists' => 'El inspector elegido no existe o está desactivado.',
            'start_time.required_with' => 'Indicá la hora de inicio si ponés hora de fin.',
            'end_time.after' => 'La hora de fin tiene que ser posterior a la de inicio.',
        ]);

        // Una revisión necesita saber a qué empresa ir
        if ($data['type'] === 'revision' && empty($data['company_id'])) {
            throw ValidationException::withMessages(['company_id' => 'Para una revisión elegí la empresa que se visita.']);
        }

        // La empresa tiene que estar asignada al inspector (si no, no podría abrirla)
        if (!empty($data['company_id'])) {
            $inspector = User::find($data['inspector_id']);
            if (!Company::accessibleBy($inspector)->whereKey($data['company_id'])->exists()) {
                throw ValidationException::withMessages([
                    'company_id' => 'Esa empresa no está asignada al inspector. Asignásela primero desde la ficha de la empresa.',
                ]);
            }
        }

        // Se guarda con segundos para que la comparación de cambios con la base sea exacta
        $data['start_time'] = !empty($data['start_time']) ? $data['start_time'] . ':00' : null;
        $data['end_time'] = !empty($data['end_time']) ? $data['end_time'] . ':00' : null;
        $data['company_id'] = $data['company_id'] ?? null;

        return $data;
    }

    private function present(CalendarEvent $e, User $user): array
    {
        return [
            'id' => $e->id,
            'title' => $e->title,
            'type' => $e->type,
            'description' => $e->description,
            'date' => $e->date->format('Y-m-d'),
            'start_time' => $e->start_time ? substr($e->start_time, 0, 5) : null,
            'end_time' => $e->end_time ? substr($e->end_time, 0, 5) : null,
            'status' => $e->status,
            'company' => $e->company ? ['id' => $e->company->id, 'business_name' => $e->company->business_name] : null,
            'inspector' => $e->inspector ? ['id' => $e->inspector->id, 'name' => $e->inspector->name] : null,
            'can_edit' => $user->isAdmin(),
            'can_toggle' => $user->isAdmin() || (int) $e->inspector_id === (int) $user->id,
        ];
    }

    private function summary(CalendarEvent $e): string
    {
        $e->loadMissing('company:id,business_name');

        return collect([
            CalendarEvent::TYPES[$e->type] ?? 'Actividad',
            $e->title,
            $e->company?->business_name,
            $e->date->format('d/m/Y') . ($e->start_time ? ' ' . substr($e->start_time, 0, 5) : ''),
        ])->filter()->implode(' · ');
    }

    private function notify(int $userId, string $title, string $message, CalendarEvent $event): void
    {
        AppNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => 'info',
            'link' => '/calendar?month=' . $event->date->format('Y-m'),
            'is_read' => false,
        ]);
    }
}
