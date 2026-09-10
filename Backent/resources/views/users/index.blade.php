@extends('layouts.app')

@section('title', 'Gestión de Usuarios')

@section('content')
<div class="container-fluid p-0">
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Gestión de Usuarios y Profesionales</h3>
            <p class="text-muted small mb-0">Administración de credenciales, roles y habilitación de licenciados</p>
        </div>
        <div class="mt-3 mt-md-0">
            <a href="{{ route('users.create') }}" class="btn btn-primary btn-touch shadow-sm">
                <i class="fa-solid fa-user-plus me-2"></i> Nuevo Usuario
            </a>
        </div>
    </div>

    <!-- Filtros de búsqueda -->
    <div class="card card-custom mb-4">
        <div class="card-body p-3">
            <form action="{{ route('users.index') }}" method="GET" class="row g-2 align-items-center">
                <div class="col-md-5">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="fa-solid fa-magnifying-glass"></i></span>
                        <input type="text" name="search" class="form-control border-start-0" placeholder="Buscar por nombre, email o matrícula..." value="{{ request('search') }}">
                    </div>
                </div>
                <div class="col-md-3">
                    <select name="role" class="form-select">
                        <option value="">Todos los roles</option>
                        <option value="admin" {{ request('role') === 'admin' ? 'selected' : '' }}>Administrador</option>
                        <option value="inspector" {{ request('role') === 'inspector' ? 'selected' : '' }}>Licenciado / Inspector</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <select name="status" class="form-select">
                        <option value="">Todos los estados</option>
                        <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Activos</option>
                        <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactivos</option>
                    </select>
                </div>
                <div class="col-md-2 d-flex gap-2">
                    <button type="submit" class="btn btn-secondary w-100">Filtrar</button>
                    @if(request()->anyFilled(['search', 'role', 'status']))
                        <a href="{{ route('users.index') }}" class="btn btn-light border"><i class="fa-solid fa-xmark"></i></a>
                    @endif
                </div>
            </form>
        </div>
    </div>

    <!-- Tabla de Usuarios -->
    <div class="card card-custom">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Matrícula</th>
                            <th>Teléfono</th>
                            <th>Inspecciones</th>
                            <th>Estado</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($users as $u)
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-2" style="width: 38px; height: 38px; font-size: 0.9rem;">
                                            {{ strtoupper(substr($u->name, 0, 2)) }}
                                        </div>
                                        <div>
                                            <div class="fw-bold text-dark">{{ $u->name }}</div>
                                            <small class="text-muted">{{ $u->email }}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge {{ $u->isAdmin() ? 'bg-danger' : 'bg-primary' }}">
                                        {{ $u->isAdmin() ? 'Administrador' : 'Licenciado' }}
                                    </span>
                                </td>
                                <td>
                                    @if($u->license_number)
                                        <span class="badge bg-light text-dark border">{{ $u->license_number }}</span>
                                    @else
                                        <span class="text-muted small">No especificada</span>
                                    @endif
                                </td>
                                <td>{{ $u->phone ?? '-' }}</td>
                                <td>
                                    <span class="badge bg-light text-primary border">{{ $u->inspections_count }} asignadas</span>
                                </td>
                                <td>
                                    @if($u->is_active)
                                        <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Activo</span>
                                    @else
                                        <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">Inactivo</span>
                                    @endif
                                </td>
                                <td class="text-end">
                                    <div class="btn-group">
                                        <a href="{{ route('users.edit', $u) }}" class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </a>

                                        @if($u->id !== auth()->id())
                                            <form action="{{ route('users.toggle-status', $u) }}" method="POST" class="d-inline">
                                                @csrf
                                                <button type="submit" class="btn btn-sm {{ $u->is_active ? 'btn-outline-warning' : 'btn-outline-success' }}" title="{{ $u->is_active ? 'Deshabilitar' : 'Habilitar' }}">
                                                    <i class="fa-solid {{ $u->is_active ? 'fa-user-slash' : 'fa-user-check' }}"></i>
                                                </button>
                                            </form>

                                            <form action="{{ route('users.destroy', $u) }}" method="POST" class="d-inline" onsubmit="return confirm('¿Está seguro de eliminar a este usuario?');">
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
                                <td colspan="7" class="text-center py-4 text-muted">No se encontraron usuarios registrados.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($users->hasPages())
            <div class="card-footer bg-white border-0 py-3">
                {{ $users->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
