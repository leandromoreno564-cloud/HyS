@extends('layouts.app')

@section('title', $company->business_name)

@section('content')
<div class="container-fluid p-0">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
            <div class="d-flex align-items-center gap-2 mb-1">
                <h3 class="fw-bold text-dark mb-0">{{ $company->business_name }}</h3>
                <span class="badge bg-light text-dark border">{{ $company->industry_sector }}</span>
                @if($company->is_active)
                    <span class="badge bg-success">Activa</span>
                @else
                    <span class="badge bg-secondary">Inactiva</span>
                @endif
            </div>
            <p class="text-muted small mb-0">CUIT / RUC: <strong>{{ $company->tax_id }}</strong> | Registrada por: {{ $company->creator->name ?? 'Sistema' }}</p>
        </div>
        <div class="mt-3 mt-md-0 d-flex gap-2">
            <a href="{{ route('companies.index') }}" class="btn btn-outline-secondary btn-touch">
                <i class="fa-solid fa-arrow-left me-1"></i> Volver
            </a>
            <a href="{{ route('companies.edit', $company) }}" class="btn btn-outline-primary btn-touch">
                <i class="fa-solid fa-pen-to-square me-1"></i> Editar
            </a>
            <a href="{{ route('inspections.create', ['company_id' => $company->id]) }}" class="btn btn-warning btn-touch text-dark fw-bold shadow-sm">
                <i class="fa-solid fa-plus-circle me-1"></i> Nueva Inspección
            </a>
        </div>
    </div>

    <div class="row g-4 mb-4">
        <!-- Tarjeta de Información General -->
        <div class="col-lg-8">
            <div class="card card-custom h-100">
                <div class="card-header bg-white border-0 pt-3 px-4">
                    <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-circle-info me-2 text-primary"></i> Datos Generales del Establecimiento</h5>
                </div>
                <div class="card-body px-4 pb-4">
                    <div class="row g-3">
                        <div class="col-sm-6">
                            <span class="text-muted small d-block">Dirección de Planta</span>
                            <span class="fw-semibold text-dark">{{ $company->address ?? 'No especificada' }}</span>
                        </div>
                        <div class="col-sm-6">
                            <span class="text-muted small d-block">Dotación de Personal</span>
                            <span class="fw-semibold text-dark"><i class="fa-solid fa-users me-1 text-secondary"></i> {{ $company->employee_count }} trabajadores</span>
                        </div>
                        <div class="col-sm-6">
                            <span class="text-muted small d-block">Teléfono</span>
                            <span class="fw-semibold text-dark">{{ $company->phone ?? 'No especificado' }}</span>
                        </div>
                        <div class="col-sm-6">
                            <span class="text-muted small d-block">Correo Electrónico</span>
                            <span class="fw-semibold text-dark">{{ $company->email ?? 'No especificado' }}</span>
                        </div>
                        <div class="col-sm-6">
                            <span class="text-muted small d-block">Persona de Contacto</span>
                            <span class="fw-semibold text-dark">{{ $company->contact_person ?? 'No especificado' }}</span>
                        </div>
                        <div class="col-sm-6">
                            <span class="text-muted small d-block">Sitio Web</span>
                            @if($company->website)
                                <a href="{{ $company->website }}" target="_blank" class="fw-semibold text-primary text-decoration-none">
                                    {{ $company->website }} <i class="fa-solid fa-arrow-up-right-from-square small ms-1"></i>
                                </a>
                            @else
                                <span class="text-muted">No especificado</span>
                            @endif
                        </div>
                    </div>

                    <hr class="my-4 text-muted">

                    <!-- Inspectores Responsables -->
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="fw-bold text-dark mb-0"><i class="fa-solid fa-user-shield me-2 text-primary"></i> Licenciados Asignados</h6>
                        @if(auth()->user()->isAdmin())
                            <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#assignModal">
                                <i class="fa-solid fa-user-plus me-1"></i> Asignar Inspectores
                            </button>
                        @endif
                    </div>

                    <div class="d-flex flex-wrap gap-2">
                        @forelse($company->inspectors as $insp)
                            <div class="border rounded px-3 py-2 bg-light d-flex align-items-center">
                                <i class="fa-solid fa-id-badge text-primary fa-lg me-2"></i>
                                <div>
                                    <div class="fw-bold text-dark small">{{ $insp->name }}</div>
                                    <small class="text-muted">{{ $insp->license_number ?? $insp->email }}</small>
                                </div>
                            </div>
                        @empty
                            <p class="text-muted small mb-0">No hay inspectores asignados a esta empresa.</p>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>

        <!-- Tarjeta Código QR Dinámico (Entregable Opcional 1) -->
        <div class="col-lg-4">
            <div class="card card-custom h-100 text-center p-4 d-flex flex-column align-items-center justify-content-center">
                <div class="bg-light p-3 rounded-3 border mb-3 shadow-sm">
                    @php
                        $qrData = route('companies.show', $company);
                        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' . urlencode($qrData);
                    @endphp
                    <img src="{{ $qrUrl }}" alt="Código QR Empresa" class="img-fluid" style="width: 150px; height: 150px;">
                </div>
                <h6 class="fw-bold text-dark mb-1">Código QR de la Empresa</h6>
                <p class="text-muted small mb-3">Escanee en el establecimiento para acceder al historial técnico de inspecciones.</p>
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="window.print()">
                    <i class="fa-solid fa-print me-1"></i> Imprimir Ficha / Cartel QR
                </button>
            </div>
        </div>
    </div>

    <!-- Historial de Inspecciones Realizadas (RF-17) -->
    <div class="card card-custom">
        <div class="card-header bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-clock-rotate-left me-2 text-primary"></i> Historial de Inspecciones en esta Empresa</h5>
            <a href="{{ route('inspections.create', ['company_id' => $company->id]) }}" class="btn btn-sm btn-warning text-dark fw-bold">
                <i class="fa-solid fa-plus-circle me-1"></i> Iniciar Inspección
            </a>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Fecha</th>
                            <th>Inspector Responsable</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Observaciones</th>
                            <th>Avance Checklist</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($company->inspections as $ins)
                            <tr>
                                <td class="fw-semibold">{{ $ins->inspection_date->format('d/m/Y') }}</td>
                                <td>{{ $ins->user->name ?? 'N/A' }}</td>
                                <td><span class="badge bg-secondary">{{ $ins->type }}</span></td>
                                <td>
                                    <span class="badge {{ $ins->status === 'Completada' ? 'bg-success' : ($ins->status === 'En Progreso' ? 'bg-primary' : 'bg-warning text-dark') }}">
                                        {{ $ins->status }}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle">
                                        {{ $ins->observations->count() }} hallazgos
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="progress flex-grow-1 me-2" style="height: 6px;">
                                            <div class="progress-bar {{ $ins->progress_percentage == 100 ? 'bg-success' : 'bg-primary' }}" style="width: {{ $ins->progress_percentage }}%;"></div>
                                        </div>
                                        <small class="fw-bold">{{ $ins->progress_percentage }}%</small>
                                    </div>
                                </td>
                                <td class="text-end">
                                    <a href="{{ route('inspections.show', $ins) }}" class="btn btn-sm btn-primary">
                                        <i class="fa-solid fa-eye me-1"></i> Abrir
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-4 text-muted">
                                    No se registran inspecciones para esta empresa aún.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal para Asignación de Inspectores (Admin) -->
@if(auth()->user()->isAdmin())
<div class="modal fade" id="assignModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <form action="{{ route('companies.assign', $company) }}" method="POST">
            @csrf
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Asignar Inspectores a {{ $company->business_name }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted small mb-3">Marque los licenciados autorizados a realizar inspecciones en este establecimiento:</p>
                    <div class="d-flex flex-column gap-2">
                        @foreach($inspectors as $insp)
                            <div class="form-check p-2 border rounded">
                                <input class="form-check-input ms-0 me-2" type="checkbox" name="inspector_ids[]" value="{{ $insp->id }}" id="modal_insp_{{ $insp->id }}" {{ $company->inspectors->contains('id', $insp->id) ? 'checked' : '' }}>
                                <label class="form-check-label fw-semibold" for="modal_insp_{{ $insp->id }}">
                                    {{ $insp->name }}
                                    <small class="text-muted d-block">{{ $insp->license_number ?? $insp->email }}</small>
                                </label>
                            </div>
                        @endforeach
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light border" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar Asignaciones</button>
                </div>
            </div>
        </form>
    </div>
</div>
@endif
@endsection
