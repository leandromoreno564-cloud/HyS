<?php

namespace App\Http\Controllers;

use App\Models\ChecklistCategory;
use App\Models\ChecklistItem;
use App\Models\Company;
use App\Models\Inspection;
use App\Models\InspectionChecklistItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InspectionController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $query = Inspection::accessibleBy($user)->with(['company', 'user']);

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->input('company_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('inspection_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('inspection_date', '<=', $request->input('date_to'));
        }

        $inspections = $query->latest('inspection_date')
            ->paginate(10)
            ->withQueryString();

        $companies = Company::accessibleBy($user)->active()->orderBy('business_name')->get();

        return Inertia::render('Inspections/Index', compact('inspections', 'companies'));
    }

    public function create(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $companies = Company::accessibleBy($user)->active()->orderBy('business_name')->get();
        $selectedCompanyId = $request->query('company_id');

        return Inertia::render('Inspections/Create', compact('companies', 'selectedCompanyId'));
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $data = $request->validate([
            'company_id' => ['required', 'exists:companies,id'],
            'inspection_date' => ['required', 'date'],
            'type' => ['required', 'in:General,Específica,Seguimiento'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'general_observations' => ['nullable', 'string'],
        ]);

        $company = Company::findOrFail($data['company_id']);

        if (!$company->isAccessibleBy($user)) {
            abort(403, 'No tiene acceso para inspeccionar esta empresa.');
        }

        $data['user_id'] = $user->id;
        $data['status'] = 'En Progreso';
        $data['token'] = Str::uuid()->toString();

        $inspection = Inspection::create($data);

        // Generar items de checklist automáticamente según sector de la empresa y tipo de inspección (RF-27)
        $templateCategories = ChecklistCategory::with(['items' => function ($q) use ($company, $inspection) {
            $q->where(function ($sq) use ($company) {
                $sq->whereNull('industry_sector')
                   ->orWhere('industry_sector', $company->industry_sector);
            })->where(function ($tq) use ($inspection) {
                $tq->whereNull('inspection_type')
                   ->orWhere('inspection_type', $inspection->type);
            });
        }])->orderBy('order')->get();

        foreach ($templateCategories as $cat) {
            foreach ($cat->items as $tmplItem) {
                InspectionChecklistItem::create([
                    'inspection_id' => $inspection->id,
                    'checklist_item_id' => $tmplItem->id,
                    'category_name' => $cat->name,
                    'title' => $tmplItem->title,
                    'normative_reference' => $tmplItem->normative_reference,
                    'verification_method' => $tmplItem->verification_method,
                    'status' => 'Pendiente',
                    'risk_level' => $tmplItem->default_risk_level,
                    'is_custom' => false,
                ]);
            }
        }

        $inspection->calculateProgress();

        return redirect()->route('inspections.show', $inspection)
            ->with('success', 'Inspección creada. Los checklists técnicos se han generado automáticamente.');
    }

    public function show(Inspection $inspection)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin() && $inspection->user_id !== $user->id && !$inspection->company->isAccessibleBy($user)) {
            abort(403, 'No tiene acceso a esta inspección.');
        }

        $inspection->load([
            'company',
            'user',
            'checklistItems',
            'observations.checklistItem',
            'observations.correctiveMeasures',
            'correctiveMeasures.observation',
        ]);

        // Agrupar items de checklist por categoría
        $groupedChecklist = $inspection->checklistItems->groupBy('category_name');

        $stats = $inspection->complianceStats();

        return Inertia::render('Inspections/Show', compact('inspection', 'groupedChecklist', 'stats'));
    }

    public function edit(Inspection $inspection)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'Solo el inspector asignado o el administrador pueden editar esta inspección.');
        }

        $companies = Company::accessibleBy($user)->active()->get();

        return Inertia::render('Inspections/Edit', compact('inspection', 'companies'));
    }

    public function update(Request $request, Inspection $inspection)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para modificar esta inspección.');
        }

        $data = $request->validate([
            'inspection_date' => ['required', 'date'],
            'type' => ['required', 'in:General,Específica,Seguimiento'],
            'status' => ['required', 'in:Borrador,En Progreso,Completada,Cancelada'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'general_observations' => ['nullable', 'string'],
        ]);

        $inspection->update($data);
        $inspection->calculateProgress();

        return redirect()->route('inspections.show', $inspection)
            ->with('success', 'Inspección actualizada correctamente.');
    }

    public function updateStatus(Request $request, Inspection $inspection)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para cambiar el estado de esta inspección.');
        }

        $data = $request->validate([
            'status' => ['required', 'in:Borrador,En Progreso,Completada,Cancelada'],
        ]);

        if ($data['status'] === 'Completada') {
            // Verificar si hay items pendientes
            $pendingCount = $inspection->checklistItems()->where('status', 'Pendiente')->count();
            if ($pendingCount > 0 && !$request->boolean('force')) {
                return back()->with('warning', "Aún quedan {$pendingCount} ítems del checklist en estado 'Pendiente'. Puedes evaluarlos o forzar el cierre.");
            }
            if (!$inspection->end_time) {
                $inspection->end_time = Carbon::now()->format('H:i');
            }
        }

        $inspection->status = $data['status'];
        $inspection->save();
        $inspection->calculateProgress();

        return back()->with('success', "Estado de la inspección actualizado a '{$data['status']}'.");
    }

    public function sign(Request $request, Inspection $inspection)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para firmar esta inspección.');
        }

        $data = $request->validate([
            'signature_inspector' => ['nullable', 'string'],
            'signature_company' => ['nullable', 'string'],
            'signature_company_name' => ['nullable', 'string', 'max:255'],
        ]);

        $inspection->update($data);

        return back()->with('success', 'Firmas y conformidades registradas exitosamente.');
    }

    public function destroy(Inspection $inspection)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user->isAdmin() && $inspection->user_id !== $user->id) {
            abort(403, 'No tiene permisos para eliminar esta inspección.');
        }

        $inspection->delete();

        return redirect()->route('inspections.index')
            ->with('success', 'Inspección eliminada correctamente.');
    }
}
