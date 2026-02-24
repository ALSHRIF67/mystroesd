<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_add_product_to_cart()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)
            ->postJson(route('cart.add'), ['product_id' => $product->id, 'quantity' => 2])
            ->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_add_same_product_twice_increments_quantity()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)
            ->postJson(route('cart.add'), ['product_id' => $product->id, 'quantity' => 1])
            ->assertStatus(200);

        $this->actingAs($user)
            ->postJson(route('cart.add'), ['product_id' => $product->id, 'quantity' => 3])
            ->assertStatus(200);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 4,
        ]);
    }

    public function test_remove_product_from_cart()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        Cart::create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 2]);

        $this->actingAs($user)
            ->deleteJson(route('cart.remove', $product->id))
            ->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_update_quantity_invalid_is_rejected()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        Cart::create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 2]);

        $this->actingAs($user)
            ->postJson(route('cart.update', $product->id), ['quantity' => 0])
            ->assertStatus(422);
    }

    public function test_guest_add_then_login_merge_combines_quantities()
    {
        $user = User::factory()->create();
        $productA = Product::factory()->create();
        $productB = Product::factory()->create();

        // Guest payload (localStorage shape)
        $items = [
            ['product_id' => $productA->id, 'quantity' => 2],
            ['product_id' => $productB->id, 'quantity' => 1],
        ];

        // Simulate existing DB cart for productA (user already had 1)
        Cart::create(['user_id' => $user->id, 'product_id' => $productA->id, 'quantity' => 1]);

        $this->actingAs($user)
            ->postJson(route('cart.merge'), ['items' => $items])
            ->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $productA->id,
            'quantity' => 3, // 1 existing + 2 merged
        ]);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $productB->id,
            'quantity' => 1,
        ]);
    }

    public function test_duplicate_insert_handling_increments_existing()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        // Pre-create a row to simulate one transaction committing before another
        Cart::create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 2]);

        $this->actingAs($user)
            ->postJson(route('cart.add'), ['product_id' => $product->id, 'quantity' => 5])
            ->assertStatus(200);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 7,
        ]);
    }

    public function test_multiple_quick_add_requests_accumulate_quantity()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user);

        // Simulate rapid successive add requests
        for ($i = 0; $i < 5; $i++) {
            $this->postJson(route('cart.add'), ['product_id' => $product->id, 'quantity' => 1])
                ->assertStatus(200);
        }

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);
    }
}
