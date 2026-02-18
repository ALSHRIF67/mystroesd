<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Store;
use App\Models\Product;

class MerchantProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_merchant_can_crud_products()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // activate store
        $this->post(route('merchant.orderSystem.activate'));
        $this->assertDatabaseHas('stores', ['user_id' => $user->id, 'system_enabled' => 1]);

        // create product
        $resp = $this->post(route('merchant.products.store'), [
            'title' => 'Test Prod',
            'price' => 99.99,
            'description' => 'Desc',
        ]);

        $resp->assertRedirect(route('merchant.products.index'));

        $this->assertDatabaseHas('products', ['title' => 'Test Prod', 'user_id' => $user->id]);
    }
}
