<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    // عرض السلة
    public function show()
    {
        $cartItems = Auth::user()->cartItems()->with('product')->get();

        // إذا كانت الصفحة تستخدم Alpine.js مع fetch، أرسل JSON
        if(request()->wantsJson()){
            return response()->json(['cart'=>$cartItems]);
        }

        return view('cart.index', compact('cartItems'));
    }

    // إضافة منتج للسلة أو زيادة الكمية
    public function addToCart(Product $product)
    {
        $user = Auth::user();

        $cartItem = Cart::firstOrCreate(
            ['user_id'=>$user->id, 'product_id'=>$product->id],
            ['quantity'=>1]
        );

        if (!$cartItem->wasRecentlyCreated) {
            $cartItem->increment('quantity');
        }

        return response()->json(['success'=>true,'cart_id'=>$cartItem->id]);
    }

    // تحديث كمية منتج
    public function update(Request $request, Product $product)
    {
        $request->validate(['quantity'=>'required|integer|min:1']);

        $cartItem = Cart::where('user_id', Auth::id())
                        ->where('product_id', $product->id)
                        ->first();

        if($cartItem){
            $cartItem->quantity = $request->quantity;
            $cartItem->save();
            return response()->json(['success'=>true]);
        }

        return response()->json(['success'=>false,'message'=>'المنتج غير موجود بالسلة'],404);
    }

    // حذف منتج
    public function remove(Product $product)
    {
        $deleted = Cart::where('user_id', Auth::id())
                       ->where('product_id', $product->id)
                       ->delete();

        return response()->json(['success'=>$deleted>0]);
    }
}