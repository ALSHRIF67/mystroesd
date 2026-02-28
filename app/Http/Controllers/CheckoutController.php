<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Store;
use App\Models\Cart;
use App\Services\Orders\OrderService;

class CheckoutController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * عرض صفحة Checkout
     */
    public function index(Request $request)
    {
        if ($request->user()) {
            // المستخدم مسجل → جلب السلة من DB
            $items = Cart::with('product')
                        ->where('user_id', $request->user()->id)
                        ->get();
            return view('checkout', ['cart' => $items, 'guest' => false]);
        }

        // ضيف → جلب السلة من Session
        $guestCart = session()->get('guest_cart', []);
        if (empty($guestCart)) {
            return redirect()->back()->with('error', 'السلة فارغة');
        }

        return view('checkout', ['cart' => $guestCart, 'guest' => true]);
    }

    /**
     * Place an order
     */
    public function place(Request $request)
    {
        // تحديد مصدر السلة
        $cartItems = $request->user()
            ? Cart::with('product')->where('user_id', $request->user()->id)->get()->toArray()
            : session()->get('guest_cart', []);

        if (empty($cartItems)) {
            return redirect()->back()->with('error', 'السلة فارغة');
        }

        // تحديد الـ Store (نأخذ store_id من أول منتج)
        $storeId = $cartItems[0]['product']['store_id'] ?? ($cartItems[0]['store_id'] ?? null);
        $store = Store::findOrFail($storeId);

        // تجهيز بيانات الطلب
        $payload = [
            'buyer_id' => $request->user()->id ?? null,
            'items' => array_map(function($item){
                return [
                    'product_id' => $item['product_id'] ?? $item['id'] ?? null,
                    'quantity'   => $item['quantity'] ?? 1,
                    'price'      => $item['product']['price'] ?? $item['price'] ?? 0,
                ];
            }, $cartItems),
        ];

        // تنفيذ الطلب
        $order = $this->orderService->forStore($store)->place($payload);

        // مسح السلة بعد نجاح الطلب
        if ($request->user()) {
            Cart::where('user_id', $request->user()->id)->delete();
        } else {
            session()->forget('guest_cart');
        }

        return redirect()->route('orders.show', $order->id)
                         ->with('success', 'تم إنشاء الطلب بنجاح!');
    }
}