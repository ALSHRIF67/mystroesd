<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_approved_products_appear_on_public_seller_page()
    {
        $seller = User::factory()->create(['role' => 'seller']);

        // create products in different states
        $approved = Product::factory()->create(['user_id' => $seller->id, 'status' => Product::STATUS_APPROVED, 'title' => 'Approved Item']);
        $pending = Product::factory()->create(['user_id' => $seller->id, 'status' => Product::STATUS_PENDING]);
        $rejected = Product::factory()->create(['user_id' => $seller->id, 'status' => Product::STATUS_REJECTED]);
        $suspended = Product::factory()->create(['user_id' => $seller->id, 'status' => Product::STATUS_SUSPENDED]);
        $archived = Product::factory()->create(['user_id' => $seller->id, 'status' => Product::STATUS_ARCHIVED]);

        $response = $this->get(route('seller.show', ['user' => $seller->id]));
        $response->assertStatus(200);

        $data = $response->json();

        // Only approved product should be returned
        $this->assertCount(1, $data['products']);
        $this->assertEquals('Approved Item', $data['products'][0]['title']);
        $this->assertEquals(Product::STATUS_APPROVED, $data['products'][0]['status']);
    }

    public function test_suspending_seller_hides_all_products()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);

        $product = Product::factory()->create(['user_id' => $seller->id, 'status' => Product::STATUS_APPROVED]);

        // Admin toggles suspend
        $this->actingAs($admin)
            ->post(route('admin.sellers.toggleSuspend', ['id' => $seller->id]))
            ->assertRedirect();

        $seller->refresh();
        $product->refresh();

        $this->assertTrue((bool)$seller->is_suspended);
        $this->assertEquals(Product::STATUS_SUSPENDED, $product->status);

        // Public seller page should show no products
        $resp = $this->get(route('seller.show', ['user' => $seller->id]));
        $resp->assertStatus(200);
        $data = $resp->json();
        $this->assertCount(0, $data['products']);
    }
}
