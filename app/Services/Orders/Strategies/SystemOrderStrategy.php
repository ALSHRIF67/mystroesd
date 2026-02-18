<?php

namespace App\Services\Orders\Strategies;

use App\Contracts\OrderStrategy;
use App\Models\Store;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemOrderStrategy implements OrderStrategy
{
    protected Store $store;

    public function __construct(Store $store)
    {
        $this->store = $store;
    }

    public function place(array $payload): RedirectResponse
    {
        // payload expected: buyer_id, items => [ ['product_id','quantity','price'] ], return_url
        $items = $payload['items'] ?? [];

        if (empty($items)) {
            abort(422, 'Cart is empty');
        }

        $total = 0;
        foreach ($items as $it) {
            $total += ($it['price'] ?? 0) * ($it['quantity'] ?? 1);
        }

        DB::beginTransaction();
        try {
            $order = Order::create([
                'store_id' => $this->store->id,
                'buyer_id' => $payload['buyer_id'] ?? null,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            foreach ($items as $it) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $it['product_id'],
                    'quantity' => $it['quantity'] ?? 1,
                    'price' => $it['price'] ?? 0,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed: ' . $e->getMessage());
            abort(500, 'Unable to create order');
        }

        // Redirect to payment route (mock provider)
        $return = route('payment.redirect', ['order' => $order->id]);

        return redirect($return);
    }
}
