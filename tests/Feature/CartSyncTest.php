<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Cart;
use App\Models\Product;
use App\Services\CartSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Str;

class CartSyncTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_syncs_temporary_cart_with_database_atomically()
    {
        // Create a user and a product
        $user = User::factory()->create();
        $product = Product::factory()->create();

        // Ensure no cart rows exist for this user
        $dbBefore = Cart::where('user_id', $user->id)->count();

        // Simulate a temporary cart quantity (e.g., from session/local state)
        $tempQuantity = 3;
        $sessionId = Str::random(32);

        // Run the sync service
        $service = $this->app->make(CartSyncService::class);
        $result = $service->syncForUser($user->id, $product->id, $tempQuantity, $sessionId);

        // Read values after sync
        $dbAfter = Cart::where('user_id', $user->id)->count();
        $cart = Cart::where('user_id', $user->id)->where('product_id', $product->id)->first();

        // Print the requested numbers (PHPUnit will capture and show this output)
        echo "DB before: {$result['db_before']}\n";
        echo "Temp quantity: {$result['temp_quantity']}\n";
        echo "DB after: {$result['db_after']}\n";

        // Basic assertions
        $this->assertEquals(0, $result['db_before']);
        $this->assertEquals($tempQuantity, $result['temp_quantity']);
        $this->assertEquals(1, $dbAfter, 'Expected one cart row after synchronization');
        $this->assertNotNull($cart, 'Cart row should exist');
        $this->assertEquals($tempQuantity, $cart->quantity, 'Quantity in DB should match temporary quantity');
    }
}
