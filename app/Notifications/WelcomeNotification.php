<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Welcome to ' . config('app.name'))
            ->greeting('Hello ' . $this->user->name . '!')
            ->line('Thank you for registering with us.')
            ->line('We are excited to have you on board.')
            ->action('Visit Dashboard', url('/dashboard'))
            ->line('If you have any questions, feel free to contact us.')
            ->view('emails.welcome', ['user' => $this->user]); // Optional custom blade
    }
}