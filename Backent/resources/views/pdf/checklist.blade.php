<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Relevamiento - {{ $company->business_name }}</title>
    <style>
        @page { margin: 30px 26px 48px 26px; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 8.5px; color: #1e293b; }
        h1 { font-size: 14px; margin: 0 0 2px 0; color: #0f172a; }
        .subtitle { font-size: 9px; color: #64748b; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }

        .company td { padding: 3px 6px; border: 1px solid #cbd5e1; vertical-align: top; }
        .company .label { background: #f1f5f9; font-weight: bold; width: 17%; }

        .summary { margin: 8px 0 12px 0; }
        .summary td { border: 1px solid #cbd5e1; text-align: center; padding: 4px 2px; }
        .summary .n { font-size: 12px; font-weight: bold; display: block; }
        .summary .l { font-size: 7.5px; color: #64748b; }

        .cat-wrap { margin-top: 10px; }
        .cat { background: #1e3a8a; color: #ffffff; font-weight: bold; font-size: 9px; padding: 5px 6px; text-transform: uppercase; }
        th { background: #e2e8f0; border: 1px solid #cbd5e1; padding: 3px 4px; font-size: 7.5px; text-align: center; }
        td { border: 1px solid #cbd5e1; padding: 3px 5px; vertical-align: top; }
        td.num { text-align: center; font-weight: bold; color: #475569; }
        td.mark { text-align: center; font-weight: bold; font-size: 10px; }
        td.on-si { background: #d1fae5; color: #047857; }
        td.on-no { background: #fecdd3; color: #be123c; }
        td.on-na { background: #e2e8f0; color: #475569; }
        td.ref { font-size: 7px; color: #64748b; }
        tbody.item { page-break-inside: avoid; }
        td.obs { background: #f8fafc; }
        .obs-label { font-weight: bold; color: #334155; }
        .photos td { border: none; padding: 4px 6px 2px 0; vertical-align: top; }
        .photos img { border: 1px solid #94a3b8; }
        .photo-cap { font-size: 7px; color: #64748b; }

        .footer { position: fixed; bottom: -32px; left: 0; right: 0; text-align: center; font-size: 7.5px; color: #64748b; }
        .pagenum:before { content: counter(page); }
    </style>
</head>
<body>
    <div class="footer">
        {{ $company->business_name }} &mdash; Relevamiento General de Riesgos Laborales &mdash; Generado el {{ $generatedAt }} &mdash; Página <span class="pagenum"></span>
    </div>

    <h1>RELEVAMIENTO GENERAL DE RIESGOS LABORALES</h1>
    <div class="subtitle">Anexo I - Resolución 463/09 - Segunda Parte</div>

    <table class="company">
        <tr>
            <td class="label">Empresa</td>
            <td>{{ $company->business_name }}</td>
            <td class="label">CUIT</td>
            <td>{{ $company->tax_id }}</td>
        </tr>
        <tr>
            <td class="label">Domicilio</td>
            <td>{{ $company->address }}</td>
            <td class="label">Fecha</td>
            <td>{{ $generatedAt }}</td>
        </tr>
    </table>

    <table class="summary">
        <tr>
            <td><span class="n">{{ $summary['total'] }}</span><span class="l">Ítems</span></td>
            <td><span class="n" style="color:#047857">{{ $summary['si'] }}</span><span class="l">SI</span></td>
            <td><span class="n" style="color:#be123c">{{ $summary['no'] }}</span><span class="l">NO</span></td>
            <td><span class="n">{{ $summary['na'] }}</span><span class="l">No aplica</span></td>
            <td><span class="n" style="color:#b45309">{{ $summary['pending'] }}</span><span class="l">Sin responder</span></td>
        </tr>
    </table>

    @foreach ($groups as $category => $rows)
        <div class="cat-wrap">
            <table>
                <thead>
                    <tr><td class="cat" colspan="6">{{ $category }}</td></tr>
                    <tr>
                        <th style="width:5%">N°</th>
                        <th style="width:47%">Condiciones a cumplir</th>
                        <th style="width:5%">SI</th>
                        <th style="width:5%">NO</th>
                        <th style="width:6%">NO APLICA</th>
                        <th style="width:32%">Normativa vigente</th>
                    </tr>
                </thead>
                @foreach ($rows as $it)
                    <tbody class="item">
                        <tr>
                            <td class="num">{{ $it['item_number'] }}</td>
                            <td>{{ $it['question'] }}</td>
                            <td class="mark {{ $it['status'] === 'SI' ? 'on-si' : '' }}">{{ $it['status'] === 'SI' ? 'X' : '' }}</td>
                            <td class="mark {{ $it['status'] === 'NO' ? 'on-no' : '' }}">{{ $it['status'] === 'NO' ? 'X' : '' }}</td>
                            <td class="mark {{ $it['status'] === 'NO_APLICA' ? 'on-na' : '' }}">{{ $it['status'] === 'NO_APLICA' ? 'X' : '' }}</td>
                            <td class="ref">{{ $it['reference'] }}</td>
                        </tr>
                        @if (!empty($it['description']) || count($it['photos']) > 0)
                            <tr>
                                <td></td>
                                <td class="obs" colspan="5">
                                    @if (!empty($it['description']))
                                        <div><span class="obs-label">Observación:</span> {!! nl2br(e($it['description'])) !!}</div>
                                    @endif
                                    @if (count($it['photos']) > 0)
                                        <table class="photos">
                                            <tr>
                                                @foreach ($it['photos'] as $i => $photo)
                                                    <td>
                                                        <img src="{{ $photo }}" style="max-width: 250px; max-height: 190px;">
                                                        <div class="photo-cap">Foto {{ $i + 1 }} - Ítem {{ $it['item_number'] }}</div>
                                                    </td>
                                                @endforeach
                                            </tr>
                                        </table>
                                    @endif
                                </td>
                            </tr>
                        @endif
                    </tbody>
                @endforeach
            </table>
        </div>
    @endforeach
</body>
</html>
