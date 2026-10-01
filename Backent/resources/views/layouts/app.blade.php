<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Sistema de Higiene y Seguridad') | HyS Control</title>

    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome 6 -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        :root {
            --hys-primary: #1b365d;
            --hys-secondary: #007bb5;
            --hys-accent: #f39c12;
            --hys-dark: #1e293b;
            --hys-light: #f8fafc;
            --sidebar-width: 260px;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: #f1f5f9;
            color: #334155;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .navbar-top {
            background-color: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            height: 64px;
            z-index: 1030;
        }

        #wrapper {
            display: flex;
            flex: 1;
        }

        #sidebar {
            width: var(--sidebar-width);
            background-color: var(--hys-primary);
            color: #ffffff;
            min-height: calc(100vh - 64px);
            transition: all 0.3s ease;
        }

        #sidebar .nav-link {
            color: #cbd5e1;
            padding: 12px 20px;
            font-weight: 500;
            display: flex;
            align-items: center;
            border-left: 4px solid transparent;
            transition: all 0.2s;
        }

        #sidebar .nav-link i {
            width: 24px;
            font-size: 1.1rem;
            margin-right: 12px;
        }

        #sidebar .nav-link:hover,
        #sidebar .nav-link.active {
            color: #ffffff;
            background-color: rgba(255, 255, 255, 0.1);
            border-left-color: var(--hys-accent);
        }

        #sidebar .sidebar-heading {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 16px 20px 8px;
            color: #94a3b8;
            font-weight: 700;
        }

        #content-wrapper {
            flex: 1;
            padding: 24px;
            max-width: 100%;
            overflow-x: hidden;
        }

        .card-custom {
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);
            background: #ffffff;
            margin-bottom: 24px;
        }

        .btn-touch {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            border-radius: 8px;
        }

        .badge-status-cumple { background-color: #22c55e; color: #fff; }
        .badge-status-no-cumple { background-color: #ef4444; color: #fff; }
        .badge-status-no-aplica { background-color: #64748b; color: #fff; }
        .badge-status-pendiente { background-color: #f59e0b; color: #fff; }

        @media (max-width: 991.98px) {
            #sidebar {
                position: fixed;
                top: 64px;
                left: -260px;
                bottom: 0;
                z-index: 1040;
            }
            #sidebar.show {
                left: 0;
            }
            #content-wrapper {
                padding: 16px;
            }
            .sidebar-backdrop {
                position: fixed;
                top: 64px;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1035;
                display: none;
            }
            .sidebar-backdrop.show {
                display: block;
            }
        }
    </style>
    @stack('styles')
</head>
<body>

    <!-- Barra de Navegación Superior -->
    <nav class="navbar navbar-expand navbar-top sticky-top px-3">
        <div class="container-fluid p-0">
            <button class="btn btn-outline-secondary d-lg-none me-2" id="sidebarToggle" aria-label="Abrir menú">
                <i class="fa-solid fa-bars"></i>
            </button>

            <a class="navbar-brand d-flex align-items-center" href="{{ route('dashboard') }}">
                <div class="bg-primary text-white rounded p-2 me-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                    <i class="fa-solid fa-shield-halved fa-lg text-warning"></i>
                </div>
                <div class="lh-1">
                    <span class="fw-bold text-dark fs-5">HyS Control</span>
                    <small class="text-muted d-block" style="font-size: 0.72rem;">Higiene y Seguridad Laboral</small>
                </div>
            </a>

            <div class="ms-auto d-flex align-items-center">
                <!-- Notificaciones -->
                <a href="{{ route('notifications.index') }}" class="btn btn-light position-relative me-3 border rounded-circle p-2" style="width: 40px; height: 40px;" title="Notificaciones">
                    <i class="fa-regular fa-bell text-secondary"></i>
                    @if(auth()->user()->unreadNotificationsCount() > 0)
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">
                            {{ auth()->user()->unreadNotificationsCount() }}
                        </span>
                    @endif
                </a>

                <!-- Usuario Dropdown -->
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle d-flex align-items-center border py-1 px-2 rounded-pill" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <div class="rounded-circle bg-primary text-white me-2 d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 0.85rem;">
                            {{ strtoupper(substr(auth()->user()->name, 0, 2)) }}
                        </div>
                        <div class="text-start d-none d-md-block me-1">
                            <span class="fw-semibold d-block text-dark lh-sm" style="font-size: 0.85rem;">{{ auth()->user()->name }}</span>
                            <span class="badge {{ auth()->user()->isAdmin() ? 'bg-danger' : 'bg-primary' }}" style="font-size: 0.65rem;">
                                {{ auth()->user()->isAdmin() ? 'Administrador' : 'Lic. Inspector' }}
                            </span>
                        </div>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
                        <li>
                            <div class="px-3 py-2 border-bottom">
                                <p class="mb-0 fw-bold">{{ auth()->user()->name }}</p>
                                <small class="text-muted">{{ auth()->user()->email }}</small>
                                @if(auth()->user()->license_number)
                                    <div class="text-secondary small mt-1">
                                        <i class="fa-solid fa-id-card me-1"></i> {{ auth()->user()->license_number }}
                                    </div>
                                @endif
                            </div>
                        </li>
                        <li><a class="dropdown-item py-2" href="{{ route('profile') }}"><i class="fa-solid fa-user me-2 text-primary"></i> Mi Perfil</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <form action="{{ route('logout') }}" method="POST">
                                @csrf
                                <button type="submit" class="dropdown-item text-danger py-2">
                                    <i class="fa-solid fa-right-from-bracket me-2"></i> Cerrar Sesión
                                </button>
                            </form>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>

    <!-- Contenedor Principal con Sidebar -->
    <div id="wrapper">
        <!-- Sidebar -->
        <nav id="sidebar">
            <div class="py-3">
                <div class="sidebar-heading">Principal</div>
                <ul class="nav flex-column mb-2">
                    <li class="nav-item">
                        <a class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}" href="{{ route('dashboard') }}">
                            <i class="fa-solid fa-gauge-high"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request()->routeIs('companies.*') ? 'active' : '' }}" href="{{ route('companies.index') }}">
                            <i class="fa-solid fa-building"></i> Empresas
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request()->routeIs('inspections.*') ? 'active' : '' }}" href="{{ route('inspections.index') }}">
                            <i class="fa-solid fa-clipboard-check"></i> Inspecciones
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request()->routeIs('corrective-measures.*') ? 'active' : '' }}" href="{{ route('corrective-measures.index') }}">
                            <i class="fa-solid fa-list-check"></i> Medidas Correctivas
                        </a>
                    </li>
                </ul>

                @if(auth()->user()->isAdmin())
                    <div class="sidebar-heading">Administración</div>
                    <ul class="nav flex-column mb-2">
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('users.*') ? 'active' : '' }}" href="{{ route('users.index') }}">
                                <i class="fa-solid fa-users-gear"></i> Gestión de Usuarios
                            </a>
                        </li>
                    </ul>
                @endif

                <div class="sidebar-heading">Acciones Rápidas</div>
                <div class="px-3 pt-2">
                    <a href="{{ route('inspections.create') }}" class="btn btn-warning btn-touch w-100 text-dark fw-bold mb-2 shadow-sm">
                        <i class="fa-solid fa-plus-circle me-2"></i> Nueva Inspección
                    </a>
                    <a href="{{ route('companies.create') }}" class="btn btn-outline-light btn-touch w-100 mb-2">
                        <i class="fa-solid fa-building-circle-check me-2"></i> Registrar Empresa
                    </a>
                </div>
            </div>
        </nav>

        <div class="sidebar-backdrop" id="sidebarBackdrop"></div>

        <!-- Contenido Central -->
        <main id="content-wrapper">
            <!-- Mensajes Flash -->
            @if(session('success'))
                <div class="alert alert-success alert-dismissible fade show border-0 shadow-sm d-flex align-items-center mb-4" role="alert">
                    <i class="fa-solid fa-circle-check fa-lg me-2"></i>
                    <div>{{ session('success') }}</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            @if(session('error'))
                <div class="alert alert-danger alert-dismissible fade show border-0 shadow-sm d-flex align-items-center mb-4" role="alert">
                    <i class="fa-solid fa-triangle-exclamation fa-lg me-2"></i>
                    <div>{{ session('error') }}</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            @if(session('warning'))
                <div class="alert alert-warning alert-dismissible fade show border-0 shadow-sm d-flex align-items-center mb-4" role="alert">
                    <i class="fa-solid fa-circle-exclamation fa-lg me-2"></i>
                    <div>{{ session('warning') }}</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            @if($errors->any())
                <div class="alert alert-danger alert-dismissible fade show border-0 shadow-sm mb-4" role="alert">
                    <div class="fw-bold mb-1"><i class="fa-solid fa-circle-xmark me-2"></i> Por favor verifique los siguientes errores:</div>
                    <ul class="mb-0 ps-3">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            @yield('content')
        </main>
    </div>

    <!-- Scripts Base: Bootstrap 5, Chart.js, SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <script>
        // Toggle Sidebar en Móviles
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');

        if (sidebarToggle && sidebar && sidebarBackdrop) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('show');
                sidebarBackdrop.classList.toggle('show');
            });

            sidebarBackdrop.addEventListener('click', function() {
                sidebar.classList.remove('show');
                sidebarBackdrop.classList.remove('show');
            });
        }
    </script>
    @stack('scripts')
</body>
</html>
