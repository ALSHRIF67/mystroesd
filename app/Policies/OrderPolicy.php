<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user)
    {
        return true; // أو أي شرط
    }

    public function view(User $user, Order $order)
    {
        // المستخدم يمكنه رؤية الطلب إذا كان مالكه (حتى لو ضيف سابقاً لا نملك User)
        return $user->id === $order->user_id;
    }
}