<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->product = Product::factory()->create();
    }

    /** @test */
    public function user_can_add_product_to_cart()
    {
        $response = $this->actingAs($this->user)
                         ->postJson("/cart/{$this->product->id}");

        $response->assertOk()
                 ->assertJson([
                     'success' => true,
                     'message' => 'Product added to cart.',
                 ]);

        $this->assertDatabaseHas('carts', [
            'user_id'    => $this->user->id,
            'product_id' => $this->product->id,
            'quantity'   => 1,
        ]);
    }

    /** @test */
    public function quantity_increases_if_product_exists()
    {
        // First addition
        $this->actingAs($this->user)->postJson("/cart/{$this->product->id}");

        // Second addition (should increase quantity)
        $response = $this->actingAs($this->user)
                         ->postJson("/cart/{$this->product->id}");

        $response->assertOk()
                 ->assertJson([
                     'success' => true,
                     'message' => 'Product quantity updated in cart.',
                 ]);

        $this->assertDatabaseHas('carts', [
            'user_id'    => $this->user->id,
            'product_id' => $this->product->id,
            'quantity'   => 2,
        ]);
    }

    /** @test */
    public function guest_cannot_add_to_cart()
    {
        $response = $this->postJson("/cart/{$this->product->id}");

        // For API routes with 'auth:sanctum', expect 401 Unauthenticated
        $response->assertUnauthorized();
    }

    /** @test */
    public function user_can_remove_product_from_cart()
    {
        // First add the product
        $this->actingAs($this->user)->postJson("/cart/{$this->product->id}");

        // Now remove it
        $response = $this->actingAs($this->user)
                         ->deleteJson("/cart/{$this->product->id}");

        $response->assertOk()
                 ->assertJson([
                     'success' => true,
                     'message' => 'Product removed from cart.',
                 ]);

        $this->assertDatabaseMissing('carts', [
            'user_id'    => $this->user->id,
            'product_id' => $this->product->id,
        ]);
    }

    /** @test */
    public function removing_non_existent_cart_item_returns_404()
    {
        $response = $this->actingAs($this->user)
                         ->deleteJson("/cart/999"); // product that doesn't exist or not in cart

        // Since route uses implicit binding, a 404 will be thrown if product doesn't exist.
        // But if product exists but not in user's cart, we handle it.
        // To test the "not in cart" scenario, we create another product not added.
        $anotherProduct = Product::factory()->create();

        $response = $this->actingAs($this->user)
                         ->deleteJson("/cart/{$anotherProduct->id}");

        $response->assertStatus(404)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Product not found in your cart.',
                 ]);
    }
}