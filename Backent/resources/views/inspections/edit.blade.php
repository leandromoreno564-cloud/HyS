@extends('layouts.app')

@section('title', 'Modificar Parámetros de Inspección')

@section('content')
<div class="container-fluid p-0" style="max-width: 850px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Modificar Datos de la Inspección</h3>
            <p class="text-muted small mb-0">{{ $inspection->company->business_name }} - {{ $inspection->inspection_date->format('d/m/Y') }}</p>
        </div>
        <a href="{{ route('inspections.show', $inspection) }}" class="btn btn-outline-secondary btn-touch">
            <i class="fa-solid fa-arrow-left me-2"></i> Volver a la Inspección
        </a>
    </div>

    <div class="card card-custom">
        <div class="card-body p-4">
            <form action="{{ route('inspections.update', $inspection) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="inspection_date" class="form-label fw-semibold">Fecha de Realización <span class="text-danger">*</span></label>
                        <input type="date" name="inspection_date" id="inspection_date" class="form-control" value="{{ old('inspection_date', $inspection->inspection_date->format('Y-m-d')) }}" required>
                    </div>

                    <div class="col-md-6">
                        <label for="type" class="form-label fw-semibold">Tipo de Inspección <span class="text-danger">*</span></label>
                        <select name="type" id="type" class="form-select" required>
                            <option value="General" {{ old('type', $inspection->type) === 'General' ? 'selected' : '' }}>General</option>
                            <option value="Específica" {{ old('type', $inspection->type) === 'Específica' ? 'selected' : '' }}>Específica</option>
                            <option value="Seguimiento" {{ old('type', $inspection->type) === 'Seguimiento' ? 'selected' : '' }}>Seguimiento</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label for="status" class="form-label fw-semibold">Estado de la Auditoría <span class="text-danger">*</span></label>
                        <select name="status" id="status" class="form-select" required>
                            <option value="Borrador" {{ old('status', $inspection->status) === 'Borrador' ? 'selected' : '' }}>Borrador</option>
                            <option value="En Progreso" {{ old('status', $inspection->status) === 'En Progreso' ? 'selected' : '' }}>En Progreso</option>
                            <option value="Completada" {{ old('status', $inspection->status) === 'Completada' ? 'selected' : '' }}>Completada</option>
                            <option value="Cancelada" {{ old('status', $inspection->status) === 'Cancelada' ? 'selected' : '' }}>Cancelada</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label for="start_time" class="form-label fw-semibold">Hora de Inicio</label>
                        <input type="time" name="start_time" id="start_time" class="form-control" value="{{ old('start_time', $inspection->start_time) }}">
                    </div>

                    <div class="col-md-4">
                        <label for="end_time" class="form-label fw-semibold">Hora de Finalización</label>
                        <input type="time" name="end_time" id="end_time" class="form-control" value="{{ old('end_time', $inspection->end_time) }}">
                    </div>

                    <div class="col-12">
                        <label for="general_observations" class="form-label fw-semibold">Observaciones Generales</label>
                        <textarea name="general_observations" id="general_observations" rows="4" class="form-control">{{ old('general_observations', $inspection->general_observations) }}</textarea>
                    </div>

                    <div class="col-12 mt-4 text-end">
                        <a href="{{ route('inspections.show', $inspection) }}" class="btn btn-light border btn-touch px-3 me-2">Cancelar</a>
                        <button type="submit" class="btn btn-primary btn-touch px-4">
                            <i class="fa-solid fa-floppy-disk me-2"></i> Guardar Cambios
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
