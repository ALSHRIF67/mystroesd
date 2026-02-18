<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use App\Events\OrderPlaced;

class PaymentController extends Controller
{
    // Mock redirect to payment provider
    public function redirectToProvider($orderId)
    {
        $order = Order::findOrFail($orderId);

        // In production you'd sign and redirect to gateway
        // For demo redirect to simulated callback
        $callback = route('payment.callback', ['order' => $order->id, 'status' => 'success']);

        return redirect($callback);
    }

    // Simulated callback from provider
    public function callback(Request $request, $orderId)
    {
        $status = $request->get('status', 'failed');
        $order = Order::findOrFail($orderId);

        if ($status === 'success') {
            $order->payment_status = 'paid';
            $order->status = 'processing';
            $order->save();

            try {
                event(new OrderPlaced($order));
            } catch (\Exception $e) {
                Log::error('OrderPlaced event failed: ' . $e->getMessage());
            }

            return redirect()->route('orders.show', $order->id)->with('success', 'Payment successful');
        }

        $order->payment_status = 'failed';
        $order->save();

        return redirect()->route('orders.show', $order->id)->with('error', 'Payment failed');
    }
}
