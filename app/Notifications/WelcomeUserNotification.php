<?php

namespace App\Notifications;

use App\Mail\WelcomeNotification as WelcomeMailable;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WelcomeUserNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;

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
        return (new WelcomeMailable($this->user))
            ->to($notifiable->email);
    }
}