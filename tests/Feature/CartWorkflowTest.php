<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;

class CartWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_logged_in_add_redirects_and_db_has_row()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user)
            ->post('/cart/' . $product->id)
            ->assertRedirect(route('checkout.index'));

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_guest_add_stores_in_session_and_cleared_on_refresh()
    {
        $product = Product::factory()->create();

        $response = $this->post('/cart/' . $product->id)
            ->assertRedirect(route('checkout.index'));

        $this->assertNotEmpty(session('guest_cart'));

        // Simulate visiting checkout which should clear the guest cart
        $this->get(route('checkout.index'))->assertStatus(200);

        $this->assertEmpty(session('guest_cart'));
    }

    public function test_logout_clears_temporary_cart()
    {
        $product = Product::factory()->create();

        // store guest cart
        session()->put('guest_cart', [['product_id' => $product->id, 'quantity' => 1]]);

        $user = User::factory()->create();
        // logout event clears session
        event(new \Illuminate\Auth\Events\Logout('web', $user));

        $this->assertEmpty(session('guest_cart'));
    }

    public function test_logged_in_cart_persists_on_refresh()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post('/cart/' . $product->id)->assertRedirect(route('checkout.index'));

        $this->actingAs($user)->get(route('checkout.index'))->assertStatus(200);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }
}
