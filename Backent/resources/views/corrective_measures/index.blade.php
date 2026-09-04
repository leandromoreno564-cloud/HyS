@extends('layouts.app')

@section('title', 'Matriz de Medidas Correctivas')

@section('content')
<div class="container-fluid p-0">
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Matriz de Medidas Correctivas y Preventivas</h3>
            <p class="text-muted small mb-0">Seguimiento de acciones requeridas, plazos de vencimiento y responsables</p>
        </div>
    </div>

    <!-- Mini KPIs -->
    <div class="row g-3 mb-4">
        <div class="col-sm-4">
            <div class="card card-custom p-3 border-start border-primary border-4">
                <span class="text-muted small text-uppercase fw-bold">Total Registradas</span>
                <h3 class="fw-bold text-dark mb-0 mt-1">{{ $totalCount }}</h3>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="card card-custom p-3 border-start border-warning border-4">
                <span class="text-muted small text-uppercase fw-bold">En Seguimiento</span>
                <h3 class="fw-bold text-warning mb-0 mt-1">{{ $pendingCount }}</h3>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="card card-custom p-3 border-start border-danger border-4">
                <span class="text-muted small text-uppercase fw-bold">Vencidas</span>
                <h3 class="fw-bold text-danger mb-0 mt-1">{{ $overdueCount }}</h3>
            </div>
        </div>
    </div>

    <!-- Filtros -->
    <div class="card card-custom mb-4">
        <div class="card-body p-3">
            <form action="{{ route('corrective-measures.index') }}" method="GET" class="row g-2 align-items-center">
                <div class="col-md-3">
                    <select name="status" class="form-select">
                        <option value="">Todos los estados</option>
                        <option value="Pendiente" {{ request('status') === 'Pendiente' ? 'selected' : '' }}>Pendiente</option>
                        <option value="En Progreso" {{ request('status') === 'En Progreso' ? 'selected' : '' }}>En Progreso</option>
                        <option value="Completada" {{ request('status') === 'Completada' ? 'selected' : '' }}>Completada</option>
                        <option value="Vencida" {{ request('status') === 'Vencida' ? 'selected' : '' }}>Vencida</option>
                        <option value="Cancelada" {{ request('status') === 'Cancelada' ? 'selected' : '' }}>Cancelada</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select name="priority" class="form-select">
                        <option value="">Todas las prioridades</option>
                        <option value="Crítica" {{ request('priority') === 'Crítica' ? 'selected' : '' }}>Crítica</option>
                        <option value="Alta" {{ request('priority') === 'Alta' ? 'selected' : '' }}>Alta</option>
                        <option value="Media" {{ request('priority') === 'Media' ? 'selected' : '' }}>Media</option>
                        <option value="Baja" {{ request('priority') === 'Baja' ? 'selected' : '' }}>Baja</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <div class="form-check pt-2">
                        <input class="form-check-input" type="checkbox" name="overdue" value="1" id="overdueCheck" {{ request('overdue') ? 'checked' : '' }} onchange="this.form.submit()">
                        <label class="form-check-label fw-bold text-danger" for="overdueCheck">
                            <i class="fa-solid fa-triangle-exclamation me-1"></i> Solo Vencidas
                        </label>
                    </div>
                </div>
                <div class="col-md-3 d-flex gap-2">
                    <button type="submit" class="btn btn-secondary w-100">Filtrar</button>
                    @if(request()->anyFilled(['status', 'priority', 'overdue']))
                        <a href="{{ route('corrective-measures.index') }}" class="btn btn-light border"><i class="fa-solid fa-xmark"></i></a>
                    @endif
                </div>
            </form>
        </div>
    </div>

    <!-- Tabla de Medidas Correctivas -->
    <div class="card card-custom">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Prioridad</th>
                            <th>Empresa / Inspección</th>
                            <th>Medida Correctiva</th>
                            <th>Responsable</th>
                            <th>Fecha Límite</th>
                            <th>Costo Estimado</th>
                            <th>Estado Actual</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($measures as $m)
                            <tr class="{{ $m->isOverdue() ? 'table-danger' : '' }}">
                                <td>
                                    <span class="badge {{ $m->priority === 'Crítica' ? 'bg-danger' : ($m->priority === 'Alta' ? 'bg-warning text-dark' : 'bg-secondary') }}">
                                        {{ $m->priority }}
                                    </span>
                                </td>
                                <td>
                                    <a href="{{ route('inspections.show', $m->inspection) }}" class="fw-bold text-dark text-decoration-none">
                                        {{ $m->inspection->company->business_name ?? 'Empresa' }}
                                    </a>
                                    <small class="text-muted d-block">{{ $m->inspection->inspection_date->format('d/m/Y') }}</small>
                                </td>
                                <td>
                                    <div class="fw-semibold text-dark">{{ $m->description }}</div>
                                    @if($m->recommendations)
                                        <small class="text-muted d-block"><i class="fa-regular fa-lightbulb text-warning me-1"></i> {{ $m->recommendations }}</small>
                                    @endif
                                </td>
                                <td>{{ $m->responsible_person ?? 'Sin asignar' }}</td>
                                <td>
                                    @if($m->deadline)
                                        <span class="{{ $m->isOverdue() ? 'text-danger fw-bold' : 'text-dark' }}">
                                            {{ $m->deadline->format('d/m/Y') }}
                                            @if($m->isOverdue()) <i class="fa-solid fa-circle-exclamation ms-1"></i> @endif
                                        </span>
                                    @else
                                        <span class="text-muted">Sin plazo</span>
                                    @endif
                                </td>
                                <td>
                                    {{ $m->estimated_cost ? '$' . number_format($m->estimated_cost, 2, ',', '.') : '-' }}
                                </td>
                                <td>
                                    <form action="{{ route('corrective-measures.status', $m) }}" method="POST" class="d-inline">
                                        @csrf
                                        <select name="status" class="form-select form-select-sm {{ $m->status === 'Completada' ? 'bg-success text-white' : ($m->status === 'En Progreso' ? 'bg-primary text-white' : 'bg-light') }}" onchange="this.form.submit()">
                                            <option value="Pendiente" {{ $m->status === 'Pendiente' ? 'selected' : '' }}>Pendiente</option>
                                            <option value="En Progreso" {{ $m->status === 'En Progreso' ? 'selected' : '' }}>En Progreso</option>
                                            <option value="Completada" {{ $m->status === 'Completada' ? 'selected' : '' }}>Completada</option>
                                            <option value="Cancelada" {{ $m->status === 'Cancelada' ? 'selected' : '' }}>Cancelada</option>
                                        </select>
                                    </form>
                                </td>
                                <td class="text-end">
                                    <a href="{{ route('inspections.show', $m->inspection) }}" class="btn btn-sm btn-outline-primary" title="Ir a la Inspección">
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center py-4 text-muted">No se encontraron medidas correctivas con los filtros aplicados.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($measures->hasPages())
            <div class="card-footer bg-white border-0 py-3">
                {{ $measures->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
