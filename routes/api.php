<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CartController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Get cart items
    Route::get('/cart', function (Request $request) {
        $user = $request->user();
        $cartItems = $user->cartItems()->with('product')->get();
        
        $items = $cartItems->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product->name,
                'price' => (float) $item->product->price,
                'quantity' => (int) $item->quantity,
                'image_url' => $item->product->image_url ?? null,
            ];
        });
        
        return response()->json([
            'items' => $items,
            'count' => $items->sum('quantity'),
            'total' => $items->sum(function ($item) {
                return $item['price'] * $item['quantity'];
            })
        ]);
    });

    // Add to cart
    Route::post('/cart/add', function (Request $request) {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'integer|min:1'
            ]);

            $product = \App\Models\Product::findOrFail($request->product_id);
            
            $cartItem = $request->user()->cartItems()->updateOrCreate(
                ['product_id' => $product->id],
                [
                    'quantity' => \DB::raw('quantity + ' . ($request->quantity ?? 1)),
                    'price' => $product->price
                ]
            );

            return response()->json(['success' => true, 'item' => $cartItem]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    });

    // Remove from cart
    Route::delete('/cart/remove/{id}', function (Request $request, $id) {
        try {
            $cartItem = $request->user()->cartItems()->findOrFail($id);
            $cartItem->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    });

    // Update cart item quantity
    Route::put('/cart/update/{id}', function (Request $request, $id) {
        try {
            $request->validate(['quantity' => 'required|integer|min:1']);
            $cartItem = $request->user()->cartItems()->findOrFail($id);
            $cartItem->update(['quantity' => $request->quantity]);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    });

    // Clear cart
    Route::post('/cart/clear', function (Request $request) {
        try {
            $request->user()->cartItems()->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    });
});