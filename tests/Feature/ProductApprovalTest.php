<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductApprovalTest extends TestCase
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

    public function test_seller_creates_product_pending_and_admin_approves()
    {
        Storage::fake('public');

        // seller
        $seller = User::factory()->create();
        $this->actingAs($seller);

        $file = UploadedFile::fake()->create('p.jpg', 50);

        $response = $this->post(route('products.store'), [
            'title' => 'SellerProduct',
            'price' => 5,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'images' => [$file],
            'image' => $file,
        ]);

        $response->assertRedirect(route('products.index'));

        $product = Product::where('title', 'SellerProduct')->first();
        $this->assertNotNull($product);
        $this->assertEquals(Product::STATUS_PENDING, $product->status);

        // admin approves
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        \Illuminate\Support\Facades\Notification::fake();
        $res2 = $this->post(route('products.approve', $product->id));
        $res2->assertRedirect(route('products.index'));

        $product->refresh();
        $this->assertEquals(Product::STATUS_APPROVED, $product->status);

        // Seller notification record exists in seller_notifications
        $this->assertDatabaseHas('seller_notifications', [
            'user_id' => $seller->id,
            'product_id' => $product->id,
            'type' => 'status_changed',
        ]);
    }
}
