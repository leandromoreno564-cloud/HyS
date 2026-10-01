@extends('layouts.app')

@section('title', 'Registrar Empresa')

@section('content')
<div class="container-fluid p-0" style="max-width: 900px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Registrar Nueva Empresa</h3>
            <p class="text-muted small mb-0">Alta de razón social, sector industrial y parámetros de establecimiento</p>
        </div>
        <a href="{{ route('companies.index') }}" class="btn btn-outline-secondary btn-touch">
            <i class="fa-solid fa-arrow-left me-2"></i> Volver
        </a>
    </div>

    <div class="card card-custom">
        <div class="card-body p-4">
            <form action="{{ route('companies.store') }}" method="POST">
                @csrf

                <div class="row g-3">
                    <div class="col-md-8">
                        <label for="business_name" class="form-label fw-semibold">Razón Social / Nombre Comercial <span class="text-danger">*</span></label>
                        <input type="text" name="business_name" id="business_name" class="form-control" value="{{ old('business_name') }}" placeholder="Ej: Aceros Industriales S.A." required>
                    </div>

                    <div class="col-md-4">
                        <label for="tax_id" class="form-label fw-semibold">CUIT / RUC <span class="text-danger">*</span></label>
                        <input type="text" name="tax_id" id="tax_id" class="form-control" value="{{ old('tax_id') }}" placeholder="Ej: 30-12345678-9" required>
                    </div>

                    <div class="col-md-6">
                        <label for="industry_sector" class="form-label fw-semibold">Sector Industrial <span class="text-danger">*</span></label>
                        <select name="industry_sector" id="industry_sector" class="form-select" required>
                            <option value="">Seleccione sector...</option>
                            <option value="Metalmecánica" {{ old('industry_sector') === 'Metalmecánica' ? 'selected' : '' }}>Metalmecánica</option>
                            <option value="Construcción" {{ old('industry_sector') === 'Construcción' ? 'selected' : '' }}>Construcción</option>
                            <option value="Química y Farmacéutica" {{ old('industry_sector') === 'Química y Farmacéutica' ? 'selected' : '' }}>Química y Farmacéutica</option>
                            <option value="Logística y Transporte" {{ old('industry_sector') === 'Logística y Transporte' ? 'selected' : '' }}>Logística y Transporte</option>
                            <option value="Alimentos y Bebidas" {{ old('industry_sector') === 'Alimentos y Bebidas' ? 'selected' : '' }}>Alimentos y Bebidas</option>
                            <option value="Agropecuario" {{ old('industry_sector') === 'Agropecuario' ? 'selected' : '' }}>Agropecuario</option>
                            <option value="Servicios y Comercio" {{ old('industry_sector') === 'Servicios y Comercio' ? 'selected' : '' }}>Servicios y Comercio</option>
                            <option value="Minería y Energía" {{ old('industry_sector') === 'Minería y Energía' ? 'selected' : '' }}>Minería y Energía</option>
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label for="employee_count" class="form-label fw-semibold">Cantidad de Empleados <span class="text-danger">*</span></label>
                        <input type="number" name="employee_count" id="employee_count" class="form-control" value="{{ old('employee_count', 10) }}" min="1" required>
                    </div>

                    <div class="col-md-12">
                        <label for="address" class="form-label fw-semibold">Dirección de la Planta / Establecimiento</label>
                        <input type="text" name="address" id="address" class="form-control" value="{{ old('address') }}" placeholder="Calle, Número, Parque Industrial o Localidad">
                    </div>

                    <div class="col-md-6">
                        <label for="phone" class="form-label fw-semibold">Teléfono de Contacto</label>
                        <input type="text" name="phone" id="phone" class="form-control" value="{{ old('phone') }}" placeholder="+54 11 0000-0000">
                    </div>

                    <div class="col-md-6">
                        <label for="email" class="form-label fw-semibold">Correo Electrónico Institucional</label>
                        <input type="email" name="email" id="email" class="form-control" value="{{ old('email') }}" placeholder="contacto@empresa.com">
                    </div>

                    <div class="col-md-6">
                        <label for="contact_person" class="form-label fw-semibold">Persona de Contacto / Cargo</label>
                        <input type="text" name="contact_person" id="contact_person" class="form-control" value="{{ old('contact_person') }}" placeholder="Ej: Ing. Jorge Pérez (Jefe de Seguridad)">
                    </div>

                    <div class="col-md-6">
                        <label for="website" class="form-label fw-semibold">Sitio Web</label>
                        <input type="url" name="website" id="website" class="form-control" value="{{ old('website') }}" placeholder="https://www.empresa.com">
                    </div>

                    @if(auth()->user()->isAdmin())
                        <div class="col-12"><hr class="my-2 text-muted"></div>
                        <div class="col-12">
                            <label class="form-label fw-semibold">Asignar Inspectores Responsables</label>
                            <div class="row g-2">
                                @foreach($inspectors as $insp)
                                    <div class="col-md-6">
                                        <div class="form-check p-2 border rounded">
                                            <input class="form-check-input ms-0 me-2" type="checkbox" name="inspector_ids[]" value="{{ $insp->id }}" id="insp_{{ $insp->id }}">
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
                            <input class="form-check-input" type="checkbox" role="switch" id="is_active" name="is_active" value="1" checked>
                            <label class="form-check-label fw-semibold" for="is_active">Empresa Activa</label>
                        </div>
                    </div>

                    <div class="col-12 mt-4 text-end">
                        <a href="{{ route('companies.index') }}" class="btn btn-light border btn-touch px-3 me-2">Cancelar</a>
                        <button type="submit" class="btn btn-primary btn-touch px-4">
                            <i class="fa-solid fa-check me-2"></i> Registrar Empresa
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
