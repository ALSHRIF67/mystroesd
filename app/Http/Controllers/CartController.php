<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;


class CartController extends Controller
{
    public function __construct()
    {
        // Require auth for most endpoints but allow guest-access to addOrUpdate and checkout
        $this->middleware('auth')->except(['addOrUpdate', 'checkout']);
    }

    /**
     * Return the authenticated user's cart items
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = Cart::with('product')
            ->where('user_id', $user->id)
            ->get();

        return response()->json(['success' => true, 'cart' => $items]);
    }

    /**
     * Add product to cart or increment if exists.
     */
    public function addToCart(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $quantity = $validated['quantity'] ?? 1;
        $productId = $validated['product_id'];
        $userId = $request->user()->id;

        $product = Product::findOrFail($productId);

        try {
            DB::transaction(function () use ($userId, $productId, $quantity) {
                // If products table tracks `stock`, lock product row for accurate checks
                $productRow = null;
                if (Schema::hasColumn('products', 'stock')) {
                    $productRow = Product::where('id', $productId)->lockForUpdate()->first();
                }

                $existing = Cart::where('user_id', $userId)
                    ->where('product_id', $productId)
                    ->lockForUpdate()
                    ->first();

                // Enforce stock limits when available
                if ($productRow && isset($productRow->stock)) {
                    $currentInCart = $existing ? (int)$existing->quantity : 0;
                    $final = $currentInCart + $quantity;
                    if ($final > (int)$productRow->stock) {
                        throw new \RuntimeException('Insufficient stock for product');
                    }
                }

                if ($existing) {
                    $existing->increment('quantity', $quantity);
                    return;
                }

                try {
                    Cart::create([
                        'user_id' => $userId,
                        'product_id' => $productId,
                        'quantity' => $quantity,
                    ]);
                } catch (QueryException $e) {
                    $row = Cart::where('user_id', $userId)
                        ->where('product_id', $productId)
                        ->lockForUpdate()
                        ->first();
                    if ($row) {
                        $row->increment('quantity', $quantity);
                    } else {
                        throw $e;
                    }
                }
            }, 5);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Could not add to cart', 'error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true, 'message' => 'Product added to cart']);
    }

    /**
     * Update quantity for a cart item
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $quantity = (int)$validated['quantity'];
        $userId = $request->user()->id;

        try {
            DB::transaction(function () use ($userId, $product, $quantity) {
                // If products table tracks `stock`, lock product row for accurate checks
                $productRow = null;
                if (Schema::hasColumn('products', 'stock')) {
                    $productRow = Product::where('id', $product->id)->lockForUpdate()->first();
                }

                $item = Cart::where('user_id', $userId)
                    ->where('product_id', $product->id)
                    ->lockForUpdate()
                    ->first();

                if (! $item) {
                    abort(404, 'Cart item not found');
                }

                if ($productRow && isset($productRow->stock)) {
                    if ($quantity > (int)$productRow->stock) {
                        throw new \RuntimeException('Insufficient stock for product');
                    }
                }

                $item->quantity = $quantity;
                $item->save();
            }, 5);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Could not update cart', 'error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true, 'message' => 'Cart updated']);
    }

    /**
     * Remove product from cart
     */
    public function remove(Request $request, Product $product): JsonResponse
    {
        // If authenticated, remove from DB; if guest, remove from session
        if ($request->user()) {
            $userId = $request->user()->id;

            try {
                DB::transaction(function () use ($userId, $product) {
                    $item = Cart::where('user_id', $userId)
                        ->where('product_id', $product->id)
                        ->lockForUpdate()
                        ->first();

                    if ($item) {
                        $item->delete();
                    }
                }, 5);
            } catch (\Throwable $e) {
                return response()->json(['success' => false, 'message' => 'Could not remove from cart', 'error' => $e->getMessage()], 500);
            }

            return response()->json(['success' => true, 'message' => 'Removed from cart']);
        }

        // Guest: remove from session
        $guest = session()->get('guest_cart', []);
        $guest = array_filter($guest, fn($it) => (int)$it['product_id'] !== (int)$product->id);
        session()->put('guest_cart', array_values($guest));

        return response()->json(['success' => true, 'message' => 'Removed from guest cart']);
    }

    /**
     * Merge guest cart (client sends localStorage payload) into user cart
     */
    public function merge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $userId = $request->user()->id;
        $items = $validated['items'];

        if (count($items) > 200) {
            return response()->json(['success' => false, 'message' => 'Too many items to merge'], 400);
        }

        try {
            DB::transaction(function () use ($items, $userId) {
                foreach ($items as $it) {
                    $productId = (int)$it['product_id'];
                    $quantity = max(1, (int)$it['quantity']);

                    // lock product row for stock checks if available
                    $productRow = null;
                    if (Schema::hasColumn('products', 'stock')) {
                        $productRow = Product::where('id', $productId)->lockForUpdate()->first();
                    }

                    $existing = Cart::where('user_id', $userId)
                        ->where('product_id', $productId)
                        ->lockForUpdate()
                        ->first();

                    if ($productRow && isset($productRow->stock)) {
                        $currentInCart = $existing ? (int)$existing->quantity : 0;
                        $final = $currentInCart + $quantity;
                        if ($final > (int)$productRow->stock) {
                            throw new \RuntimeException('Insufficient stock for product id: ' . $productId);
                        }
                    }

                    if ($existing) {
                        $existing->increment('quantity', $quantity);
                        continue;
                    }

                    try {
                        Cart::create([
                            'user_id' => $userId,
                            'product_id' => $productId,
                            'quantity' => $quantity,
                        ]);
                    } catch (QueryException $e) {
                        $row = Cart::where('user_id', $userId)
                            ->where('product_id', $productId)
                            ->lockForUpdate()
                            ->first();
                        if ($row) {
                            $row->increment('quantity', $quantity);
                        } else {
                            throw $e;
                        }
                    }
                }
            }, 5);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Merge failed', 'error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true, 'message' => 'Cart merged']);
    }

    /**
     * Show checkout page. For authenticated users show DB cart (persistent).
     * For guests, read ephemeral session cart and then clear it so a refresh will
     * result in an empty cart (temporary storage semantics).
     */
    public function checkout(Request $request)
    {
        if ($request->user()) {
            $items = Cart::with('product')->where('user_id', $request->user()->id)->get();
            return view('checkout', ['cart' => $items, 'guest' => false]);
        }

        $guest = session()->get('guest_cart', []);
        // clear ephemeral cart immediately so refresh clears it
        session()->forget('guest_cart');

        return view('checkout', ['cart' => $guest, 'guest' => true]);
    }

    /**
     * Return total item count (sum of quantities) for authenticated user.
     * This endpoint is protected by auth middleware in routes.
     */
    public function count(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $total = Cart::where('user_id', $user->id)->sum('quantity');

        return response()->json(['success' => true, 'count' => (int)$total]);
    }

    /**
     * Backwards-compatible single-endpoint to add/update via POST /cart/{product}
     * Accepts optional `quantity` in body (default 1). Useful for simple client code.
     */
  public function addOrUpdate(Request $request, Product $product)
{
    $quantity = $request->input('quantity', 1);
    $productId = $product->id;

    if ($request->user()) {
        $userId = $request->user()->id;

        try {
            DB::transaction(function () use ($userId, $productId, $quantity) {
                $existing = Cart::where('user_id', $userId)
                    ->where('product_id', $productId)
                    ->lockForUpdate()
                    ->first();

                if ($existing) {
                    $existing->increment('quantity', $quantity);
                    return;
                }

                Cart::create([
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                ]);
            });
        } catch (\Throwable $e) {
            return redirect()->route('checkout.index')->with('error', 'Could not add to cart');
        }

        return redirect()->route('checkout.index');
    }

    // Guest cart in session
    $guest = session()->get('guest_cart', []);
    $foundKey = null;
    foreach ($guest as $k => $it) {
        if ((int)$it['product_id'] === $productId) { $foundKey = $k; break; }
    }

    $imageUrl = $product->image_url ? asset('storage/'.$product->image_url) : asset('images/default.png');

    if ($foundKey !== null) {
        $guest[$foundKey]['quantity'] += $quantity;
    } else {
        $guest[] = [
            'product_id' => $productId,
            'quantity' => $quantity,
            'name' => $product->name ?? '',
            'price' => $product->price ?? 0,
            'image_url' => $imageUrl,
        ];
    }

    session()->put('guest_cart', $guest);

    return redirect()->route('checkout.index');
}
    /**
     * Process checkout: convert authenticated user's cart into an Order + OrderItems
     * and clear the cart. Uses DB transaction to ensure consistency.
     */
    public function process(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $items = Cart::with('product')->where('user_id', $user->id)->get();
        \Log::debug('Checkout.process - retrieved cart items', ['user_id' => $user->id, 'count' => $items->count(), 'items' => $items->toArray()]);
        if ($items->isEmpty()) {
            \Log::warning('Checkout.process - no items found for user', ['user_id' => $user->id]);
            return redirect()->route('checkout.index')->with('error', 'السلة فارغة');
        }

        try {
            $order = DB::transaction(function () use ($user, $items) {
                $total = 0;
                foreach ($items as $it) {
                    $price = $it->product ? $it->product->price : 0;
                    $total += $price * ((int)$it->quantity);
                }

                // Determine store for the order. If missing, create a store for the first product's seller.
                $firstProduct = $items->first()->product ?? null;
                $storeId = null;
                if ($firstProduct) {
                    $store = $firstProduct->store()->first();
                    if (! $store) {
                        $store = \App\Models\Store::firstOrCreate([
                            'user_id' => $firstProduct->user_id
                        ], [
                            'name' => 'Auto-created store for tests',
                        ]);
                    }
                    $storeId = $store->id;
                }

                $order = \App\Models\Order::create([
                    'store_id' => $storeId,
                    'buyer_id' => $user->id,
                    'total' => $total,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                ]);

                foreach ($items as $it) {
                    $price = $it->product ? $it->product->price : 0;
                    \App\Models\OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $it->product_id,
                        'quantity' => (int)$it->quantity,
                        'price' => $price,
                    ]);
                }

                // Clear cart items for user
                Cart::where('user_id', $user->id)->delete();

                return $order;
            }, 5);
        } catch (\Throwable $e) {
            \Log::error('Checkout process failed: '.$e->getMessage());
            return redirect()->route('checkout.index')->with('error', 'تعذر إنشاء الطلب');
        }

        // Notify front-end (client will need to refresh counts)
        // Redirect to user's orders list or order detail if available
        return redirect()->route('orders.index')->with('success', 'تم إنشاء الطلب بنجاح');
    }
}
