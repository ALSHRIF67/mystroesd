<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    protected $service;

    public function __construct(\App\Services\Orders\OrderService $service)
    {
        $this->service = $service;
    }

   public function myOrders()
{
    $orders = Order::with('items.product')
        ->where('user_id', Auth::id())
        ->paginate(10);

    return view('orders.index', compact('orders'));
}

    // إنشاء الطلب
    public function place(Request $request, \App\Models\Store $store)
    {
        $payload = $request->validate([
            'buyer_id' => 'nullable|integer',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $order = $this->service->forStore($store)->place($payload);

        return response()->json([
            'success' => true,
            'order_id' => $order->id,
            'message' => 'تم إنشاء الطلب بنجاح',
        ]);
    }
}