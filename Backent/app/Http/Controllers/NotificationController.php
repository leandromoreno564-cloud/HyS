<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Auth::user()->appNotifications()->paginate(15);
        return view('notifications.index', compact('notifications'));
    }

    public function markAsRead(AppNotification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->update(['is_read' => true]);

        if ($notification->link) {
            return redirect($notification->link);
        }

        return back()->with('success', 'Notificación marcada como leída.');
    }

    public function markAllRead()
    {
        Auth::user()->appNotifications()->where('is_read', false)->update(['is_read' => true]);
        return back()->with('success', 'Todas las notificaciones se marcaron como leídas.');
    }
}
