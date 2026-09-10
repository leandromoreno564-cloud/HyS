@extends('layouts.app')

@section('title', 'Editar Empresa')

@section('content')
<div class="container-fluid p-0" style="max-width: 900px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Editar Empresa</h3>
            <p class="text-muted small mb-0">{{ $company->business_name }} (CUIT: {{ $company->tax_id }})</p>
        </div>
        <a href="{{ route('companies.show', $company) }}" class="btn btn-outline-secondary btn-touch">
            <i class="fa-solid fa-arrow-left me-2"></i> Volver
        </a>
    </div>

    <div class="card card-custom">
        <div class="card-body p-4">
            <form action="{{ route('companies.update', $company) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="row g-3">
                    <div class="col-md-8">
                        <label for="business_name" class="form-label fw-semibold">Razón Social <span class="text-danger">*</span></label>
                        <input type="text" name="business_name" id="business_name" class="form-control" value="{{ old('business_name', $company->business_name) }}" required>
                    </div>

                    <div class="col-md-4">
                        <label for="tax_id" class="form-label fw-semibold">CUIT / RUC <span class="text-danger">*</span></label>
                        <input type="text" name="tax_id" id="tax_id" class="form-control" value="{{ old('tax_id', $company->tax_id) }}" required>
                    </div>

                    <div class="col-md-6">
                        <label for="industry_sector" class="form-label fw-semibold">Sector Industrial <span class="text-danger">*</span></label>
                        <select name="industry_sector" id="industry_sector" class="form-select" required>
                            @php
                                $sectors = ['Metalmecánica', 'Construcción', 'Química y Farmacéutica', 'Logística y Transporte', 'Alimentos y Bebidas', 'Agropecuario', 'Servicios y Comercio', 'Minería y Energía'];
                            @endphp
                            @foreach($sectors as $sec)
                                <option value="{{ $sec }}" {{ old('industry_sector', $company->industry_sector) === $sec ? 'selected' : '' }}>{{ $sec }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label for="employee_count" class="form-label fw-semibold">Cantidad de Empleados <span class="text-danger">*</span></label>
                        <input type="number" name="employee_count" id="employee_count" class="form-control" value="{{ old('employee_count', $company->employee_count) }}" min="1" required>
                    </div>

                    <div class="col-md-12">
                        <label for="address" class="form-label fw-semibold">Dirección de la Planta</label>
                        <input type="text" name="address" id="address" class="form-control" value="{{ old('address', $company->address) }}">
                    </div>

                    <div class="col-md-6">
                        <label for="phone" class="form-label fw-semibold">Teléfono de Contacto</label>
                        <input type="text" name="phone" id="phone" class="form-control" value="{{ old('phone', $company->phone) }}">
                    </div>

                    <div class="col-md-6">
                        <label for="email" class="form-label fw-semibold">Correo Electrónico Institucional</label>
                        <input type="email" name="email" id="email" class="form-control" value="{{ old('email', $company->email) }}">
                    </div>

                    <div class="col-md-6">
                        <label for="contact_person" class="form-label fw-semibold">Persona de Contacto / Cargo</label>
                        <input type="text" name="contact_person" id="contact_person" class="form-control" value="{{ old('contact_person', $company->contact_person) }}">
                    </div>

                    <div class="col-md-6">
                        <label for="website" class="form-label fw-semibold">Sitio Web</label>
                        <input type="url" name="website" id="website" class="form-control" value="{{ old('website', $company->website) }}">
                    </div>

                    @if(auth()->user()->isAdmin())
                        <div class="col-12"><hr class="my-2 text-muted"></div>
                        <div class="col-12">
                            <label class="form-label fw-semibold">Inspectores Responsables Asignados</label>
                            <div class="row g-2">
                                @foreach($inspectors as $insp)
                                    <div class="col-md-6">
                                        <div class="form-check p-2 border rounded">
                                            <input class="form-check-input ms-0 me-2" type="checkbox" name="inspector_ids[]" value="{{ $insp->id }}" id="insp_{{ $insp->id }}" {{ $company->inspectors->contains('id', $insp->id) ? 'checked' : '' }}>
                                            <label class="form-check-label fw-semibold" for="insp_{{ $insp->id }}">
                                                {{ $insp->name }}
                                                <small class="text-muted d-block">{{ $insp->license_number ?? $insp->email }}</small>
                                            </label>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endif

                    <div class="col-12 mt-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="is_active" name="is_active" value="1" {{ old('is_active', $company->is_active) ? 'checked' : '' }}>
                            <label class="form-check-label fw-semibold" for="is_active">Empresa Activa</label>
                        </div>
                    </div>

                    <div class="col-12 mt-4 text-end">
                        <a href="{{ route('companies.show', $company) }}" class="btn btn-light border btn-touch px-3 me-2">Cancelar</a>
                        <button type="submit" class="btn btn-primary btn-touch px-4">
                            <i class="fa-solid fa-floppy-disk me-2"></i> Actualizar Empresa
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
