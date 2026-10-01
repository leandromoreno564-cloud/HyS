@extends('layouts.app')

@section('title', 'Empresas')

@section('content')
<div class="container-fluid p-0">
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Empresas e Instalaciones</h3>
            <p class="text-muted small mb-0">Gestión de establecimientos comerciales, industriales y obras registradas</p>
        </div>
        <div class="mt-3 mt-md-0 d-flex gap-2">
            @if(auth()->user()->isAdmin())
                <a href="{{ route('companies.index', array_merge(request()->query(), ['trashed' => request('trashed') ? null : 1])) }}" class="btn btn-outline-secondary btn-touch">
                    <i class="fa-solid fa-trash-can me-1"></i> {{ request('trashed') ? 'Ver Activas' : 'Ver Papelera' }}
                </a>
            @endif
            <a href="{{ route('companies.create') }}" class="btn btn-primary btn-touch shadow-sm">
                <i class="fa-solid fa-plus-circle me-2"></i> Registrar Empresa
            </a>
        </div>
    </div>

    <!-- Filtros de búsqueda -->
    <div class="card card-custom mb-4">
        <div class="card-body p-3">
            <form action="{{ route('companies.index') }}" method="GET" class="row g-2 align-items-center">
                <div class="col-md-5">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="fa-solid fa-magnifying-glass"></i></span>
                        <input type="text" name="search" class="form-control border-start-0" placeholder="Buscar por razón social, CUIT o contacto..." value="{{ request('search') }}">
                    </div>
                </div>
                <div class="col-md-3">
                    <select name="sector" class="form-select">
                        <option value="">Todos los sectores</option>
                        @foreach($sectors as $sec)
                            <option value="{{ $sec }}" {{ request('sector') === $sec ? 'selected' : '' }}>{{ $sec }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <select name="status" class="form-select">
                        <option value="">Todos los estados</option>
                        <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Activas</option>
                        <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactivas</option>
                    </select>
                </div>
                <div class="col-md-2 d-flex gap-2">
                    <button type="submit" class="btn btn-secondary w-100">Filtrar</button>
                    @if(request()->anyFilled(['search', 'sector', 'status']))
                        <a href="{{ route('companies.index') }}" class="btn btn-light border"><i class="fa-solid fa-xmark"></i></a>
                    @endif
                </div>
            </form>
        </div>
    </div>

    <!-- Listado de Empresas -->
    <div class="card card-custom">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Empresa / Razón Social</th>
                            <th>CUIT / RUC</th>
                            <th>Sector Industrial</th>
                            <th>Empleados</th>
                            <th>Inspectores Asignados</th>
                            <th>Inspecciones</th>
                            <th>Estado</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($companies as $c)
                            <tr class="{{ $c->trashed() ? 'table-danger' : '' }}">
                                <td>
                                    <a href="{{ route('companies.show', $c) }}" class="fw-bold text-dark text-decoration-none">
                                        {{ $c->business_name }}
                                    </a>
                                    @if($c->contact_person)
                                        <div class="small text-muted"><i class="fa-solid fa-user-tie me-1"></i> {{ $c->contact_person }}</div>
                                    @endif
                                </td>
                                <td><code>{{ $c->tax_id }}</code></td>
                                <td><span class="badge bg-light text-dark border">{{ $c->industry_sector }}</span></td>
                                <td>{{ $c->employee_count }}</td>
                                <td>
                                    <div class="d-flex flex-wrap gap-1">
                                        @forelse($c->inspectors as $insp)
                                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle" title="{{ $insp->name }}">
                                                {{ Str::limit($insp->name, 14) }}
                                            </span>
                                        @empty
                                            <span class="text-muted small">Sin asignar</span>
                                        @endforelse
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-light text-secondary border">
                                        <i class="fa-solid fa-clipboard-check me-1 text-primary"></i> {{ $c->inspections_count }}
                                    </span>
                                </td>
                                <td>
                                    @if($c->trashed())
                                        <span class="badge bg-danger">Eliminada</span>
                                    @elseif($c->is_active)
                                        <span class="badge bg-success-subtle text-success border border-success-subtle">Activa</span>
                                    @else
                                        <span class="badge bg-secondary">Inactiva</span>
                                    @endif
                                </td>
                                <td class="text-end">
                                    <div class="btn-group">
                                        <a href="{{ route('companies.show', $c) }}" class="btn btn-sm btn-outline-primary" title="Ver Detalles">
                                            <i class="fa-solid fa-eye"></i>
                                        </a>

                                        @if(!$c->trashed())
                                            <a href="{{ route('inspections.create', ['company_id' => $c->id]) }}" class="btn btn-sm btn-outline-warning text-dark" title="Nueva Inspección">
                                                <i class="fa-solid fa-plus-circle"></i>
                                            </a>

                                            <a href="{{ route('companies.edit', $c) }}" class="btn btn-sm btn-outline-secondary" title="Editar">
                                                <i class="fa-solid fa-pen-to-square"></i>
                                            </a>

                                            @if(auth()->user()->isAdmin())
                                                <form action="{{ route('companies.destroy', $c) }}" method="POST" class="d-inline" onsubmit="return confirm('¿Está seguro de enviar esta empresa a la papelera?');">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Eliminar">
                                                        <i class="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </form>
                                            @endif
                                        @else
                                            <form action="{{ route('companies.restore', $c->id) }}" method="POST" class="d-inline">
                                                @csrf
                                                <button type="submit" class="btn btn-sm btn-success" title="Restaurar Empresa">
                                                    <i class="fa-solid fa-trash-can-arrow-up me-1"></i> Restaurar
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center py-4 text-muted">No se encontraron empresas con los criterios seleccionados.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($companies->hasPages())
            <div class="card-footer bg-white border-0 py-3">
                {{ $companies->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
