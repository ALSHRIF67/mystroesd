<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class CartController extends Controller
{
    public function add(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'nullable|integer|min:1'
        ]);

        $product = Product::with('store')->findOrFail($data['product_id']);
        $qty = $data['quantity'] ?? 1;

        $cart = session()->get('cart', []);

        // If cart has items from different store, prevent mixing
        if (!empty($cart) && isset($cart['store_id']) && $cart['store_id'] !== $product->store->id) {
            return redirect()->back()->with('error', 'سلة المشتريات تحتوي على عناصر من متجر آخر. أكمِل عملية الشراء أو إفرغ السلة أولاً.');
        }

        // initialize
        if (empty($cart)) {
            $cart = [
                'store_id' => $product->store->id ?? null,
                'items' => [],
            ];
        }

        // add or increment
        $found = false;
        foreach ($cart['items'] as &$it) {
            if ($it['product_id'] == $product->id) {
                $it['quantity'] += $qty;
                $found = true;
                break;
            }
        }

        if (!$found) {
            $cart['items'][] = [
                'product_id' => $product->id,
                'quantity' => $qty,
                'price' => $product->price,
            ];
        }

        session()->put('cart', $cart);

        return redirect()->back()->with('success', 'تم إضافة المنتج إلى السلة');
    }
}
