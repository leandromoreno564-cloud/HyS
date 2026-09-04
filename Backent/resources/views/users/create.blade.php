@extends('layouts.app')

@section('title', 'Nuevo Usuario')

@section('content')
<div class="container-fluid p-0" style="max-width: 800px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Registrar Nuevo Usuario</h3>
            <p class="text-muted small mb-0">Alta de inspectores matriculados y administradores del sistema</p>
        </div>
        <a href="{{ route('users.index') }}" class="btn btn-outline-secondary btn-touch">
            <i class="fa-solid fa-arrow-left me-2"></i> Volver
        </a>
    </div>

    <div class="card card-custom">
        <div class="card-body p-4">
            <form action="{{ route('users.store') }}" method="POST">
                @csrf
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="name" class="form-label fw-semibold">Nombre y Apellido <span class="text-danger">*</span></label>
                        <input type="text" name="name" id="name" class="form-control" value="{{ old('name') }}" placeholder="Ej: Lic. Martín Rossi" required>
                    </div>

                    <div class="col-md-6">
                        <label for="email" class="form-label fw-semibold">Correo Electrónico <span class="text-danger">*</span></label>
                        <input type="email" name="email" id="email" class="form-control" value="{{ old('email') }}" placeholder="usuario@seguridad.local" required>
                    </div>

                    <div class="col-md-6">
                        <label for="role" class="form-label fw-semibold">Rol en el Sistema <span class="text-danger">*</span></label>
                        <select name="role" id="role" class="form-select" required>
                            <option value="inspector" {{ old('role') === 'inspector' ? 'selected' : '' }}>Licenciado en Higiene y Seguridad (Inspector)</option>
                            <option value="admin" {{ old('role') === 'admin' ? 'selected' : '' }}>Administrador del Sistema (Root)</option>
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label for="license_number" class="form-label fw-semibold">Matrícula Profesional / Registro</label>
                        <input type="text" name="license_number" id="license_number" class="form-control" value="{{ old('license_number') }}" placeholder="Ej: MAT-NAC-8492">
                    </div>

                    <div class="col-md-6">
                        <label for="phone" class="form-label fw-semibold">Teléfono de Contacto</label>
                        <input type="text" name="phone" id="phone" class="form-control" value="{{ old('phone') }}" placeholder="+54 11 1234-5678">
                    </div>

                    <div class="col-md-6">
                        <label for="password" class="form-label fw-semibold">Contraseña Inicial <span class="text-danger">*</span></label>
                        <input type="password" name="password" id="password" class="form-control" placeholder="Mínimo 6 caracteres" required>
                    </div>

                    <div class="col-12 mt-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="is_active" name="is_active" value="1" checked>
                            <label class="form-check-label fw-semibold" for="is_active">Cuenta Habilitada / Activa</label>
                        </div>
                    </div>

                    <div class="col-12 mt-4 text-end">
                        <a href="{{ route('users.index') }}" class="btn btn-light border btn-touch px-3 me-2">Cancelar</a>
                        <button type="submit" class="btn btn-primary btn-touch px-4">
                            <i class="fa-solid fa-check me-2"></i> Guardar Usuario
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
