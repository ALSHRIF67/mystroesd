<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->store;
        $orders = Order::where('store_id', $store->id)->latest()->paginate(20);
        return view('merchant.orders.index', compact('orders'));
    }

    public function show(Request $request, $id)
    {
        $store = $request->user()->store;
        $order = Order::where('store_id', $store->id)->where('id', $id)->firstOrFail();
        return view('merchant.orders.show', compact('order'));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        $store = $request->user()->store;
        $order = Order::where('store_id', $store->id)->where('id', $id)->firstOrFail();
        $order->status = $request->status;
        $order->save();
        return redirect()->back()->with('success','Order status updated');
    }
}
