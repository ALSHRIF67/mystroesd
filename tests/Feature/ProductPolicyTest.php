<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;

class ProductPolicyTest extends TestCase
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

    public function test_owner_can_edit_own_product_before_approval()
    {
        $seller = User::factory()->create();
        $this->actingAs($seller);

        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'status' => Product::STATUS_PENDING,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'title' => 'Old Title',
        ]);

        $res = $this->patch(route('products.update', $product->id), [
            'title' => 'New Title',
            'price' => 10,
            'category_id' => $this->category->id,
        ]);

        $res->assertRedirect(route('products.index'));
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'title' => 'New Title',
        ]);
    }

    public function test_owner_cannot_edit_others_product()
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $product = Product::factory()->create([
            'user_id' => $owner->id,
            'status' => Product::STATUS_PENDING,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'title' => 'Owner Title',
        ]);

        $this->actingAs($other);

        $res = $this->patch(route('products.update', $product->id), [
            'title' => 'Hacked',
            'price' => 10,
            'category_id' => $this->category->id,
        ]);

        $res->assertStatus(403);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'title' => 'Owner Title',
        ]);
    }

    public function test_admin_can_approve_product_sets_metadata()
    {
        $seller = User::factory()->create();
        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'status' => Product::STATUS_PENDING,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
        ]);

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $res = $this->post(route('products.approve', $product->id));
        $res->assertRedirect(route('products.index'));

        $product->refresh();
        $this->assertEquals(Product::STATUS_APPROVED, $product->status);
        $this->assertEquals($admin->id, $product->approved_by);
        $this->assertNotNull($product->approved_at);
        $this->assertNotNull($product->published_at);
    }
}
