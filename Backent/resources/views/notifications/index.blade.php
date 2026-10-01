@extends('layouts.app')

@section('title', 'Notificaciones del Sistema')

@section('content')
<div class="container-fluid p-0" style="max-width: 900px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Centro de Notificaciones</h3>
            <p class="text-muted small mb-0">Alertas de seguridad, vencimientos y avisos operativos</p>
        </div>
        @if(auth()->user()->unreadNotificationsCount() > 0)
            <form action="{{ route('notifications.read-all') }}" method="POST">
                @csrf
                <button type="submit" class="btn btn-outline-secondary btn-touch">
                    <i class="fa-solid fa-check-double me-1"></i> Marcar todas como leídas
                </button>
            </form>
        @endif
    </div>

    <div class="card card-custom">
        <div class="card-body p-0">
            <div class="list-group list-group-flush">
                @forelse($notifications as $notif)
                    <div class="list-group-item p-3 {{ $notif->is_read ? 'bg-white' : 'bg-light border-start border-primary border-4' }}">
                        <div class="d-flex align-items-start justify-content-between">
                            <div class="d-flex align-items-start">
                                <div class="me-3 mt-1">
                                    @if($notif->type === 'danger')
                                        <div class="bg-danger text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                                            <i class="fa-solid fa-triangle-exclamation"></i>
                                        </div>
                                    @elseif($notif->type === 'warning')
                                        <div class="bg-warning text-dark rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                                            <i class="fa-solid fa-bell"></i>
                                        </div>
                                    @else
                                        <div class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                                            <i class="fa-solid fa-circle-info"></i>
                                        </div>
                                    @endif
                                </div>
                                <div>
                                    <h6 class="fw-bold text-dark mb-1">{{ $notif->title }}</h6>
                                    <p class="text-secondary small mb-1">{{ $notif->message }}</p>
                                    <small class="text-muted"><i class="fa-regular fa-clock me-1"></i> {{ $notif->created_at->diffForHumans() }}</small>
                                </div>
                            </div>

                            <div class="ms-3 text-end">
                                @if(!$notif->is_read)
                                    <form action="{{ route('notifications.read', $notif) }}" method="POST">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-outline-primary text-nowrap">
                                            {{ $notif->link ? 'Ver y Marcar' : 'Marcar Leída' }}
                                        </button>
                                    </form>
                                @elseif($notif->link)
                                    <a href="{{ $notif->link }}" class="btn btn-sm btn-light border text-nowrap">Ver</a>
                                @endif
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="p-5 text-center text-muted">
                        <i class="fa-regular fa-bell-slash fa-3x mb-3 text-secondary"></i>
                        <h6 class="fw-bold">No tienes notificaciones pendientes</h6>
                        <p class="small mb-0">Todas las novedades operativas aparecerán aquí.</p>
                    </div>
                @endforelse
            </div>
        </div>
        @if($notifications->hasPages())
            <div class="card-footer bg-white border-0 py-3">
                {{ $notifications->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
