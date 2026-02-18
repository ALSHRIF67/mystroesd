<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Store;
use App\Models\Product;

class MerchantProductOrderSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_is_auto_approved_when_store_order_system_enabled()
    {
        $user = User::factory()->create();
        $store = Store::factory()->create([
            'user_id' => $user->id,
            'system_enabled' => true,
        ]);

        $this->actingAs($user);

        $response = $this->post(route('products.store'), [
            'title' => 'Test Product',
            'price' => 10,
            'category_id' => 1, // category factory or seeded category may not exist in sqlite; create fallback
        ]);

        $product = Product::where('title', 'Test Product')->first();
        $this->assertNotNull($product);
        $this->assertEquals(Product::STATUS_APPROVED, $product->status);
        $this->assertNotNull($product->published_at);
    }

    public function test_product_is_pending_when_order_system_disabled()
    {
        $user = User::factory()->create();
        $store = Store::factory()->create([
            'user_id' => $user->id,
            'system_enabled' => false,
        ]);

        $this->actingAs($user);

        $response = $this->post(route('products.store'), [
            'title' => 'Pending Product',
            'price' => 5,
            'category_id' => 1,
        ]);

        $product = Product::where('title', 'Pending Product')->first();
        $this->assertNotNull($product);
        $this->assertEquals(Product::STATUS_PENDING, $product->status);
    }

    public function test_ensure_store_owner_middleware_blocks_other_users_from_merchant_routes()
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $store = Store::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($other);

        $response = $this->get(route('merchant.products.index', ['store' => $store->id]));
        $response->assertStatus(403);
    }
}
