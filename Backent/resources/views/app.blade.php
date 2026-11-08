<!DOCTYPE html>
<html lang="es" class="h-full bg-slate-50 antialiased">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <title inertia>Plataforma de Higiene y Seguridad Laboral</title>
    <link rel="icon" type="image/png" href="{{ asset('favicon.png?v=3') }}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="HyS Control">
    <meta property="og:description" content="Plataforma de Higiene y Seguridad Laboral.">
    <meta property="og:image" content="{{ url(\Illuminate\Support\Facades\Vite::asset('resources/images/hys-default-avatar.png')) }}">
    <meta property="og:image:alt" content="Gato de HyS Control">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="HyS Control">
    <meta name="twitter:description" content="Plataforma de Higiene y Seguridad Laboral.">
    <meta name="twitter:image" content="{{ url(\Illuminate\Support\Facades\Vite::asset('resources/images/hys-default-avatar.png')) }}">

    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Leaflet CSS & JS for maps -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
    </style>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="h-full text-slate-800 bg-slate-50 flex flex-col font-sans">
    @inertia
</body>
</html>
