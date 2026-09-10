@extends('layouts.app')

@section('title', 'Mi Perfil')

@section('content')
<div class="container-fluid p-0" style="max-width: 900px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Mi Perfil Profesional</h3>
            <p class="text-muted small mb-0">Gestione sus datos de contacto, matrícula y credenciales de acceso</p>
        </div>
    </div>

    <div class="card card-custom">
        <div class="card-body p-4">
            <form action="{{ route('profile.update') }}" method="POST" enctype="multipart/form-data">
                @csrf
                
                <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm" style="width: 70px; height: 70px; font-size: 1.5rem;">
                        {{ strtoupper(substr($user->name, 0, 2)) }}
                    </div>
                    <div>
                        <h5 class="fw-bold mb-1">{{ $user->name }}</h5>
                        <div class="d-flex gap-2 align-items-center">
                            <span class="badge {{ $user->isAdmin() ? 'bg-danger' : 'bg-primary' }}">
                                {{ $user->isAdmin() ? 'Administrador' : 'Licenciado en Seguridad e Higiene' }}
                            </span>
                            <span class="badge bg-success">Cuenta Activa</span>
                        </div>
                    </div>
                </div>

                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="name" class="form-label fw-semibold">Nombre y Apellido</label>
                        <input type="text" name="name" id="name" class="form-control" value="{{ old('name', $user->name) }}" required>
                    </div>

                    <div class="col-md-6">
                        <label for="email" class="form-label fw-semibold">Correo Electrónico</label>
                        <input type="email" class="form-control bg-light" value="{{ $user->email }}" disabled readonly>
                        <small class="text-muted">El correo electrónico no se puede modificar.</small>
                    </div>

                    <div class="col-md-6">
                        <label for="phone" class="form-label fw-semibold">Teléfono de Contacto</label>
                        <input type="text" name="phone" id="phone" class="form-control" placeholder="+54 11 0000-0000" value="{{ old('phone', $user->phone) }}">
                    </div>

                    <div class="col-md-6">
                        <label for="license_number" class="form-label fw-semibold">Matrícula Profesional / Registro</label>
                        <input type="text" name="license_number" id="license_number" class="form-control" placeholder="Ej: MAT-HYS-12345" value="{{ old('license_number', $user->license_number) }}">
                    </div>

                    <div class="col-12"><hr class="my-3 text-muted"></div>

                    <div class="col-12">
                        <h6 class="fw-bold text-dark mb-1">Cambiar Contraseña</h6>
                        <p class="text-muted small">Deje estos campos en blanco si no desea modificar su contraseña actual.</p>
                    </div>

                    <div class="col-md-6">
                        <label for="password" class="form-label fw-semibold">Nueva Contraseña</label>
                        <input type="password" name="password" id="password" class="form-control" placeholder="Mínimo 6 caracteres">
                    </div>

                    <div class="col-md-6">
                        <label for="password_confirmation" class="form-label fw-semibold">Confirmar Nueva Contraseña</label>
                        <input type="password" name="password_confirmation" id="password_confirmation" class="form-control" placeholder="Repita la contraseña">
                    </div>

                    <div class="col-12 mt-4 text-end">
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
