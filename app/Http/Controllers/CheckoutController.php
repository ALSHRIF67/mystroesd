<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Store;
use App\Services\Orders\OrderService;

class CheckoutController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index(Request $request)
    {
        $cart = session()->get('cart', []);
        if (empty($cart) || empty($cart['items'])) {
            return redirect()->back()->with('error', 'السلة فارغة');
        }

        $items = $cart['items'];
        $store = \App\Models\Store::find($cart['store_id']);

        return view('checkout.index', compact('cart', 'items', 'store'));
    }

    public function place(Request $request)
    {
        $cart = session()->get('cart', []);
        if (empty($cart) || empty($cart['items'])) {
            return redirect()->back()->with('error', 'السلة فارغة');
        }

        $storeId = $cart['store_id'] ?? null;
        $store = Store::findOrFail($storeId);

        $payload = [
            'buyer_id' => auth()->id(),
            'items' => array_map(function ($it) {
                return [
                    'product_id' => $it['product_id'],
                    'quantity' => $it['quantity'],
                    'price' => $it['price'],
                ];
            }, $cart['items']),
        ];

        $response = $this->orderService->forStore($store)->place($payload);

        // Clear cart on success (we assume strategy handles exceptions)
        session()->forget('cart');

        return $response;
    }
}
