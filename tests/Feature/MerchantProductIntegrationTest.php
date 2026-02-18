<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Store;
use App\Models\Product;

class MerchantProductIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_seller_with_store_can_create_product()
    {
        $seller = User::factory()->create(['role' => 'seller']);

        // seller without store -> should be forbidden by policy
        $this->actingAs($seller);

        $response = $this->post(route('products.store'), [
            'title' => 'Test Product',
            'price' => 10,
            'category_id' => 1,
        ]);

        $response->assertStatus(403);

        // create store for seller
        Store::factory()->create(['user_id' => $seller->id, 'system_enabled' => false]);

        $response2 = $this->post(route('products.store'), [
            'title' => 'Test Product 2',
            'price' => 20,
            'category_id' => 1,
        ]);

        // now should redirect (product created but pending since store not enabled)
        $response2->assertStatus(302);
        $this->assertDatabaseHas('products', ['title' => 'Test Product 2', 'user_id' => $seller->id]);
    }

    public function test_products_auto_approved_when_store_enabled_and_visible_on_dashboard()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['user_id' => $seller->id, 'system_enabled' => true]);

        $this->actingAs($seller);

        $response = $this->post(route('products.store'), [
            'title' => 'Store Live Product',
            'price' => 33.5,
            'category_id' => 1,
        ]);

        $response->assertStatus(302);

        // Product must be pending by default
        $this->assertDatabaseHas('products', [
            'title' => 'Store Live Product',
            'user_id' => $seller->id,
            'status' => Product::STATUS_PENDING,
        ]);

        $product = Product::where('title', 'Store Live Product')->first();

        // Admin approves the product
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $approveResp = $this->post(route('admin.products.approve', $product->id));
        $approveResp->assertStatus(302);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'status' => Product::STATUS_APPROVED,
        ]);

        // Admin sets product to offline
        $updateResp = $this->put(route('admin.products.update', $product->id), [
            'status' => 'offline',
        ]);
        $updateResp->assertStatus(302);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'status' => 'offline',
        ]);

        // Visit merchant dashboard and assert product title is present
        $this->actingAs($seller);
        $dash = $this->get(route('merchant.orderSystem.dashboard'));
        $dash->assertStatus(200);
        $dash->assertSee('Store Live Product');
    }
}
