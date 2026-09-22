<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Inspección #{{ $inspeccion->id }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #1e293b; margin: 25px; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 20px; text-transform: uppercase; }
        .header p { margin: 4px 0 0; color: #64748b; font-size: 11px; }
        
        .section-title { font-size: 14px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
        
        .table-info { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table-info th, .table-info td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        .table-info th { background-color: #f8fafc; font-weight: bold; color: #334155; width: 30%; }
        
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; display: inline-block; }
        .badge-success { background-color: #dcfce7; color: #166534; }
        .badge-warning { background-color: #fef9c3; color: #854d0e; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Informe Técnico de Inspección</h1>
        <p>Sistema de Gestión Integral de Higiene y Seguridad Laboral</p>
    </div>

    <div class="section-title">Detalles Generales</div>
    <table class="table-info">
        <tr>
            <th>Código / ID</th>
            <td>#{{ $inspeccion->id }}</td>
        </tr>
        <tr>
            <th>Título de la Inspección</th>
            <td>{{ $inspeccion->titulo ?? $inspeccion->codigo ?? 'Inspección General' }}</td>
        </tr>
        <tr>
            <th>Estado</th>
            <td>
                <span class="badge {{ $inspeccion->estado === 'Completada' ? 'badge-success' : 'badge-warning' }}">
                    {{ $inspeccion->estado ?? 'En Progreso' }}
                </span>
            </td>
        </tr>
        <tr>
            <th>Empresa / Sede</th>
            <td>{{ $inspeccion->empresa->nombre ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Inspector Responsable</th>
            <td>{{ $inspeccion->usuario->nombre ?? $inspeccion->usuario->name ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Fecha de Emisión</th>
            <td>{{ $inspeccion->created_at?->format('d/m/Y H:i') ?? date('d/m/Y H:i') }}</td>
        </tr>
    </table>

    <div class="footer">
        Documento generado automáticamente por HyS Control el {{ date('d/m/Y H:i') }}
    </div>
</body>
</html>