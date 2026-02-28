<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\Product\ProductService;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\User;

class ProductServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProductService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProductService();
    }

    public function test_create_sets_defaults_and_handles_images()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        \App\Models\Store::factory()->create(['user_id' => $user->id]);
        $this->actingAs($user);

        $category = Category::factory()->create(['is_active' => 1]);
        $sub = Subcategory::factory()->create(['category_id' => $category->id, 'status' => 1]);

        $file1 = UploadedFile::fake()->create('one.jpg', 100, 'image/jpeg');
        $file2 = UploadedFile::fake()->create('two.jpg', 150, 'image/png');

        $product = $this->service->create([
            'title' => 'Service product',
            'price' => 5,
            'category_id' => $category->id,
            'subcategory_id' => $sub->id,
            'negotiable' => 1,
            'tags' => 'a,b',
            'email' => 'a@b.com',
            'phone' => '+249123',
            'country_code' => '+249',
        ], ['images' => [$file1, $file2], 'image' => $file1]);

        $this->assertInstanceOf(Product::class, $product);
        $this->assertEquals('Service product', $product->title);
        $this->assertEquals($user->id, $product->user_id);
        $this->assertNotNull($product->images);
        $this->assertCount(2, $product->images);
        foreach ($product->images as $img) {
            Storage::disk('public')->assertExists('products/' . $img);
        }
        Storage::disk('public')->assertExists('products/' . $product->image);
    }

    public function test_update_combines_and_removes_images_and_respects_status()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        \App\Models\Store::factory()->create(['user_id' => $user->id]);
        $this->actingAs($user);

        $category = Category::factory()->create(['is_active' => 1]);
        $sub = Subcategory::factory()->create(['category_id' => $category->id, 'status' => 1]);

        $product = Product::factory()->create([
            'category_id' => $category->id,
            'subcategory_id' => $sub->id,
            'price' => 1,
            'images' => [],
        ]);

        $file = UploadedFile::fake()->create('new.jpg', 120, 'image/jpeg');
        $product->images = ['old1.jpg', 'old2.jpg'];
        $product->save();

        // pretend files exist
        Storage::disk('public')->put('products/old1.jpg', 'x');
        Storage::disk('public')->put('products/old2.jpg', 'x');

        $updated = $this->service->update($product, [
            'title' => 'updated',
            'price' => 2,
            'category_id' => $category->id,
            'images' => [],
            'remove_images' => ['old1.jpg'],
            'status' => Product::STATUS_APPROVED, // should be removed for non-admin
        ], ['images' => [$file], 'image' => $file]);

        $this->assertEquals('updated', $updated->title);
        $this->assertEquals(2, $updated->price);
        $this->assertNotContains('old1.jpg', $updated->images);
        $this->assertContains('old2.jpg', $updated->images);
        $this->assertCount(2, $updated->images); // old2 + new file
        Storage::disk('public')->assertMissing('products/old1.jpg');
        foreach ($updated->images as $img) {
            Storage::disk('public')->assertExists('products/' . $img);
        }
        Storage::disk('public')->assertExists('products/' . $updated->image);
        $this->assertNotEquals(Product::STATUS_APPROVED, $updated->status);
    }

    public function test_subcategory_validation_throws()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->service->create([
            'title' => 'oops',
            'price' => 1,
            'category_id' => 999,
            'subcategory_id' => 1,
        ], []);
    }
}
