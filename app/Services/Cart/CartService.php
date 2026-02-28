<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Database\DatabaseManager as DB;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class CartService
{
    protected DB $db;

    public function __construct(DB $db)
    {
        $this->db = $db;
    }

    /**
     * Add a product to a user's cart or increment quantity if already exists.
     *
     * @param int $userId
     * @param int $productId
     * @param int $quantity
     * @return Cart
     * @throws RuntimeException
     */
    public function addToCart(int $userId, int $productId, int $quantity = 1): Cart
    {
        return $this->db->connection()->transaction(function () use ($userId, $productId, $quantity) {
            $cart = Cart::where('user_id', $userId)
                        ->where('product_id', $productId)
                        ->lockForUpdate()
                        ->first();

            if ($cart) {
                $cart->quantity += $quantity;
                $cart->save();
            } else {
                $product = Product::find($productId);
                if (!$product) {
                    throw new RuntimeException("Product not found");
                }

                $cart = Cart::create([
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                ]);
            }

            return $cart;
        });
    }

    /**
     * Update quantity of a cart item.
     *
     * @param int $userId
     * @param int $productId
     * @param int $quantity
     * @return bool
     */
    public function updateQuantity(int $userId, int $productId, int $quantity): bool
    {
        $cart = Cart::where('user_id', $userId)
                    ->where('product_id', $productId)
                    ->first();

        if (!$cart) return false;

        $cart->quantity = $quantity;
        return $cart->save();
    }

    /**
     * Remove a product from the cart.
     *
     * @param int $userId
     * @param int $productId
     * @return bool|null
     */
    public function removeItem(int $userId, int $productId): ?bool
    {
        return Cart::where('user_id', $userId)
                   ->where('product_id', $productId)
                   ->delete();
    }

    /**
     * Get all cart items for a user.
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function itemsForUser(int $userId)
    {
        return Cart::with('product')
                   ->where('user_id', $userId)
                   ->get();
    }

    /**
     * Count total quantity of items in user's cart.
     *
     * @param int $userId
     * @return int
     */
    public function countForUser(int $userId): int
    {
        return Cart::where('user_id', $userId)
                   ->sum('quantity');
    }

    /**
     * Merge guest cart items into user's DB cart
     *
     * @param int $userId
     * @param array $items
     * @return void
     */
    public function mergeCart(int $userId, array $items): void
    {
        foreach ($items as $item) {
            $this->addToCart($userId, $item['product_id'], $item['quantity']);
        }
    }
}