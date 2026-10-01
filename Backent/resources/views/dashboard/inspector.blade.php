@extends('layouts.app')

@section('title', 'Dashboard Inspector')

@section('content')
<div class="container-fluid p-0">
    <!-- Header Inspector -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
            <div class="d-flex align-items-center gap-2 mb-1">
                <h3 class="fw-bold text-dark mb-0">Hola, {{ auth()->user()->name }}</h3>
                @if(auth()->user()->license_number)
                    <span class="badge bg-primary"><i class="fa-solid fa-id-badge me-1"></i> {{ auth()->user()->license_number }}</span>
                @endif
            </div>
            <p class="text-muted small mb-0">Panel operativo para gestión de inspecciones en campo y seguimiento de no conformidades</p>
        </div>
        <div class="mt-3 mt-md-0 d-flex gap-2">
            <a href="{{ route('companies.create') }}" class="btn btn-outline-primary btn-touch shadow-sm">
                <i class="fa-solid fa-building me-2"></i> Registrar Empresa
            </a>
            <a href="{{ route('inspections.create') }}" class="btn btn-warning btn-touch text-dark fw-bold shadow-sm">
                <i class="fa-solid fa-clipboard-check me-2"></i> Iniciar Inspección
            </a>
        </div>
    </div>

    <!-- Mobile Quick Action Card -->
    <div class="card card-custom bg-primary text-white mb-4 d-md-none">
        <div class="card-body p-4 text-center">
            <i class="fa-solid fa-clipboard-user fa-3x mb-2 text-warning"></i>
            <h5 class="fw-bold">¿Realizando una inspección ahora?</h5>
            <p class="small text-white-50 mb-3">Complete el checklist con fotos desde la cámara de su celular o tablet.</p>
            <a href="{{ route('inspections.create') }}" class="btn btn-warning btn-touch w-100 text-dark fw-bold">
                <i class="fa-solid fa-camera me-2"></i> Nueva Inspección en Campo
            </a>
        </div>
    </div>

    <!-- Inspector KPIs -->
    <div class="row g-3 mb-4">
        <div class="col-sm-6 col-xl-3">
            <div class="card card-custom h-100 p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Mis Inspecciones</span>
                        <h2 class="fw-bold text-dark mb-0 mt-1">{{ $totalMyInspections }}</h2>
                        <small class="text-success fw-semibold"><i class="fa-solid fa-circle-check me-1"></i> {{ $completedCount }} finalizadas</small>
                    </div>
                    <div class="bg-primary bg-opacity-10 text-primary p-3 rounded-4">
                        <i class="fa-solid fa-clipboard-list fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-xl-3">
            <div class="card card-custom h-100 p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">En Progreso / Abiertas</span>
                        <h2 class="fw-bold text-dark mb-0 mt-1">{{ $inProgressCount }}</h2>
                        <small class="text-warning fw-semibold"><i class="fa-solid fa-clock me-1"></i> Requieren cierre</small>
                    </div>
                    <div class="bg-warning bg-opacity-10 text-warning p-3 rounded-4">
                        <i class="fa-solid fa-spinner fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-xl-3">
            <div class="card card-custom h-100 p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Observaciones Críticas</span>
                        <h2 class="fw-bold text-danger mb-0 mt-1">{{ $criticalObsCount }}</h2>
                        <small class="text-danger fw-semibold"><i class="fa-solid fa-triangle-exclamation me-1"></i> Mayor / Crítico</small>
                    </div>
                    <div class="bg-danger bg-opacity-10 text-danger p-3 rounded-4">
                        <i class="fa-solid fa-radiation fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-xl-3">
            <div class="card card-custom h-100 p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Medidas a Seguimiento</span>
                        <h2 class="fw-bold text-dark mb-0 mt-1">{{ $myPendingMeasures }}</h2>
                        <small class="text-primary fw-semibold"><i class="fa-solid fa-list-check me-1"></i> En plan de acción</small>
                    </div>
                    <div class="bg-info bg-opacity-10 text-info p-3 rounded-4">
                        <i class="fa-solid fa-tasks fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Row: Alertas de Vencimiento y Gráfico de Producción -->
    <div class="row g-4 mb-4">
        <!-- Alertas Próximas a Vencer -->
        <div class="col-lg-6">
            <div class="card card-custom h-100">
                <div class="card-header bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold text-danger mb-0"><i class="fa-solid fa-bell me-2"></i> Medidas Correctivas con Plazo Crítico</h5>
                    <a href="{{ route('corrective-measures.index') }}" class="btn btn-sm btn-outline-secondary">Ver todas</a>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Empresa</th>
                                    <th>Medida Correctiva</th>
                                    <th>Prioridad</th>
                                    <th>Plazo</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($myAlerts as $alert)
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
                                            No tienes medidas críticas próximas a vencer.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mi Rendimiento Mensual -->
        <div class="col-lg-6">
            <div class="card card-custom h-100">
                <div class="card-header bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-chart-line me-2 text-primary"></i> Mis Inspecciones por Mes</h5>
                    <span class="badge bg-light text-secondary border">Historial reciente</span>
                </div>
                <div class="card-body px-4 pb-4">
                    <canvas id="inspectorChart" style="max-height: 240px; width: 100%;"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Mis Inspecciones Recientes -->
    <div class="card card-custom">
        <div class="card-header bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-clipboard-check me-2 text-primary"></i> Mis Inspecciones Recientes</h5>
            <a href="{{ route('inspections.index') }}" class="btn btn-sm btn-outline-primary">Ver todas</a>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Fecha</th>
                            <th>Empresa</th>
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
                                        <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> Abrir
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center py-4 text-muted">Aún no has registrado ninguna inspección. ¡Inicia una ahora!</td>
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
        const ctx = document.getElementById('inspectorChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: {!! json_encode($months) !!},
                datasets: [{
                    label: 'Inspecciones Realizadas',
                    data: {!! json_encode($monthlyCounts) !!},
                    backgroundColor: '#007bb5',
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
    });
</script>
@endpush
