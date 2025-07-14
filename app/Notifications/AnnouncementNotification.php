<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AnnouncementNotification extends Notification
{
    use Queueable;

    public $announcement;
    public $action;

    /**
     * Create a new notification instance.
     */
    public function __construct($announcement, $action = 'created')
    {
        $this->announcement = $announcement;
        $this->action = $action;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $messages = [
            'created' => 'Nouvelle annonce publiée : ' . $this->announcement->titre,
            'updated' => 'Annonce mise à jour : ' . $this->announcement->titre,
            'sold' => 'Annonce vendue : ' . $this->announcement->titre,
            'interest' => 'Quelqu\'un s\'intéresse à votre annonce : ' . $this->announcement->titre
        ];

        $icons = [
            'created' => 'fas fa-plus-circle',
            'updated' => 'fas fa-edit',
            'sold' => 'fas fa-check-circle',
            'interest' => 'fas fa-heart'
        ];

        $colors = [
            'created' => 'primary',
            'updated' => 'info',
            'sold' => 'success',
            'interest' => 'danger'
        ];

        return [
            'title' => 'Annonce',
            'message' => $messages[$this->action] ?? 'Mise à jour d\'annonce',
            'type' => 'announcement',
            'priority' => $this->announcement->est_premium ? 'high' : 'medium',
            'icon' => $icons[$this->action] ?? 'fas fa-bullhorn',
            'color' => $colors[$this->action] ?? 'primary',
            'url' => '/announcements/' . $this->announcement->id,
            'announcement_id' => $this->announcement->id,
            'action' => $this->action
        ];
    }
}
