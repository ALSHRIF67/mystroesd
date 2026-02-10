<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;
use App\Models\Product;

class ProductStatusChanged extends Notification
{
    use Queueable;

    protected $product;

    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'product_id' => $this->product->id,
            'title' => $this->product->title,
            'status' => $this->product->status,
            'message' => 'حالة المنتج قد تغيرت إلى: ' . $this->product->status,
        ];
    }
}
