<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_logged_in_user_can_add_update_and_remove_cart_items()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 10]);

        $this->actingAs($user)
            ->postJson(route('cart.add'), [
                'product_id' => $product->id,
                'quantity' => 2,
            ])->assertJson(['success' => true]);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        // Update quantity
        $this->actingAs($user)
            ->postJson(route('cart.update', $product), ['quantity' => 5])
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        // Remove
        $this->actingAs($user)
            ->deleteJson(route('cart.remove', $product))
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_guest_cart_in_session_cleared_on_checkout_and_logout()
    {
        $product = Product::factory()->create(['price' => 5]);

        // Guest add via public endpoint
        $resp = $this->post(route('cart.addOrUpdate', $product), ['quantity' => 3]);
        $resp->assertRedirect(route('checkout.index'));

        $this->assertIsArray(session('guest_cart'));
        $this->assertEquals(3, session('guest_cart')[0]['quantity']);

        // Visiting checkout should clear ephemeral guest cart
        $this->get(route('checkout.index'))->assertOk();
        $this->assertNull(session('guest_cart'));

        // Now test logout clears guest cart when user logs out
        $user = User::factory()->create();
        $this->actingAs($user);
        session()->put('guest_cart', [['product_id' => $product->id, 'quantity' => 1]]);

        $this->post(route('logout'));
        $this->assertNull(session('guest_cart'));
    }

    public function test_user_cannot_see_other_users_cart_items()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $product = Product::factory()->create();

        // Add cart entry for A
        Cart::create(['user_id' => $userA->id, 'product_id' => $product->id, 'quantity' => 2]);

        // B should see empty cart
        $res = $this->actingAs($userB)->getJson(route('cart.show'));
        $res->assertJson(['success' => true]);
        $body = $res->json();
        $this->assertIsArray($body['cart']);
        $this->assertCount(0, $body['cart']);
    }
}
