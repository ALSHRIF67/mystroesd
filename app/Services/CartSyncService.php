<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Database\DatabaseManager as DB;

class CartSyncService
{
    protected DB $db;

    public function __construct(DB $db)
    {
        $this->db = $db;
    }

    /**
     * Synchronize a single product quantity between a temporary cart and the database for a user.
     *
     * Returns an array with keys: db_before, temp_quantity, db_after
     */
    public function syncForUser(int $userId, int $productId, int $tempQuantity, string $sessionId): array
    {
        // read DB count before synchronization
        $dbBefore = Cart::where('user_id', $userId)->count();

        $this->db->connection()->transaction(function () use ($userId, $productId, $tempQuantity, $sessionId) {
            // Try to lock existing row for update
            $cart = Cart::where('user_id', $userId)
                ->where('product_id', $productId)
                ->lockForUpdate()
                ->first();

            if ($cart) {
                // if temp > db, add difference; if temp < db, set to temp
                if ($tempQuantity > $cart->quantity) {
                    $diff = $tempQuantity - $cart->quantity;
                    $cart->quantity = $cart->quantity + $diff;
                    $cart->save();
                } elseif ($tempQuantity < $cart->quantity) {
                    $cart->quantity = $tempQuantity;
                    $cart->save();
                }
                // if equal, nothing to do
            } else {
                if ($tempQuantity > 0) {
                    $product = Product::find($productId);
                    $storeId = null;
                    if ($product) {
                        $storeId = $product->store_id ?? null;
                    }

                    // Create a new cart row with required fields
                    $new = new Cart();
                    $new->user_id = $userId;
                    $new->product_id = $productId;
                    $new->quantity = $tempQuantity;
                    $new->store_id = $storeId;
                    $new->session_id = $sessionId;
                    $new->save();
                }
            }
        });

        $dbAfter = Cart::where('user_id', $userId)->count();

        return [
            'db_before' => $dbBefore,
            'temp_quantity' => $tempQuantity,
            'db_after' => $dbAfter,
        ];
    }
}
