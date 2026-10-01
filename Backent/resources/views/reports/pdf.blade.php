<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Inspección HyS - {{ $inspection->company->business_name ?? 'Empresa' }}</title>
    <style>
        @page {
            margin: 20mm 15mm 20mm 15mm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #2c3e50;
            font-size: 11px;
            line-height: 1.4;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #1b365d;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header-logo {
            font-size: 20px;
            font-weight: bold;
            color: #1b365d;
            text-transform: uppercase;
        }
        .header-sub {
            font-size: 9px;
            color: #7f8c8d;
        }
        .report-title {
            text-align: right;
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
        }
        .meta-box {
            width: 100%;
            margin-bottom: 20px;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
        }
        .meta-box td {
            padding: 6px 10px;
            font-size: 10px;
        }
        .meta-label {
            font-weight: bold;
            color: #495057;
            width: 25%;
        }
        .meta-val {
            color: #212529;
            width: 25%;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #ffffff;
            background-color: #1b365d;
            padding: 5px 10px;
            margin-top: 15px;
            margin-bottom: 8px;
            text-transform: uppercase;
            border-radius: 2px;
        }
        .stats-table {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
        }
        .stats-table td {
            width: 25%;
            text-align: center;
            padding: 8px;
            border: 1px solid #dee2e6;
            background-color: #ffffff;
        }
        .stats-num {
            font-size: 14px;
            font-weight: bold;
            display: block;
        }
        .stats-lbl {
            font-size: 9px;
            color: #6c757d;
            text-transform: uppercase;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .data-table th {
            background-color: #e9ecef;
            color: #495057;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
            padding: 6px 8px;
            border: 1px solid #dee2e6;
            text-align: left;
        }
        .data-table td {
            padding: 5px 8px;
            border: 1px solid #dee2e6;
            font-size: 9.5px;
            vertical-align: top;
        }
        .cat-row {
            background-color: #f1f3f5;
            font-weight: bold;
            color: #1b365d;
            font-size: 10px;
        }
        .badge {
            display: inline-block;
            padding: 2px 5px;
            font-size: 8px;
            font-weight: bold;
            border-radius: 3px;
            color: #ffffff;
        }
        .badge-cumple { background-color: #28a745; }
        .badge-no-cumple { background-color: #dc3545; }
        .badge-no-aplica { background-color: #6c757d; }
        .badge-pendiente { background-color: #ffc107; color: #000; }
        .badge-critica { background-color: #dc3545; }
        .badge-alta { background-color: #fd7e14; }
        .badge-media { background-color: #ffc107; color: #000; }
        .badge-baja { background-color: #17a2b8; }

        .page-break {
            page-break-after: always;
        }

        .signatures-table {
            width: 100%;
            margin-top: 30px;
            border-collapse: collapse;
        }
        .signatures-table td {
            width: 50%;
            text-align: center;
            padding: 15px;
            vertical-align: bottom;
        }
        .signature-line {
            border-top: 1px solid #495057;
            margin-top: 40px;
            padding-top: 5px;
            font-size: 9.5px;
        }
        .qr-section {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px dashed #ced4da;
        }
        .footer {
            position: fixed;
            bottom: -10mm;
            left: 0;
            right: 0;
            font-size: 8px;
            color: #adb5bd;
            text-align: center;
            border-top: 1px solid #dee2e6;
            padding-top: 4px;
        }
    </style>
</head>
<body>

    <div class="footer">
        Informe Técnico Oficial de Higiene y Seguridad Laboral - Sistema HyS Control - Ley 19.587 / Dec. 351/79 / Dec. 911/96 - Token: {{ $inspection->token }}
    </div>

    <!-- Encabezado Institucional -->
    <table class="header-table">
        <tr>
            <td style="width: 50%;">
                <div class="header-logo">HyS CONTROL</div>
                <div class="header-sub">Servicio de Higiene, Seguridad y Medicina del Trabajo</div>
            </td>
            <td style="width: 50%;" class="report-title">
                INFORME TÉCNICO DE INSPECCIÓN<br>
                <span style="font-size: 10px; font-weight: normal; color: #6c757d;">Acta Nº HY-{{ str_pad($inspection->id, 5, '0', STR_PAD_LEFT) }} | Fecha: {{ $inspection->inspection_date->format('d/m/Y') }}</span>
            </td>
        </tr>
    </table>

    <!-- Metadatos de la Inspección y Empresa -->
    <table class="meta-box">
        <tr>
            <td class="meta-label">Razón Social:</td>
            <td class="meta-val"><strong>{{ $inspection->company->business_name ?? 'N/A' }}</strong></td>
            <td class="meta-label">Profesional Responsable:</td>
            <td class="meta-val"><strong>{{ $inspection->user->name ?? 'N/A' }}</strong></td>
        </tr>
        <tr>
            <td class="meta-label">CUIT / RUC:</td>
            <td class="meta-val">{{ $inspection->company->tax_id ?? 'N/A' }}</td>
            <td class="meta-label">Matrícula Profesional:</td>
            <td class="meta-val">{{ $inspection->user->license_number ?? 'En trámite' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Sector Industrial:</td>
            <td class="meta-val">{{ $inspection->company->industry_sector ?? 'N/A' }}</td>
            <td class="meta-label">Tipo de Inspección:</td>
            <td class="meta-val">{{ $inspection->type }}</td>
        </tr>
        <tr>
            <td class="meta-label">Dirección:</td>
            <td class="meta-val">{{ $inspection->company->address ?? 'No especificada' }}</td>
            <td class="meta-label">Horario Relevamiento:</td>
            <td class="meta-val">{{ $inspection->start_time ?? '09:00' }} a {{ $inspection->end_time ?? '13:00' }}</td>
        </tr>
    </table>

    <!-- Resumen Ejecutivo y Estadísticas -->
    <div class="section-title">1. Resumen Ejecutivo y Evaluación de Conformidad</div>
    <table class="stats-table">
        <tr>
            <td>
                <span class="stats-num" style="color: #28a745;">{{ $stats['rate'] }}%</span>
                <span class="stats-lbl">Índice Cumplimiento</span>
            </td>
            <td>
                <span class="stats-num" style="color: #28a745;">{{ $stats['cumple'] }}</span>
                <span class="stats-lbl">Conformes</span>
            </td>
            <td>
                <span class="stats-num" style="color: #dc3545;">{{ $stats['no_cumple'] }}</span>
                <span class="stats-lbl">No Conformes</span>
            </td>
            <td>
                <span class="stats-num" style="color: #6c757d;">{{ $stats['no_aplica'] }}</span>
                <span class="stats-lbl">No Aplica</span>
            </td>
        </tr>
    </table>

    @if($inspection->general_observations)
        <div style="background-color: #f8f9fa; border-left: 3px solid #1b365d; padding: 8px 12px; margin-bottom: 15px; font-size: 10px;">
            <strong>Alcance y Dictamen General:</strong> {{ $inspection->general_observations }}
        </div>
    @endif

    <!-- Detalle Completo del Checklist -->
    <div class="section-title">2. Detalle de Relevamiento de Checklists Técnicos</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 50%;">Ítem / Condición Relevada</th>
                <th style="width: 25%;">Referencia Normativa</th>
                <th style="width: 12%; text-align: center;">Resultado</th>
                <th style="width: 13%;">Riesgo</th>
            </tr>
        </thead>
        <tbody>
            @foreach($groupedChecklist as $categoryName => $items)
                <tr class="cat-row">
                    <td colspan="4">{{ $categoryName }} ({{ $items->count() }} puntos)</td>
                </tr>
                @foreach($items as $it)
                    <tr>
                        <td>
                            <strong>{{ $it->title }}</strong>
                            @if($it->notes)
                                <div style="color: #6c757d; font-size: 8.5px; margin-top: 2px;">
                                    <em>Nota: {{ $it->notes }}</em>
                                </div>
                            @endif
                        </td>
                        <td style="font-size: 8.5px; color: #495057;">{{ $it->normative_reference ?? '-' }}</td>
                        <td style="text-align: center;">
                            @if($it->status === 'Cumple')
                                <span class="badge badge-cumple">CUMPLE</span>
                            @elseif($it->status === 'No Cumple')
                                <span class="badge badge-no-cumple">NO CUMPLE</span>
                            @elseif($it->status === 'No Aplica')
                                <span class="badge badge-no-aplica">N/A</span>
                            @else
                                <span class="badge badge-pendiente">PENDIENTE</span>
                            @endif
                        </td>
                        <td>{{ $it->risk_level }}</td>
                    </tr>
                @endforeach
            @endforeach
        </tbody>
    </table>

    <div class="page-break"></div>

    <!-- Observaciones Detalladas y Hallazgos -->
    <div class="section-title">3. Hallazgos y Observaciones de Campo</div>
    @if($inspection->observations->count() > 0)
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Tipo / Severidad</th>
                    <th style="width: 25%;">Ubicación en Planta</th>
                    <th style="width: 60%;">Descripción de la Condición Detectada</th>
                </tr>
            </thead>
            <tbody>
                @foreach($inspection->observations as $obs)
                    <tr>
                        <td>
                            <strong>{{ $obs->type }}</strong><br>
                            <span class="badge {{ $obs->severity === 'Crítico' ? 'badge-critica' : ($obs->severity === 'Mayor' ? 'badge-alta' : 'badge-media') }}">
                                {{ $obs->severity }}
                            </span>
                        </td>
                        <td><strong>{{ $obs->location ?? 'General' }}</strong></td>
                        <td>{{ $obs->description }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p style="font-size: 10px; color: #6c757d; margin-bottom: 15px;">No se registraron observaciones adicionales durante el recorrido.</p>
    @endif

    <!-- Plan de Medidas Correctivas -->
    <div class="section-title">4. Plan de Medidas Correctivas y Recomendaciones</div>
    @if($inspection->correctiveMeasures->count() > 0)
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 12%;">Prioridad</th>
                    <th style="width: 45%;">Acción Requerida y Recomendación</th>
                    <th style="width: 23%;">Responsable Asignado</th>
                    <th style="width: 10%;">Plazo</th>
                    <th style="width: 10%;">Estado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($inspection->correctiveMeasures as $cm)
                    <tr>
                        <td>
                            <span class="badge {{ $cm->priority === 'Crítica' ? 'badge-critica' : ($cm->priority === 'Alta' ? 'badge-alta' : 'badge-media') }}">
                                {{ $cm->priority }}
                            </span>
                        </td>
                        <td>
                            <strong>{{ $cm->description }}</strong>
                            @if($cm->recommendations)
                                <div style="font-size: 8.5px; color: #6c757d; margin-top: 2px;">
                                    <em>Sugerencia: {{ $cm->recommendations }}</em>
                                </div>
                            @endif
                        </td>
                        <td>{{ $cm->responsible_person ?? 'Sin asignar' }}</td>
                        <td>{{ $cm->deadline ? $cm->deadline->format('d/m/Y') : 'Inmediato' }}</td>
                        <td><strong>{{ $cm->status }}</strong></td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p style="font-size: 10px; color: #6c757d; margin-bottom: 15px;">No se requirieron medidas correctivas de urgencia.</p>
    @endif

    <!-- Código QR de Autenticidad y Firmas -->
    <table class="signatures-table">
        <tr>
            <td>
                <div class="signature-line">
                    <strong>{{ $inspection->signature_inspector ?? $inspection->user->name }}</strong><br>
                    <span style="font-size: 8.5px; color: #6c757d;">Inspector en Higiene y Seguridad Laboral<br>Mat. {{ $inspection->user->license_number ?? 'Reg. Oficial' }}</span>
                </div>
            </td>
            <td>
                <div class="signature-line">
                    <strong>{{ $inspection->signature_company_name ?? ($inspection->company->contact_person ?? 'Representante Empresa') }}</strong><br>
                    <span style="font-size: 8.5px; color: #6c757d;">Conformidad Recepción Establecimiento<br>{{ $inspection->signature_company ?? 'Dirección / Responsable' }}</span>
                </div>
            </td>
        </tr>
    </table>

    <div class="qr-section">
        <table style="width: 100%; border: none;">
            <tr>
                <td style="width: 25%; text-align: center; border: none;">
                    <img src="{{ $qrImage }}" style="width: 90px; height: 90px;" alt="Código QR de Verificación">
                </td>
                <td style="width: 75%; text-align: left; vertical-align: middle; border: none; padding-left: 15px;">
                    <strong style="color: #1b365d; font-size: 11px;">VERIFICACIÓN DE AUTENTICIDAD DIGITAL (CÓDIGO QR)</strong><br>
                    <span style="font-size: 8.5px; color: #495057;">
                        Este documento técnico ha sido generado y firmado electrónicamente a través de la plataforma <strong>HyS Control</strong>.<br>
                        Para comprobar su autenticidad y estado de seguimiento, escanee el código QR o visite:<br>
                        <a href="{{ $qrUrl }}" style="color: #007bb5; text-decoration: none;">{{ $qrUrl }}</a>
                    </span>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
