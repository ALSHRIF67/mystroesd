<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;

class PendingProductsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = Category::factory()->create(['is_active' => 1]);
        $this->subcategory = Subcategory::factory()->create([
            'category_id' => $this->category->id,
            'status' => 1,
        ]);
    }

    public function test_pending_route_returns_only_user_pending_products()
    {
        $seller = User::factory()->create();
        $other = User::factory()->create();

        $pending = Product::factory()->create([
            'user_id' => $seller->id,
            'status' => Product::STATUS_PENDING,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'title' => 'منتج معلق'
        ]);

        $approved = Product::factory()->create([
            'user_id' => $seller->id,
            'status' => Product::STATUS_APPROVED,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'title' => 'منتج معتمد'
        ]);

        $otherPending = Product::factory()->create([
            'user_id' => $other->id,
            'status' => Product::STATUS_PENDING,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'title' => 'منتج آخر'
        ]);

        $this->actingAs($seller);

        $res = $this->get(route('products.pending'));
        $res->assertStatus(200);
        $res->assertViewHas('pendingProducts', function ($products) use ($pending, $approved, $otherPending) {
            // should include only the seller's pending product
            return $products->contains('id', $pending->id)
                && !$products->contains('id', $approved->id)
                && !$products->contains('id', $otherPending->id);
        });
    }

    public function test_owner_cannot_delete_non_pending_product()
    {
        $seller = User::factory()->create();
        $this->actingAs($seller);

        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'status' => Product::STATUS_APPROVED,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
        ]);

        $res = $this->delete(route('products.destroy', $product->id));

        $res->assertStatus(403);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'deleted_at' => null]);
    }

    public function test_owner_can_delete_pending_product()
    {
        $seller = User::factory()->create();
        $this->actingAs($seller);

        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'status' => Product::STATUS_PENDING,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
        ]);

        $res = $this->delete(route('products.destroy', $product->id));

        $res->assertRedirect(route('products.index'));
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }
}
