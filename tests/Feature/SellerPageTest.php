<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;

class SellerPageTest extends TestCase
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

    public function test_seller_page_shows_only_live_products()
    {
        $seller = User::factory()->create();

        $approved = Product::factory()->create([
            'title' => 'ApprovedProduct',
            'status' => Product::STATUS_APPROVED,
            'user_id' => $seller->id,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
        ]);

        $pending = Product::factory()->create([
            'title' => 'PendingProduct',
            'status' => Product::STATUS_PENDING,
            'user_id' => $seller->id,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
        ]);

        $response = $this->get(route('seller.show', ['user' => $seller->id]));
        $response->assertStatus(200);

        $response->assertJsonFragment(['title' => 'ApprovedProduct']);
        $response->assertJsonMissing(['title' => 'PendingProduct']);
    }
}
