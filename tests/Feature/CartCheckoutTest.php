<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\{User, Product, Store};

class CartCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_add_to_cart_and_checkout()
    {
        $merchant = User::factory()->create();
        $merchant->store()->create(['name' => 'Store1', 'system_enabled' => true]);

        $product = Product::factory()->create(['user_id' => $merchant->id, 'price' => 50]);

        $buyer = User::factory()->create();
        $this->actingAs($buyer);

        // add to cart
        $this->post(route('cart.add'), ['product_id' => $product->id, 'quantity' => 2])->assertRedirect();

        // view cart
        $this->get(route('checkout.index'))->assertStatus(200);

        // place order -> this will clear cart and redirect (Payment strategy may redirect)
        $resp = $this->post(route('checkout.place'));

        // After place, ensure cart cleared
        $this->assertEmpty(session('cart', []));
    }
}
