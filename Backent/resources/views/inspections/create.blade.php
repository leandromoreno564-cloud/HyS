@extends('layouts.app')

@section('title', 'Iniciar Nueva Inspección')

@section('content')
<div class="container-fluid p-0" style="max-width: 850px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Iniciar Nueva Inspección</h3>
            <p class="text-muted small mb-0">Seleccione la empresa y configure los parámetros iniciales de la auditoría</p>
        </div>
        <a href="{{ route('inspections.index') }}" class="btn btn-outline-secondary btn-touch">
            <i class="fa-solid fa-arrow-left me-2"></i> Volver
        </a>
    </div>

    <div class="card card-custom">
        <div class="card-body p-4">
            <form action="{{ route('inspections.store') }}" method="POST">
                @csrf

                <div class="row g-3">
                    <div class="col-md-12">
                        <label for="company_id" class="form-label fw-semibold">Empresa / Establecimiento <span class="text-danger">*</span></label>
                        <select name="company_id" id="company_id" class="form-select" required>
                            <option value="">Seleccione la empresa a inspeccionar...</option>
                            @foreach($companies as $comp)
                                <option value="{{ $comp->id }}" {{ (old('company_id', $selectedCompanyId) == $comp->id) ? 'selected' : '' }}>
                                    {{ $comp->business_name }} (CUIT: {{ $comp->tax_id }} - Sector: {{ $comp->industry_sector }})
                                </option>
                            @endforeach
                        </select>
                        <small class="text-muted">Los ítems de los checklists normativos se adaptarán automáticamente al sector industrial de la empresa elegida.</small>
                    </div>

                    <div class="col-md-6">
                        <label for="inspection_date" class="form-label fw-semibold">Fecha de Inspección <span class="text-danger">*</span></label>
                        <input type="date" name="inspection_date" id="inspection_date" class="form-control" value="{{ old('inspection_date', date('Y-m-d')) }}" required>
                    </div>

                    <div class="col-md-6">
                        <label for="type" class="form-label fw-semibold">Tipo de Inspección <span class="text-danger">*</span></label>
                        <select name="type" id="type" class="form-select" required>
                            <option value="General" {{ old('type') === 'General' ? 'selected' : '' }}>General (Auditoría completa de planta)</option>
                            <option value="Específica" {{ old('type') === 'Específica' ? 'selected' : '' }}>Específica (Focalizada en riesgo puntual)</option>
                            <option value="Seguimiento" {{ old('type') === 'Seguimiento' ? 'selected' : '' }}>Seguimiento (Verificación de medidas previas)</option>
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label for="start_time" class="form-label fw-semibold">Hora de Inicio</label>
                        <input type="time" name="start_time" id="start_time" class="form-control" value="{{ old('start_time', date('H:i')) }}">
                    </div>

                    <div class="col-md-6">
                        <label for="end_time" class="form-label fw-semibold">Hora Estimada de Cierre</label>
                        <input type="time" name="end_time" id="end_time" class="form-control" value="{{ old('end_time') }}">
                    </div>

                    <div class="col-12">
                        <label for="general_observations" class="form-label fw-semibold">Objetivo / Alcance Inicial del Relevamiento</label>
                        <textarea name="general_observations" id="general_observations" rows="3" class="form-control" placeholder="Ej: Relevamiento semestral de condiciones de higiene y seguridad en nave principal, depósito y sectores auxiliares...">{{ old('general_observations') }}</textarea>
                    </div>

                    <div class="col-12 mt-4 text-end">
                        <a href="{{ route('inspections.index') }}" class="btn btn-light border btn-touch px-3 me-2">Cancelar</a>
                        <button type="submit" class="btn btn-primary btn-touch px-4">
                            <i class="fa-solid fa-play me-2"></i> Iniciar Checklist y Carga
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
