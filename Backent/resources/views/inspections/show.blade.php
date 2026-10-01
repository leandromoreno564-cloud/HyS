@extends('layouts.app')

@section('title', 'Inspección en ' . ($inspection->company->business_name ?? 'Empresa'))

@section('content')
<div class="container-fluid p-0">
    <!-- Header de Inspección -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
            <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span class="badge {{ $inspection->status === 'Completada' ? 'bg-success' : ($inspection->status === 'En Progreso' ? 'bg-primary' : 'bg-warning text-dark') }} fs-6">
                    <i class="fa-solid {{ $inspection->status === 'Completada' ? 'fa-check-circle' : 'fa-clock' }} me-1"></i>
                    {{ $inspection->status }}
                </span>
                <h3 class="fw-bold text-dark mb-0">{{ $inspection->company->business_name ?? 'Empresa' }}</h3>
                <span class="badge bg-light text-dark border">{{ $inspection->type }}</span>
            </div>
            <p class="text-muted small mb-0">
                <i class="fa-regular fa-calendar me-1"></i> {{ $inspection->inspection_date->format('d/m/Y') }}
                @if($inspection->start_time) | <i class="fa-regular fa-clock me-1"></i> {{ $inspection->start_time }} {{ $inspection->end_time ? 'a ' . $inspection->end_time : '' }} @endif
                | <i class="fa-solid fa-user-check me-1"></i> Inspector: <strong>{{ $inspection->user->name ?? 'N/A' }}</strong> ({{ $inspection->user->license_number ?? 'Sin matrícula' }})
            </p>
        </div>

        <div class="mt-3 mt-md-0 d-flex gap-2 flex-wrap">
            <a href="{{ route('inspections.index') }}" class="btn btn-outline-secondary btn-touch">
                <i class="fa-solid fa-arrow-left me-1"></i> Listado
            </a>
            <a href="{{ route('reports.pdf', $inspection) }}" class="btn btn-danger btn-touch shadow-sm" target="_blank">
                <i class="fa-solid fa-file-pdf me-2"></i> Descargar Informe PDF
            </a>
            <a href="{{ route('inspections.edit', $inspection) }}" class="btn btn-outline-secondary btn-touch">
                <i class="fa-solid fa-gear me-1"></i> Ajustes
            </a>
        </div>
    </div>

    <!-- Barra de Avance y Métricas Técnicas (RF-32, RF-33) -->
    <div class="card card-custom mb-4">
        <div class="card-body p-3 p-md-4">
            <div class="row align-items-center g-3">
                <div class="col-md-5">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-bold text-dark small text-uppercase">Progreso de Evaluación del Checklist</span>
                        <span class="fw-bold fs-5 text-primary" id="progressPercentageText">{{ $inspection->progress_percentage }}%</span>
                    </div>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated {{ $inspection->progress_percentage == 100 ? 'bg-success' : 'bg-primary' }}" id="progressBar" style="width: {{ $inspection->progress_percentage }}%;"></div>
                    </div>
                </div>

                <div class="col-md-7">
                    <div class="row text-center g-2">
                        <div class="col-3">
                            <div class="p-2 border rounded bg-light">
                                <small class="text-muted d-block" style="font-size: 0.72rem;">Cumplimiento</small>
                                <span class="fw-bold text-success fs-6">{{ $stats['rate'] }}%</span>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="p-2 border rounded bg-light">
                                <small class="text-muted d-block" style="font-size: 0.72rem;">Cumplen</small>
                                <span class="fw-bold text-success fs-6">{{ $stats['cumple'] }}</span>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="p-2 border rounded bg-light">
                                <small class="text-muted d-block" style="font-size: 0.72rem;">No Cumplen</small>
                                <span class="fw-bold text-danger fs-6">{{ $stats['no_cumple'] }}</span>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="p-2 border rounded bg-light">
                                <small class="text-muted d-block" style="font-size: 0.72rem;">Pendientes</small>
                                <span class="fw-bold text-warning fs-6">{{ $stats['pendiente'] }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Navegación por Pestañas (Tabs) -->
    <ul class="nav nav-pills card-header-pills mb-4 bg-white p-2 rounded-3 shadow-sm" id="inspectionTabs" role="tablist">
        <li class="nav-item flex-fill text-center" role="presentation">
            <button class="nav-link active fw-bold w-100 py-2" id="checklist-tab" data-bs-toggle="tab" data-bs-target="#checklist-content" type="button" role="tab">
                <i class="fa-solid fa-list-check me-2"></i> Checklists Técnicos ({{ $inspection->checklistItems->count() }})
            </button>
        </li>
        <li class="nav-item flex-fill text-center" role="presentation">
            <button class="nav-link fw-bold w-100 py-2" id="observations-tab" data-bs-toggle="tab" data-bs-target="#observations-content" type="button" role="tab">
                <i class="fa-solid fa-camera me-2"></i> Observaciones con Fotos ({{ $inspection->observations->count() }})
            </button>
        </li>
        <li class="nav-item flex-fill text-center" role="presentation">
            <button class="nav-link fw-bold w-100 py-2" id="measures-tab" data-bs-toggle="tab" data-bs-target="#measures-content" type="button" role="tab">
                <i class="fa-solid fa-triangle-exclamation me-2"></i> Medidas Correctivas ({{ $inspection->correctiveMeasures->count() }})
            </button>
        </li>
        <li class="nav-item flex-fill text-center" role="presentation">
            <button class="nav-link fw-bold w-100 py-2" id="signatures-tab" data-bs-toggle="tab" data-bs-target="#signatures-content" type="button" role="tab">
                <i class="fa-solid fa-signature me-2"></i> Firmas y Cierre
            </button>
        </li>
    </ul>

    <!-- Contenido de las Pestañas -->
    <div class="tab-content" id="inspectionTabsContent">

        <!-- ==================== TAB 1: CHECKLISTS TÉCNICOS ==================== -->
        <div class="tab-pane fade show active" id="checklist-content" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-clipboard-list text-primary me-2"></i> Listas de Verificación Normativa</h5>
                <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#customItemModal">
                    <i class="fa-solid fa-plus me-1"></i> Agregar Ítem Personalizado
                </button>
            </div>

            <!-- Acordeón de Categorías -->
            <div class="accordion mb-4" id="checklistAccordion">
                @foreach($groupedChecklist as $categoryName => $items)
                    @php
                        $catId = Str::slug($categoryName);
                        $catPending = $items->where('status', 'Pendiente')->count();
                        $catNoCumple = $items->where('status', 'No Cumple')->count();
                    @endphp
                    <div class="accordion-item card-custom mb-3 border-0 overflow-hidden">
                        <h2 class="accordion-header" id="heading_{{ $catId }}">
                            <button class="accordion-button collapsed px-4 py-3 bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_{{ $catId }}" aria-expanded="false">
                                <div class="d-flex align-items-center justify-content-between w-100 me-3">
                                    <div class="d-flex align-items-center">
                                        <div class="bg-light text-primary rounded p-2 me-3 border">
                                            <i class="fa-solid fa-clipboard-check"></i>
                                        </div>
                                        <div class="text-start">
                                            <span class="fw-bold text-dark d-block">{{ $categoryName }}</span>
                                            <small class="text-muted">{{ $items->count() }} ítems evaluados</small>
                                        </div>
                                    </div>
                                    <div class="d-flex gap-2">
                                        @if($catNoCumple > 0)
                                            <span class="badge bg-danger rounded-pill">{{ $catNoCumple }} no cumple</span>
                                        @endif
                                        @if($catPending > 0)
                                            <span class="badge bg-warning text-dark rounded-pill">{{ $catPending }} pendientes</span>
                                        @else
                                            <span class="badge bg-success rounded-pill"><i class="fa-solid fa-check"></i> Completo</span>
                                        @endif
                                    </div>
                                </div>
                            </button>
                        </h2>
                        <div id="collapse_{{ $catId }}" class="accordion-collapse collapse" data-bs-parent="#checklistAccordion">
                            <div class="accordion-body p-0 border-top">
                                @foreach($items as $item)
                                    <div class="p-3 border-bottom {{ $item->status === 'No Cumple' ? 'bg-danger bg-opacity-10' : ($item->status === 'Cumple' ? 'bg-success bg-opacity-10' : '') }}">
                                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                                            <div class="flex-grow-1">
                                                <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                                    <span class="badge {{ $item->status === 'Cumple' ? 'badge-status-cumple' : ($item->status === 'No Cumple' ? 'badge-status-no-cumple' : ($item->status === 'No Aplica' ? 'badge-status-no-aplica' : 'badge-status-pendiente')) }} px-2 py-1">
                                                        {{ $item->status }}
                                                    </span>
                                                    <span class="badge {{ $item->risk_level === 'Alto' ? 'bg-danger' : ($item->risk_level === 'Medio' ? 'bg-warning text-dark' : 'bg-info') }}">
                                                        Riesgo {{ $item->risk_level }}
                                                    </span>
                                                    @if($item->is_custom)
                                                        <span class="badge bg-dark">Personalizado</span>
                                                    @endif
                                                </div>
                                                <h6 class="fw-bold text-dark mb-1">{{ $item->title }}</h6>
                                                @if($item->normative_reference)
                                                    <div class="small text-muted mb-1">
                                                        <i class="fa-solid fa-scale-balanced me-1 text-secondary"></i> Normativa: <strong>{{ $item->normative_reference }}</strong>
                                                        @if($item->verification_method) | Verificación: {{ $item->verification_method }} @endif
                                                    </div>
                                                @endif
                                                @if($item->notes)
                                                    <div class="small p-2 bg-white rounded border mt-2 text-secondary">
                                                        <i class="fa-regular fa-comment-dots me-1 text-primary"></i> {{ $item->notes }}
                                                    </div>
                                                @endif
                                            </div>

                                            <!-- Formulario de Evaluación Rápida -->
                                            <div class="d-flex flex-column align-items-md-end gap-2" style="min-width: 260px;">
                                                <form action="{{ route('inspections.checklist.update', [$inspection, $item]) }}" method="POST" enctype="multipart/form-data" class="w-100">
                                                    @csrf
                                                    <div class="btn-group w-100 mb-2" role="group">
                                                        <button type="submit" name="status" value="Cumple" class="btn btn-sm {{ $item->status === 'Cumple' ? 'btn-success' : 'btn-outline-success' }}" title="Cumple">
                                                            <i class="fa-solid fa-check"></i> Cumple
                                                        </button>
                                                        <button type="submit" name="status" value="No Cumple" class="btn btn-sm {{ $item->status === 'No Cumple' ? 'btn-danger' : 'btn-outline-danger' }}" title="No Cumple">
                                                            <i class="fa-solid fa-xmark"></i> No
                                                        </button>
                                                        <button type="submit" name="status" value="No Aplica" class="btn btn-sm {{ $item->status === 'No Aplica' ? 'btn-secondary' : 'btn-outline-secondary' }}" title="No Aplica">
                                                            N/A
                                                        </button>
                                                    </div>

                                                    <input type="hidden" name="risk_level" value="{{ $item->risk_level }}">
                                                    
                                                    <!-- Botón para expandir edición de notas / fotos -->
                                                    <button type="button" class="btn btn-sm btn-outline-secondary w-100" data-bs-toggle="collapse" data-bs-target="#editItem_{{ $item->id }}">
                                                        <i class="fa-solid fa-pen me-1"></i> Notas / Foto
                                                    </button>

                                                    <div class="collapse mt-2 text-start" id="editItem_{{ $item->id }}">
                                                        <div class="p-2 border rounded bg-white">
                                                            <label class="small fw-semibold mb-1">Notas técnicas:</label>
                                                            <textarea name="notes" class="form-control form-control-sm mb-2" rows="2" placeholder="Observaciones sobre este ítem...">{{ $item->notes }}</textarea>
                                                            
                                                            <label class="small fw-semibold mb-1">Nivel de Riesgo:</label>
                                                            <select name="risk_level" class="form-select form-select-sm mb-2">
                                                                <option value="Bajo" {{ $item->risk_level === 'Bajo' ? 'selected' : '' }}>Bajo</option>
                                                                <option value="Medio" {{ $item->risk_level === 'Medio' ? 'selected' : '' }}>Medio</option>
                                                                <option value="Alto" {{ $item->risk_level === 'Alto' ? 'selected' : '' }}>Alto</option>
                                                            </select>

                                                            <label class="small fw-semibold mb-1"><i class="fa-solid fa-camera me-1"></i> Foto de Evidencia:</label>
                                                            <input type="file" name="photos[]" class="form-control form-control-sm mb-2" accept="image/*" capture="environment" multiple>

                                                            <div class="d-flex justify-content-between">
                                                                <button type="submit" name="status" value="{{ $item->status }}" class="btn btn-sm btn-primary">
                                                                    Guardar Detalles
                                                                </button>
                                                                @if($item->is_custom)
                                                                    <form action="{{ route('inspections.checklist.destroy', [$inspection, $item]) }}" method="POST" onsubmit="return confirm('¿Eliminar este ítem?');">
                                                                        @csrf
                                                                        @method('DELETE')
                                                                        <button type="submit" class="btn btn-sm btn-outline-danger"><i class="fa-solid fa-trash"></i></button>
                                                                    </form>
                                                                @endif
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- ==================== TAB 2: OBSERVACIONES CON FOTOS ==================== -->
        <div class="tab-pane fade" id="observations-content" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-camera text-primary me-2"></i> Hallazgos y Registro Fotográfico</h5>
                <button type="button" class="btn btn-primary btn-touch shadow-sm" data-bs-toggle="modal" data-bs-target="#newObservationModal">
                    <i class="fa-solid fa-plus-circle me-1"></i> Registrar Hallazgo / Foto
                </button>
            </div>

            <div class="row g-4">
                @forelse($inspection->observations as $obs)
                    <div class="col-md-6 col-xl-4">
                        <div class="card card-custom h-100">
                            <div class="card-header bg-white border-0 pt-3 px-3 d-flex justify-content-between align-items-center">
                                <span class="badge {{ $obs->type === 'Hallazgo' ? 'bg-danger' : ($obs->type === 'Buena práctica' ? 'bg-success' : 'bg-info') }}">
                                    {{ $obs->type }}
                                </span>
                                <span class="badge {{ $obs->severity === 'Crítico' ? 'bg-danger' : ($obs->severity === 'Mayor' ? 'bg-warning text-dark' : 'bg-secondary') }}">
                                    Severidad: {{ $obs->severity }}
                                </span>
                            </div>
                            <div class="card-body p-3">
                                @if($obs->location)
                                    <div class="text-primary small fw-semibold mb-2">
                                        <i class="fa-solid fa-location-dot me-1"></i> {{ $obs->location }}
                                    </div>
                                @endif
                                <p class="card-text text-dark mb-3">{{ $obs->description }}</p>

                                @if($obs->photos && count($obs->photos) > 0)
                                    <div class="d-flex gap-2 flex-wrap mb-3">
                                        @foreach($obs->photos as $ph)
                                            <a href="{{ asset('storage/' . $ph) }}" target="_blank">
                                                <img src="{{ asset('storage/' . $ph) }}" class="rounded border" style="width: 75px; height: 75px; object-fit: cover;" alt="Evidencia">
                                            </a>
                                        @endforeach
                                    </div>
                                @endif

                                @if($obs->correctiveMeasures->count() > 0)
                                    <div class="p-2 border rounded bg-light small mb-2">
                                        <div class="fw-bold text-dark"><i class="fa-solid fa-arrow-right text-danger me-1"></i> Medida Correctiva Asociada:</div>
                                        @foreach($obs->correctiveMeasures as $cm)
                                            <div class="text-muted text-truncate mt-1">{{ $cm->description }}</div>
                                            <span class="badge bg-secondary">{{ $cm->status }}</span>
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                            <div class="card-footer bg-white border-0 text-end p-2 px-3">
                                <form action="{{ route('observations.destroy', $obs) }}" method="POST" class="d-inline" onsubmit="return confirm('¿Eliminar esta observación?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-outline-danger">
                                        <i class="fa-solid fa-trash-can me-1"></i> Eliminar
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="col-12">
                        <div class="card card-custom p-5 text-center text-muted">
                            <i class="fa-solid fa-camera fa-3x mb-3 text-secondary"></i>
                            <h5 class="fw-bold">No se han registrado observaciones fotográficas</h5>
                            <p class="small mb-3">Capture fotos con la cámara de su dispositivo para documentar no conformidades o buenas prácticas.</p>
                            <div>
                                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newObservationModal">
                                    <i class="fa-solid fa-plus-circle me-1"></i> Registrar Primera Observación
                                </button>
                            </div>
                        </div>
                    </div>
                @endforelse
            </div>
        </div>

        <!-- ==================== TAB 3: MEDIDAS CORRECTIVAS ==================== -->
        <div class="tab-pane fade" id="measures-content" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-list-check text-primary me-2"></i> Plan de Acciones Correctivas y Preventivas</h5>
                <button type="button" class="btn btn-warning btn-touch text-dark fw-bold" data-bs-toggle="modal" data-bs-target="#newMeasureModal">
                    <i class="fa-solid fa-plus-circle me-1"></i> Agregar Medida
                </button>
            </div>

            <div class="card card-custom">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Medida Correctiva</th>
                                    <th>Prioridad</th>
                                    <th>Responsable</th>
                                    <th>Fecha Límite</th>
                                    <th>Costo Estimado</th>
                                    <th>Estado</th>
                                    <th class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($inspection->correctiveMeasures as $m)
                                    <tr>
                                        <td>
                                            <div class="fw-bold text-dark">{{ $m->description }}</div>
                                            @if($m->recommendations)
                                                <small class="text-muted d-block"><i class="fa-regular fa-lightbulb text-warning me-1"></i> {{ $m->recommendations }}</small>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="badge {{ $m->priority === 'Crítica' ? 'bg-danger' : ($m->priority === 'Alta' ? 'bg-warning text-dark' : 'bg-secondary') }}">
                                                {{ $m->priority }}
                                            </span>
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
                                            <form action="{{ route('corrective-measures.destroy', $m) }}" method="POST" class="d-inline" onsubmit="return confirm('¿Eliminar esta medida?');">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-outline-danger">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="7" class="text-center py-4 text-muted">
                                            No se han definido medidas correctivas para esta auditoría aún.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==================== TAB 4: FIRMAS Y CIERRE ==================== -->
        <div class="tab-pane fade" id="signatures-content" role="tabpanel">
            <div class="row g-4">
                <div class="col-lg-7">
                    <div class="card card-custom h-100">
                        <div class="card-header bg-white border-0 pt-3 px-4">
                            <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-signature text-primary me-2"></i> Conformidad y Firmas Digitales</h5>
                            <p class="text-muted small mb-0">Espacio de validación entre el Inspector matriculado y el responsable del establecimiento</p>
                        </div>
                        <div class="card-body px-4 pb-4">
                            <form action="{{ route('inspections.sign', $inspection) }}" method="POST">
                                @csrf
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="p-3 border rounded bg-light h-100">
                                            <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-user-shield me-1 text-primary"></i> Inspector Responsable</h6>
                                            <label class="form-label small text-muted">Aclaración / Matrícula Profesional:</label>
                                            <input type="text" name="signature_inspector" class="form-control form-control-sm mb-2" value="{{ old('signature_inspector', $inspection->signature_inspector ?? ($inspection->user->name . ' - ' . ($inspection->user->license_number ?? 'Matrícula en trámite'))) }}">
                                            <small class="text-success"><i class="fa-solid fa-circle-check me-1"></i> Certificado digitalmente</small>
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="p-3 border rounded bg-light h-100">
                                            <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-building me-1 text-primary"></i> Representante de la Empresa</h6>
                                            <label class="form-label small text-muted">Nombre y Apellido del Receptor:</label>
                                            <input type="text" name="signature_company_name" class="form-control form-control-sm mb-2" placeholder="Ej: Ing. Roberto Gómez" value="{{ old('signature_company_name', $inspection->signature_company_name ?? $inspection->company->contact_person) }}">
                                            <label class="form-label small text-muted">Cargo / Función:</label>
                                            <input type="text" name="signature_company" class="form-control form-control-sm" placeholder="Ej: Jefe de Planta / Responsable HyS" value="{{ old('signature_company', $inspection->signature_company) }}">
                                        </div>
                                    </div>

                                    <div class="col-12 mt-3 text-end">
                                        <button type="submit" class="btn btn-primary btn-touch">
                                            <i class="fa-solid fa-file-signature me-1"></i> Guardar Conformidad de Firmas
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-lg-5">
                    <div class="card card-custom h-100">
                        <div class="card-header bg-white border-0 pt-3 px-4">
                            <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-award text-success me-2"></i> Finalización y Descarga Oficial</h5>
                        </div>
                        <div class="card-body px-4 pb-4">
                            <div class="alert alert-info py-2 small mb-3">
                                <i class="fa-solid fa-shield-halved me-1"></i> Al completar la inspección, se sella el informe técnico con código QR inalterable.
                            </div>

                            <form action="{{ route('inspections.status', $inspection) }}" method="POST" class="mb-3">
                                @csrf
                                <label class="form-label fw-semibold small text-muted">Cambiar Estado de la Auditoría:</label>
                                <div class="input-group">
                                    <select name="status" class="form-select">
                                        <option value="Borrador" {{ $inspection->status === 'Borrador' ? 'selected' : '' }}>Borrador</option>
                                        <option value="En Progreso" {{ $inspection->status === 'En Progreso' ? 'selected' : '' }}>En Progreso</option>
                                        <option value="Completada" {{ $inspection->status === 'Completada' ? 'selected' : '' }}>Completada</option>
                                        <option value="Cancelada" {{ $inspection->status === 'Cancelada' ? 'selected' : '' }}>Cancelada</option>
                                    </select>
                                    <input type="hidden" name="force" value="1">
                                    <button type="submit" class="btn btn-secondary">Actualizar</button>
                                </div>
                            </form>

                            <div class="d-grid gap-2">
                                <a href="{{ route('reports.pdf', $inspection) }}" class="btn btn-danger btn-touch fw-bold shadow-sm" target="_blank">
                                    <i class="fa-solid fa-file-pdf me-2 fa-lg"></i> Descargar Informe Técnico PDF
                                </a>
                                <a href="{{ route('reports.verify', ['token' => $inspection->token]) }}" class="btn btn-outline-dark btn-touch" target="_blank">
                                    <i class="fa-solid fa-qrcode me-2"></i> Ver Página de Autenticidad QR
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>

<!-- MODAL: Ítem Personalizado (RF-30) -->
<div class="modal fade" id="customItemModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <form action="{{ route('inspections.checklist.custom', $inspection) }}" method="POST">
            @csrf
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Agregar Ítem Personalizado</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Categoría del Checklist <span class="text-danger">*</span></label>
                        <select name="category_name" class="form-select" required>
                            @foreach($groupedChecklist->keys() as $cat)
                                <option value="{{ $cat }}">{{ $cat }}</option>
                            @endforeach
                            <option value="Otros Puntos Críticos">Otros Puntos Críticos</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Descripción del Punto a Verificar <span class="text-danger">*</span></label>
                        <textarea name="title" rows="2" class="form-control" placeholder="Ej: Control de barandas y rodapiés en entrepiso..." required></textarea>
                    </div>

                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Normativa Aplicable</label>
                            <input type="text" name="normative_reference" class="form-control" placeholder="Ej: Dec. 351/79 Art. 47">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Nivel de Riesgo</label>
                            <select name="risk_level" class="form-select">
                                <option value="Bajo">Bajo</option>
                                <option value="Medio" selected>Medio</option>
                                <option value="Alto">Alto</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Estado Inicial</label>
                        <select name="status" class="form-select">
                            <option value="Pendiente">Pendiente</option>
                            <option value="Cumple">Cumple</option>
                            <option value="No Cumple">No Cumple</option>
                            <option value="No Aplica">No Aplica</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Observaciones / Notas</label>
                        <textarea name="notes" rows="2" class="form-control" placeholder="Notas de campo..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light border" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Agregar al Checklist</button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- MODAL: Nueva Observación con Foto (RF-35 - RF-40) -->
<div class="modal fade" id="newObservationModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <form action="{{ route('observations.store', $inspection) }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold"><i class="fa-solid fa-camera text-primary me-2"></i> Registrar Hallazgo con Evidencia</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Tipo de Observación <span class="text-danger">*</span></label>
                            <select name="type" class="form-select" required>
                                <option value="Hallazgo">Hallazgo (Situación que requiere atención)</option>
                                <option value="Buena práctica">Buena práctica (Aspecto positivo a destacar)</option>
                                <option value="Mejora">Mejora (Oportunidad de optimización)</option>
                            </select>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Nivel de Severidad <span class="text-danger">*</span></label>
                            <select name="severity" class="form-select" required>
                                <option value="Menor">Menor</option>
                                <option value="Moderado" selected>Moderado</option>
                                <option value="Mayor">Mayor</option>
                                <option value="Crítico">Crítico</option>
                            </select>
                        </div>

                        <div class="col-md-12">
                            <label class="form-label fw-semibold">Ubicación Específica en la Empresa <span class="text-danger">*</span></label>
                            <input type="text" name="location" class="form-control" placeholder="Ej: Nave 2 - Sector Taller de Pintura" required>
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-semibold">Descripción Detallada de la Situación <span class="text-danger">*</span></label>
                            <textarea name="description" rows="3" class="form-control" placeholder="Describa la condición subestándar observada..." required></textarea>
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-semibold"><i class="fa-solid fa-camera me-1"></i> Fotografías de Evidencia (Puede seleccionar varias)</label>
                            <input type="file" name="photos[]" class="form-control" accept="image/*" capture="environment" multiple>
                        </div>

                        <!-- Opción de generar medida correctiva inmediata -->
                        <div class="col-12">
                            <hr class="my-2 text-muted">
                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" role="switch" id="create_measure" name="create_measure" value="1" onchange="document.getElementById('measureSection').classList.toggle('d-none', !this.checked)">
                                <label class="form-check-label fw-bold text-dark" for="create_measure">
                                    Generar de inmediato una Medida Correctiva asociada a este hallazgo
                                </label>
                            </div>
                        </div>

                        <div id="measureSection" class="col-12 d-none">
                            <div class="p-3 border rounded bg-light">
                                <h6 class="fw-bold text-dark mb-3"><i class="fa-solid fa-triangle-exclamation text-danger me-1"></i> Datos de la Medida Correctiva</h6>
                                <div class="row g-2">
                                    <div class="col-12 mb-2">
                                        <label class="form-label small fw-semibold">Descripción de la Medida a Implementar:</label>
                                        <textarea name="measure_description" rows="2" class="form-control form-control-sm" placeholder="Acción requerida para subsanar..."></textarea>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Prioridad:</label>
                                        <select name="measure_priority" class="form-select form-select-sm">
                                            <option value="Baja">Baja</option>
                                            <option value="Media" selected>Media</option>
                                            <option value="Alta">Alta</option>
                                            <option value="Crítica">Crítica</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Fecha Límite:</label>
                                        <input type="date" name="measure_deadline" class="form-control form-control-sm">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Responsable:</label>
                                        <input type="text" name="measure_responsible" class="form-control form-control-sm" placeholder="Ej: Jefe de Mantenimiento">
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light border" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Registrar Observación</button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- MODAL: Nueva Medida Correctiva Independiente (RF-41) -->
<div class="modal fade" id="newMeasureModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <form action="{{ route('corrective-measures.store', $inspection) }}" method="POST">
            @csrf
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Nueva Medida Correctiva</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Descripción de la Medida <span class="text-danger">*</span></label>
                        <textarea name="description" rows="2" class="form-control" placeholder="Acción requerida..." required></textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Recomendaciones de Mejora Detalladas</label>
                        <textarea name="recommendations" rows="2" class="form-control" placeholder="Especificaciones técnicas o procedimentales..."></textarea>
                    </div>

                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Nivel de Prioridad <span class="text-danger">*</span></label>
                            <select name="priority" class="form-select" required>
                                <option value="Baja">Baja</option>
                                <option value="Media" selected>Media</option>
                                <option value="Alta">Alta</option>
                                <option value="Crítica">Crítica</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Fecha Límite</label>
                            <input type="date" name="deadline" class="form-control">
                        </div>
                    </div>

                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Responsable Asignado</label>
                            <input type="text" name="responsible_person" class="form-control" placeholder="Persona o área">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Costo Estimado ($)</label>
                            <input type="number" step="0.01" name="estimated_cost" class="form-control" placeholder="0.00">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light border" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-warning text-dark fw-bold">Guardar Medida</button>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection
