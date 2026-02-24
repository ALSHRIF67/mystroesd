<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Store;
use App\Services\Orders\OrderService;
use App\Models\Cart;

class CheckoutController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index(Request $request)
    {
        // If user is authenticated, show DB-backed cart
        if ($request->user()) {
            $items = Cart::with('product')->where('user_id', $request->user()->id)->get();
            return view('checkout', ['cart' => $items, 'guest' => false]);
        }

        // Guest: check ephemeral guest_cart in session
        $guest = session()->get('guest_cart', []);
        if (empty($guest)) {
            return redirect()->back()->with('error', 'السلة فارغة');
        }

        // Clear ephemeral cart so refresh clears it
        session()->forget('guest_cart');

        return view('checkout', ['cart' => $guest, 'guest' => true]);
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
