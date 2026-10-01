<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProfessionalStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $professional;
    public bool $approved;

    /**
     * @param User $professional El usuario/profesional notificado
     * @param bool $approved true = cuenta habilitada/aceptada, false = cuenta rechazada/deshabilitada
     */
    public function __construct(User $professional, bool $approved)
    {
        $this->professional = $professional;
        $this->approved = $approved;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->approved
                ? 'Tu cuenta en HyS Control fue aprobada'
                : 'Novedades sobre tu registro en HyS Control',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.professional-status',
            with: [
                'professional' => $this->professional,
                'approved' => $this->approved,
            ],
        );
    }
}
