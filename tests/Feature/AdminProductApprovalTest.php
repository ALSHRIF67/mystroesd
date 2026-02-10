<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminProductApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_approve_product_and_product_becomes_live()
    {
        // create admin and seller
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);

        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'status' => Product::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.products.approve', ['id' => $product->id]))
            ->assertRedirect();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'status' => Product::STATUS_APPROVED,
        ]);

        // Live scope should return the product
        $live = Product::live()->where('id', $product->id)->first();
        $this->assertNotNull($live);
    }

    public function test_non_admin_cannot_approve()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $product = Product::factory()->create(['status' => Product::STATUS_PENDING]);

        $this->actingAs($seller)
            ->post(route('admin.products.approve', ['id' => $product->id]))
            ->assertStatus(403);
    }
}
