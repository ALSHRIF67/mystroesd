<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // create category and subcategory
        $this->category = Category::factory()->create(['is_active' => 1]);
        $this->subcategory = Subcategory::factory()->create([
            'category_id' => $this->category->id,
            'status' => 1,
        ]);
        $this->user = User::factory()->create();
    }

    public function test_creating_product_with_valid_data()
    {
        Storage::fake('public');

        $this->actingAs($this->user);

        $file1 = UploadedFile::fake()->create('photo1.jpg', 100, 'image/jpeg');
        $file2 = UploadedFile::fake()->create('photo2.png', 150, 'image/png');

        $response = $this->post(route('products.store'), [
            'title' => 'Test Product',
            'description' => 'Desc',
            'price' => 1000,
            'negotiable' => 1,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'tags' => 'tag1,tag2',
            'email' => 'test@example.com',
            'phone' => '+249123456789',
            'country_code' => '+249',
            'images' => [$file1, $file2],
            'image' => $file1,
        ]);

        $response->assertRedirect(route('products.index'));

        $this->assertDatabaseHas('products', ['title' => 'Test Product']);

        $product = Product::where('title', 'Test Product')->first();

        // images stored
        $this->assertNotNull($product->images);
        $this->assertCount(2, $product->images);

        foreach ($product->images as $img) {
            Storage::disk('public')->assertExists('products/' . $img);
        }

        // single image stored (compatibility)
        $this->assertNotNull($product->image);
        Storage::disk('public')->assertExists('products/' . $product->image);
    }

    public function test_validation_errors_for_missing_fields()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('products.store'), []);

        $response->assertSessionHasErrors(['title', 'price', 'category_id']);
    }

    public function test_updating_a_product()
    {
        Storage::fake('public');
        $this->actingAs($this->user);

        $product = Product::factory()->create([
            'title' => 'Old',
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'price' => 100,
            'images' => [],
        ]);

        $file = UploadedFile::fake()->create('new.jpg', 120, 'image/jpeg');

        $response = $this->put(route('products.update', $product->id), [
            'title' => 'Updated',
            'price' => 200,
            'category_id' => $this->category->id,
            'images' => [$file],
        ]);

        $response->assertRedirect(route('products.index'));

        $this->assertDatabaseHas('products', ['id' => $product->id, 'title' => 'Updated']);

        $product->refresh();
        $this->assertNotEmpty($product->images);
        foreach ($product->images as $img) {
            Storage::disk('public')->assertExists('products/' . $img);
        }
    }

    public function test_index_displays_product_image()
    {
        Storage::fake('public');
        $this->actingAs($this->user);

        // create product with image (store dummy file)
        $filename = time() . '_' . uniqid() . '.jpg';
        Storage::disk('public')->put('products/' . $filename, 'dummy-image-content');

        $product = Product::factory()->create([
            'title' => 'ShowImage',
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'price' => 10,
            'image' => $filename,
        ]);

        $response = $this->get(route('products.index'));
        $response->assertStatus(200);

        // The rendered page should contain the image filename (URL appears in JSON payload)
        $this->assertStringContainsString($filename, $response->getContent());
    }

    public function test_delete_restore_and_force_delete()
    {
        Storage::fake('public');
        $this->actingAs($this->user);

        $product = Product::factory()->create([
            'title' => 'ToDelete',
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'price' => 50,
        ]);

        // soft delete
        $response = $this->delete(route('products.destroy', $product->id));
        $response->assertRedirect(route('products.index'));
        $this->assertSoftDeleted('products', ['id' => $product->id]);

        // restore
        $response = $this->post(route('products.restore', $product->id));
        $response->assertRedirect(route('products.index'));
        $this->assertDatabaseHas('products', ['id' => $product->id, 'title' => 'ToDelete']);

        // force delete
        $response = $this->delete(route('products.forceDelete', $product->id));
        $response->assertRedirect(route('products.index'));
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
