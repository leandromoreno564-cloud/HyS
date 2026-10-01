@extends('layouts.app')

@section('title', 'Inspecciones')

@section('content')
<div class="container-fluid p-0">
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Inspecciones de Higiene y Seguridad</h3>
            <p class="text-muted small mb-0">Registro, ejecución y seguimiento de auditorías técnicas en campo</p>
        </div>
        <div class="mt-3 mt-md-0 d-flex gap-2">
            <a href="{{ route('reports.csv') }}" class="btn btn-outline-success btn-touch shadow-sm">
                <i class="fa-solid fa-file-excel me-2"></i> Exportar CSV/Excel
            </a>
            <a href="{{ route('inspections.create') }}" class="btn btn-warning btn-touch text-dark fw-bold shadow-sm">
                <i class="fa-solid fa-plus-circle me-2"></i> Iniciar Inspección
            </a>
        </div>
    </div>

    <!-- Filtros de búsqueda -->
    <div class="card card-custom mb-4">
        <div class="card-body p-3">
            <form action="{{ route('inspections.index') }}" method="GET" class="row g-2 align-items-center">
                <div class="col-md-3">
                    <select name="company_id" class="form-select">
                        <option value="">Todas las empresas</option>
                        @foreach($companies as $comp)
                            <option value="{{ $comp->id }}" {{ request('company_id') == $comp->id ? 'selected' : '' }}>{{ $comp->business_name }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <select name="type" class="form-select">
                        <option value="">Todos los tipos</option>
                        <option value="General" {{ request('type') === 'General' ? 'selected' : '' }}>General</option>
                        <option value="Específica" {{ request('type') === 'Específica' ? 'selected' : '' }}>Específica</option>
                        <option value="Seguimiento" {{ request('type') === 'Seguimiento' ? 'selected' : '' }}>Seguimiento</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <select name="status" class="form-select">
                        <option value="">Todos los estados</option>
                        <option value="Borrador" {{ request('status') === 'Borrador' ? 'selected' : '' }}>Borrador</option>
                        <option value="En Progreso" {{ request('status') === 'En Progreso' ? 'selected' : '' }}>En Progreso</option>
                        <option value="Completada" {{ request('status') === 'Completada' ? 'selected' : '' }}>Completada</option>
                        <option value="Cancelada" {{ request('status') === 'Cancelada' ? 'selected' : '' }}>Cancelada</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <div class="input-group">
                        <input type="date" name="date_from" class="form-control" value="{{ request('date_from') }}" title="Desde">
                        <input type="date" name="date_to" class="form-control" value="{{ request('date_to') }}" title="Hasta">
                    </div>
                </div>
                <div class="col-md-2 d-flex gap-2">
                    <button type="submit" class="btn btn-secondary w-100">Filtrar</button>
                    @if(request()->anyFilled(['company_id', 'type', 'status', 'date_from', 'date_to']))
                        <a href="{{ route('inspections.index') }}" class="btn btn-light border"><i class="fa-solid fa-xmark"></i></a>
                    @endif
                </div>
            </form>
        </div>
    </div>

    <!-- Tabla de Inspecciones -->
    <div class="card card-custom">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Fecha</th>
                            <th>Empresa Inspeccionada</th>
                            <th>Inspector</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Avance</th>
                            <th>Hallazgos</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($inspections as $ins)
                            <tr>
                                <td class="fw-semibold">{{ $ins->inspection_date->format('d/m/Y') }}</td>
                                <td>
                                    <div class="fw-bold text-dark">{{ $ins->company->business_name ?? 'N/A' }}</div>
                                    <small class="text-muted">{{ $ins->company->industry_sector ?? '' }}</small>
                                </td>
                                <td>
                                    <div>{{ $ins->user->name ?? 'N/A' }}</div>
                                    <small class="text-muted">{{ $ins->user->license_number ?? '' }}</small>
                                </td>
                                <td><span class="badge bg-secondary">{{ $ins->type }}</span></td>
                                <td>
                                    <span class="badge {{ $ins->status === 'Completada' ? 'bg-success' : ($ins->status === 'En Progreso' ? 'bg-primary' : 'bg-warning text-dark') }}">
                                        {{ $ins->status }}
                                    </span>
                                </td>
                                <td style="min-width: 140px;">
                                    <div class="d-flex align-items-center">
                                        <div class="progress flex-grow-1 me-2" style="height: 6px;">
                                            <div class="progress-bar {{ $ins->progress_percentage == 100 ? 'bg-success' : 'bg-primary' }}" style="width: {{ $ins->progress_percentage }}%;"></div>
                                        </div>
                                        <small class="fw-bold">{{ $ins->progress_percentage }}%</small>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle">
                                        {{ $ins->observations()->count() }} obs.
                                    </span>
                                </td>
                                <td class="text-end">
                                    <div class="btn-group">
                                        <a href="{{ route('inspections.show', $ins) }}" class="btn btn-sm btn-primary" title="Abrir Inspección">
                                            <i class="fa-solid fa-folder-open"></i>
                                        </a>

                                        <a href="{{ route('reports.pdf', $ins) }}" class="btn btn-sm btn-outline-danger" title="Descargar PDF">
                                            <i class="fa-solid fa-file-pdf"></i>
                                        </a>

                                        <a href="{{ route('inspections.edit', $ins) }}" class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </a>

                                        @if(auth()->user()->isAdmin() || $ins->user_id === auth()->id())
                                            <form action="{{ route('inspections.destroy', $ins) }}" method="POST" class="d-inline" onsubmit="return confirm('¿Está seguro de eliminar esta inspección?');">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Eliminar">
                                                    <i class="fa-solid fa-trash-can"></i>
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center py-4 text-muted">No se encontraron inspecciones registradas.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($inspections->hasPages())
            <div class="card-footer bg-white border-0 py-3">
                {{ $inspections->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
