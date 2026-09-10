<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado de Autenticidad | HyS Control</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome 6 -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f1f5f9;
            color: #1e293b;
            min-height: 100vh;
            padding: 30px 15px;
        }
        .cert-card {
            max-width: 650px;
            margin: 0 auto;
            border-radius: 16px;
            border: none;
            background: #ffffff;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .cert-header {
            background-color: #1b365d;
            color: #ffffff;
            padding: 24px;
            text-align: center;
        }
    </style>
</head>
<body>

    <div class="cert-card">
        <div class="cert-header">
            <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow" style="width: 52px; height: 52px;">
                <i class="fa-solid fa-check fa-2x"></i>
            </div>
            <h4 class="fw-bold mb-1">Certificado de Autenticidad</h4>
            <p class="small text-white-50 mb-0">Sistema de Gestión de Inspecciones de Higiene y Seguridad Laboral</p>
        </div>

        <div class="p-4">
            <div class="alert alert-success d-flex align-items-center mb-4 border-0">
                <i class="fa-solid fa-shield-check fa-2x me-3 text-success"></i>
                <div>
                    <strong class="d-block">Documento Oficial Válido y Registrado</strong>
                    <small class="text-muted">El presente informe técnico fue generado con trazabilidad criptográfica.</small>
                </div>
            </div>

            <div class="card bg-light border-0 mb-4">
                <div class="card-body p-3">
                    <div class="row g-2 small">
                        <div class="col-sm-4 text-muted">Empresa:</div>
                        <div class="col-sm-8 fw-bold text-dark">{{ $inspection->company->business_name ?? 'N/A' }}</div>

                        <div class="col-sm-4 text-muted">CUIT / RUC:</div>
                        <div class="col-sm-8 text-dark">{{ $inspection->company->tax_id ?? 'N/A' }}</div>

                        <div class="col-sm-4 text-muted">Fecha de Auditoría:</div>
                        <div class="col-sm-8 text-dark">{{ $inspection->inspection_date->format('d/m/Y') }}</div>

                        <div class="col-sm-4 text-muted">Inspector Actuante:</div>
                        <div class="col-sm-8 text-dark"><strong>{{ $inspection->user->name ?? 'N/A' }}</strong> ({{ $inspection->user->license_number ?? 'Matrícula Oficial' }})</div>

                        <div class="col-sm-4 text-muted">Tipo de Inspección:</div>
                        <div class="col-sm-8 text-dark">{{ $inspection->type }}</div>

                        <div class="col-sm-4 text-muted">Estado del Acta:</div>
                        <div class="col-sm-8">
                            <span class="badge {{ $inspection->status === 'Completada' ? 'bg-success' : 'bg-primary' }}">
                                {{ $inspection->status }}
                            </span>
                        </div>

                        <div class="col-sm-4 text-muted">Tasa de Cumplimiento:</div>
                        <div class="col-sm-8 fw-bold text-success">{{ $stats['rate'] }}% de conformidad</div>

                        <div class="col-sm-4 text-muted">Token de Seguridad:</div>
                        <div class="col-sm-8"><code class="small text-break">{{ $inspection->token }}</code></div>
                    </div>
                </div>
            </div>

            <div class="text-center">
                <a href="{{ route('reports.pdf', $inspection) }}" class="btn btn-danger btn-lg w-100 fw-bold shadow-sm">
                    <i class="fa-solid fa-file-pdf me-2"></i> Descargar Copia Oficial en PDF
                </a>
            </div>
        </div>

        <div class="text-center py-3 bg-light border-top text-muted small">
            HyS Control © 2026 - Conforme a Ley Nacional 19.587 de Higiene y Seguridad en el Trabajo.
        </div>
    </div>

</body>
</html>
