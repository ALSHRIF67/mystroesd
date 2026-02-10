<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Category;
use App\Models\Subcategory;

class ProductsMyProductsRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_myproducts_path_redirects_to_mine_and_renders()
    {
        // create category/subcategory for controller render
        $category = Category::factory()->create(['is_active' => 1]);
        $subcategory = Subcategory::factory()->create(['category_id' => $category->id, 'status' => 1]);

        $user = User::factory()->create();

        $this->actingAs($user);

        // Request the legacy path
        $response = $this->get('/products/MyProducts');

        // Should redirect to /products/mine
        $response->assertStatus(302);

        // Debug: ensure auth is active in test requests
        $dbg = $this->get('/debug-mine');
        $dbg->assertStatus(200);

        // Directly request the target route
        $resp2 = $this->get('/products/mine');
        // dump content for debugging
        fwrite(STDERR, "--- PRODUCTS.MINE CONTENT START ---\n");
        fwrite(STDERR, $resp2->getContent() . "\n");
        fwrite(STDERR, "--- PRODUCTS.MINE CONTENT END ---\n");
        $resp2->assertStatus(200);
        $resp2->assertSee('منتجاتي');
    }
}
