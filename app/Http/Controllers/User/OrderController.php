<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = Order::where('buyer_id', $user->id)->latest()->paginate(20);
        return view('orders.index', compact('orders'));
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::where('buyer_id', $user->id)->where('id', $id)->firstOrFail();
        return view('orders.show', compact('order'));
    }
}
