<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;

class CartAddEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_post_to_cart_and_row_is_created()
    {
        $user = User::factory()->create();

        $product = Product::factory()->create();

        $this->actingAs($user)
            ->postJson('/cart/' . $product->id, [])
            ->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }
}
