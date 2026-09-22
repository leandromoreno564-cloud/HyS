<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppNotificationController extends Controller
{
    /**
     * Muestra el listado de notificaciones del usuario autenticado.
     */
    public function index()
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $notificaciones = $usuario->notificaciones()->paginate(15);

        return Inertia::render('Notificaciones/Index', compact('notificaciones'));
    }

    /**
     * Marca una notificación específica como leída y redirige si posee enlace.
     */
    public function marcarComoLeida(AppNotification $notificacion)
    {
        if ($notificacion->user_id !== Auth::id()) {
            abort(403, 'No tiene permisos para modificar esta notificación.');
        }

        $notificacion->update(['is_read' => true]);

        if ($notificacion->link) {
            return redirect($notificacion->link);
        }

        return back()->with('success', 'Notificación marcada como leída.');
    }

    /**
     * Marca todas las notificaciones pendientes del usuario como leídas.
     */
    public function marcarTodasComoLeidas()
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        $usuario->notificaciones()->where('is_read', false)->update(['is_read' => true]);

        return back()->with('success', 'Todas las notificaciones se marcaron como leídas.');
    }
}