<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso al Sistema | HyS Control</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome 6 -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-card {
            max-width: 460px;
            width: 100%;
            border: none;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            background: #ffffff;
            overflow: hidden;
        }
        .login-header {
            background-color: #1b365d;
            padding: 30px 24px;
            text-align: center;
            color: #ffffff;
        }
        .login-body {
            padding: 32px 28px;
        }
        .btn-touch {
            min-height: 48px;
            font-weight: 600;
            border-radius: 8px;
        }
    </style>
</head>
<body>

    <div class="login-card">
        <div class="login-header">
            <div class="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" style="width: 58px; height: 58px;">
                <i class="fa-solid fa-shield-halved fa-2x"></i>
            </div>
            <h4 class="fw-bold mb-1">HyS Control</h4>
            <p class="mb-0 text-white-50 small">Gestión de Inspecciones de Higiene y Seguridad Laboral</p>
        </div>

        <div class="login-body">
            @if(session('info'))
                <div class="alert alert-info py-2 small mb-3 border-0">
                    <i class="fa-solid fa-circle-info me-1"></i> {{ session('info') }}
                </div>
            @endif

            @if($errors->any())
                <div class="alert alert-danger py-2 small mb-3 border-0">
                    <i class="fa-solid fa-triangle-exclamation me-1"></i> {{ $errors->first() }}
                </div>
            @endif

            <form action="{{ route('login.post') }}" method="POST">
                @csrf
                <div class="mb-3">
                    <label for="email" class="form-label fw-semibold text-secondary small">Correo Electrónico</label>
                    <div class="input-group">
                        <span class="input-group-text bg-light text-muted border-end-0"><i class="fa-regular fa-envelope"></i></span>
                        <input type="email" name="email" id="email" class="form-control border-start-0 ps-0" placeholder="usuario@empresa.com" value="{{ old('email') }}" required autofocus>
                    </div>
                </div>

                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <label for="password" class="form-label fw-semibold text-secondary small mb-0">Contraseña</label>
                    </div>
                    <div class="input-group">
                        <span class="input-group-text bg-light text-muted border-end-0"><i class="fa-solid fa-lock"></i></span>
                        <input type="password" name="password" id="password" class="form-control border-start-0 ps-0" placeholder="••••••••" required>
                    </div>
                </div>

                <div class="mb-4 form-check">
                    <input type="checkbox" name="remember" class="form-check-input" id="remember">
                    <label class="form-check-label text-muted small" for="remember">Recordar mi sesión en este equipo</label>
                </div>

                <button type="submit" class="btn btn-primary btn-touch w-100 mb-3 shadow-sm" style="background-color: #1b365d; border-color: #1b365d;">
                    <i class="fa-solid fa-right-to-bracket me-2"></i> Iniciar Sesión
                </button>
            </form>

            <div class="border-top pt-3 mt-3">
                <div class="text-center text-muted small mb-2 fw-semibold">Accesos Rápidos de Prueba (1 Clic)</div>
                <div class="d-grid gap-2">
                    <button type="button" class="btn btn-outline-danger btn-sm text-start py-2" onclick="autofill('admin@seguridad.local', 'password')">
                        <i class="fa-solid fa-user-shield me-2"></i> <strong>Admin:</strong> admin@seguridad.local
                    </button>
                    <button type="button" class="btn btn-outline-primary btn-sm text-start py-2" onclick="autofill('inspector@seguridad.local', 'password')">
                        <i class="fa-solid fa-user-check me-2"></i> <strong>Inspector:</strong> inspector@seguridad.local
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        function autofill(email, password) {
            document.getElementById('email').value = email;
            document.getElementById('password').value = password;
        }
    </script>
</body>
</html>
