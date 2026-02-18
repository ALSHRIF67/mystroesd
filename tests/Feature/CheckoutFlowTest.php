<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Plan;
use App\Models\Store;
use App\Models\Product;

class CheckoutFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_add_to_cart_and_checkout_creates_order()
    {
        $plan = Plan::create(['name' => 'Paid', 'price' => 10, 'has_whatsapp' => true, 'has_system_orders' => true, 'has_delivery' => true]);
        $store = Store::create(['plan_id' => $plan->id, 'selling_mode' => 'system', 'name' => 'System Store']);

        $user = \App\Models\User::factory()->create();
        $store->user_id = $user->id;
        $store->save();

        $product = Product::factory()->create(['user_id' => $user->id, 'price' => 30]);

        // add to cart
        $response = $this->post(route('cart.add'), ['product_id' => $product->id, 'quantity' => 1]);
        $response->assertRedirect();

        // view checkout
        $response = $this->get(route('checkout.index'));
        $response->assertStatus(200);

        // place checkout
        $response = $this->post(route('checkout.place'));
        $response->assertRedirect();

        $this->assertDatabaseHas('orders', ['store_id' => $store->id, 'total' => 30.00]);
    }
}
