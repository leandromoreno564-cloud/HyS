@extends('layouts.app')

@section('title', 'Dashboard Administrador')

@section('content')
<div class="container-fluid p-0">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Panel de Control Global</h3>
            <p class="text-muted small mb-0">Supervisión estratégica de inspecciones, empresas y cumplimiento normativo</p>
        </div>
        <div class="mt-3 mt-md-0 d-flex gap-2">
            <a href="{{ route('reports.csv') }}" class="btn btn-outline-success btn-touch shadow-sm">
                <i class="fa-solid fa-file-excel me-2"></i> Exportar Datos (Excel)
            </a>
            <a href="{{ route('inspections.create') }}" class="btn btn-warning btn-touch text-dark fw-bold shadow-sm">
                <i class="fa-solid fa-plus-circle me-2"></i> Nueva Inspección
            </a>
        </div>
    </div>

    <!-- KPI Cards -->
    <div class="row g-3 mb-4">
        <div class="col-sm-6 col-xl-3">
            <div class="card card-custom h-100 p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Empresas Activas</span>
                        <h2 class="fw-bold text-dark mb-0 mt-1">{{ $totalCompanies }}</h2>
                        <small class="text-success fw-semibold"><i class="fa-solid fa-building me-1"></i> Cobertura total</small>
                    </div>
                    <div class="bg-primary bg-opacity-10 text-primary p-3 rounded-4">
                        <i class="fa-solid fa-building fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-xl-3">
            <div class="card card-custom h-100 p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Inspecciones</span>
                        <h2 class="fw-bold text-dark mb-0 mt-1">{{ $totalInspections }}</h2>
                        <small class="text-primary fw-semibold">{{ $completedInspections }} completadas / {{ $inProgressInspections }} en curso</small>
                    </div>
                    <div class="bg-info bg-opacity-10 text-info p-3 rounded-4">
                        <i class="fa-solid fa-clipboard-check fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-xl-3">
            <div class="card card-custom h-100 p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Licenciados / Inspectores</span>
                        <h2 class="fw-bold text-dark mb-0 mt-1">{{ $totalUsers }}</h2>
                        <small class="text-muted"><i class="fa-solid fa-users me-1"></i> Equipo técnico</small>
                    </div>
                    <div class="bg-success bg-opacity-10 text-success p-3 rounded-4">
                        <i class="fa-solid fa-user-shield fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-xl-3">
            <div class="card card-custom h-100 p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Medidas Correctivas</span>
                        <h2 class="fw-bold text-dark mb-0 mt-1">{{ $pendingMeasures }}</h2>
                        @if($overdueMeasures > 0)
                            <small class="text-danger fw-bold"><i class="fa-solid fa-circle-exclamation me-1"></i> {{ $overdueMeasures }} medidas vencidas</small>
                        @else
                            <small class="text-success fw-semibold"><i class="fa-solid fa-check me-1"></i> Al día</small>
                        @endif
                    </div>
                    <div class="bg-danger bg-opacity-10 text-danger p-3 rounded-4">
                        <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-4 mb-4">
        <!-- Gráfico Mensual -->
        <div class="col-lg-8">
            <div class="card card-custom h-100">
                <div class="card-header bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-chart-column me-2 text-primary"></i> Inspecciones Realizadas por Mes</h5>
                    <span class="badge bg-light text-secondary border">Últimos 6 meses</span>
                </div>
                <div class="card-body px-4 pb-4">
                    <canvas id="inspectionsChart" style="max-height: 280px; width: 100%;"></canvas>
                </div>
            </div>
        </div>

        <!-- Gráfico Estado -->
        <div class="col-lg-4">
            <div class="card card-custom h-100">
                <div class="card-header bg-white border-0 pt-3 px-4">
                    <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-chart-pie me-2 text-info"></i> Estado de Auditorías</h5>
                </div>
                <div class="card-body px-4 pb-4 d-flex flex-column align-items-center justify-content-center">
                    <div style="width: 220px; height: 220px;">
                        <canvas id="statusChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Alertas y Ranking Row -->
    <div class="row g-4 mb-4">
        <!-- Alertas de Seguridad -->
        <div class="col-lg-6">
            <div class="card card-custom h-100">
                <div class="card-header bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold text-danger mb-0"><i class="fa-solid fa-triangle-exclamation me-2"></i> Alertas de Seguridad Críticas / Próximas a Vencer</h5>
                    <a href="{{ route('corrective-measures.index') }}" class="btn btn-sm btn-outline-secondary">Ver todas</a>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Empresa</th>
                                    <th>Medida Propuesta</th>
                                    <th>Prioridad</th>
                                    <th>Límite</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($criticalAlerts as $alert)
                                    <tr>
                                        <td class="fw-semibold">{{ $alert->inspection->company->business_name ?? 'N/A' }}</td>
                                        <td>
                                            <span class="d-inline-block text-truncate" style="max-width: 220px;" title="{{ $alert->description }}">
                                                {{ $alert->description }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge {{ $alert->priority === 'Crítica' ? 'bg-danger' : 'bg-warning text-dark' }}">
                                                {{ $alert->priority }}
                                            </span>
                                        </td>
                                        <td>
                                            @if($alert->deadline)
                                                <span class="{{ $alert->isOverdue() ? 'text-danger fw-bold' : 'text-muted' }}">
                                                    {{ $alert->deadline->format('d/m/Y') }}
                                                    @if($alert->isOverdue()) <i class="fa-solid fa-circle-exclamation ms-1"></i> @endif
                                                </span>
                                            @else
                                                <span class="text-muted">Sin plazo</span>
                                            @endif
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" class="text-center py-4 text-muted">
                                            <i class="fa-solid fa-circle-check text-success fa-2x mb-2 d-block"></i>
                                            No hay medidas correctivas críticas pendientes.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Ranking Empresas con Observaciones -->
        <div class="col-lg-6">
            <div class="card card-custom h-100">
                <div class="card-header bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-ranking-star me-2 text-warning"></i> Empresas con Mayor Cantidad de Observaciones</h5>
                    <a href="{{ route('companies.index') }}" class="btn btn-sm btn-outline-secondary">Ver empresas</a>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Empresa</th>
                                    <th>Sector Industrial</th>
                                    <th class="text-center">Total Hallazgos</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($topCompaniesWithObs as $comp)
                                    <tr>
                                        <td class="fw-semibold">{{ $comp->business_name }}</td>
                                        <td><span class="badge bg-light text-dark border">{{ $comp->industry_sector }}</span></td>
                                        <td class="text-center">
                                            <span class="badge bg-danger rounded-pill px-3">{{ $comp->observations_count }}</span>
                                        </td>
                                        <td>
                                            <a href="{{ route('companies.show', $comp) }}" class="btn btn-sm btn-outline-primary">
                                                <i class="fa-solid fa-arrow-right"></i>
                                            </a>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" class="text-center py-4 text-muted">No se registran datos suficientes.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Inspecciones Recientes -->
    <div class="card card-custom">
        <div class="card-header bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-clock-rotate-left me-2 text-primary"></i> Últimas Inspecciones Realizadas</h5>
            <a href="{{ route('inspections.index') }}" class="btn btn-sm btn-outline-primary">Ver todas las inspecciones</a>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Fecha</th>
                            <th>Empresa</th>
                            <th>Inspector</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Avance</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentInspections as $insp)
                            <tr>
                                <td>{{ $insp->inspection_date->format('d/m/Y') }}</td>
                                <td class="fw-semibold">{{ $insp->company->business_name ?? 'N/A' }}</td>
                                <td>{{ $insp->user->name ?? 'N/A' }}</td>
                                <td><span class="badge bg-secondary">{{ $insp->type }}</span></td>
                                <td>
                                    <span class="badge {{ $insp->status === 'Completada' ? 'bg-success' : ($insp->status === 'En Progreso' ? 'bg-primary' : 'bg-warning text-dark') }}">
                                        {{ $insp->status }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="progress flex-grow-1 me-2" style="height: 6px;">
                                            <div class="progress-bar {{ $insp->progress_percentage == 100 ? 'bg-success' : 'bg-primary' }}" style="width: {{ $insp->progress_percentage }}%;"></div>
                                        </div>
                                        <small class="fw-bold">{{ $insp->progress_percentage }}%</small>
                                    </div>
                                </td>
                                <td class="text-end">
                                    <a href="{{ route('inspections.show', $insp) }}" class="btn btn-sm btn-primary">
                                        <i class="fa-solid fa-eye me-1"></i> Ver
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-4 text-muted">Aún no hay inspecciones cargadas en la plataforma.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    document.addEventListener("DOMContentLoaded", function () {
        // Chart 1: Inspecciones por mes
        const ctx1 = document.getElementById('inspectionsChart').getContext('2d');
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: {!! json_encode($months) !!},
                datasets: [{
                    label: 'Inspecciones',
                    data: {!! json_encode($monthlyCounts) !!},
                    backgroundColor: '#1b365d',
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Chart 2: Estado de auditorías
        const ctx2 = document.getElementById('statusChart').getContext('2d');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: {!! json_encode(array_keys($statusCounts)) !!},
                datasets: [{
                    data: {!! json_encode(array_values($statusCounts)) !!},
                    backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12 } }
                }
            }
        });
    });
</script>
@endpush
