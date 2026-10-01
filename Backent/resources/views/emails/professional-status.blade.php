<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $approved ? 'Cuenta aprobada' : 'Estado de tu registro' }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background-color:#1e293b; padding:24px 32px;">
                            <span style="color:#ffffff; font-size:18px; font-weight:bold;">HyS Control</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <p style="font-size:15px; color:#0f172a; margin:0 0 16px;">
                                Hola {{ $professional->first_name ?: $professional->name }},
                            </p>

                            @if($approved)
                                <p style="font-size:14px; color:#334155; line-height:1.6; margin:0 0 16px;">
                                    Tu cuenta como profesional en <strong>HyS Control</strong> fue
                                    <strong style="color:#059669;">aprobada</strong> por un administrador.
                                    Ya podés ingresar al sistema con tu correo y contraseña.
                                </p>
                            @else
                                <p style="font-size:14px; color:#334155; line-height:1.6; margin:0 0 16px;">
                                    Te escribimos para informarte que, por el momento, tu cuenta como
                                    profesional en <strong>HyS Control</strong> se encuentra
                                    <strong style="color:#e11d48;">deshabilitada / no fue aceptada</strong>.
                                    Si creés que se trata de un error, comunicate con un administrador
                                    del sistema.
                                </p>
                            @endif

                            <p style="font-size:12px; color:#94a3b8; margin-top:24px;">
                                Este es un mensaje automático, por favor no respondas a este correo.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
