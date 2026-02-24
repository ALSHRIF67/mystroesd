<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutProcessTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_creates_order_and_clears_cart()
    {
        $user = User::factory()->create();
        $p1 = Product::factory()->create(['price' => 10]);
        $p2 = Product::factory()->create(['price' => 5]);

        Cart::create(['user_id' => $user->id, 'product_id' => $p1->id, 'quantity' => 2]);
        Cart::create(['user_id' => $user->id, 'product_id' => $p2->id, 'quantity' => 1]);

        $this->actingAs($user)
            ->post(route('checkout.process'))
            ->assertRedirect(route('orders.index'));

        $this->assertDatabaseCount('orders', 1);
        $order = Order::first();
        $this->assertEquals($user->id, $order->buyer_id);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'product_id' => $p1->id, 'quantity' => 2]);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'product_id' => $p2->id, 'quantity' => 1]);

        // Cart cleared
        $this->assertDatabaseMissing('carts', ['user_id' => $user->id]);
    }
}
