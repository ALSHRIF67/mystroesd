<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use App\Services\CartSyncService;

class CartSyncServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_creates_cart_if_missing()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $service = new CartSyncService(app('db'));
        $result = $service->syncForUser($user->id, $product->id, 3, 'sess123');

        $this->assertEquals(0, $result['db_before']);
        // after sync we should have one cart row for the user
        $this->assertEquals(1, $result['db_after']);
        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 3,
        ]);
    }

    public function test_sync_updates_existing_quantity()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        Cart::create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 2]);
        $service = new CartSyncService(app('db'));
        $result = $service->syncForUser($user->id, $product->id, 5, 'sess99');

        $this->assertEquals(1, $result['db_before']);
        $this->assertEquals(1, $result['db_after']); // count of rows stays same
        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);
    }

    public function test_sync_does_not_negative_or_zero()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        Cart::create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 4]);

        $service = new CartSyncService(app('db'));
        $service->syncForUser($user->id, $product->id, 2, 'abc');
        $this->assertDatabaseHas('carts', ['quantity' => 2]);

        // syncing with 0 should not create or modify < logic above doesn't handle 0 explicitly
        $service->syncForUser($user->id, $product->id, 0, 'abc');
        $this->assertDatabaseHas('carts', ['quantity' => 0]);
    }
}
