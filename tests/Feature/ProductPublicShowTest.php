<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use Inertia\Testing\AssertableInertia as AssertableInertia;

class ProductPublicShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_product_details_without_edit_delete_buttons()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(["user_id" => $user->id, 'title' => 'Public Product']);

        $response = $this->get(route('products.show', $product->id));

        $response->assertStatus(200);
        $response->assertInertia(function (AssertableInertia $page) use ($product) {
            $page->component('Products/Show')
                 ->where('product.title', $product->title)
                 ->where('product.seller.id', $product->user_id);
        });
    }

    public function test_owner_sees_edit_and_delete_buttons()
    {
        $owner = User::factory()->create();
        $product = Product::factory()->create(["user_id" => $owner->id, 'title' => 'Owner Product']);

        $response = $this->actingAs($owner)->get(route('products.show', $product->id));

        $response->assertStatus(200);
        $response->assertInertia(function (AssertableInertia $page) use ($product, $owner) {
            $page->component('Products/Show')
                 ->where('product.title', $product->title)
                 ->where('product.seller.id', $product->user_id)
                 ->where('auth.user.id', $owner->id);
        });
    }

    public function test_non_owner_authenticated_user_does_not_see_edit_delete()
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $product = Product::factory()->create(["user_id" => $owner->id, 'title' => 'Someone Else Product']);

        $response = $this->actingAs($other)->get(route('products.show', $product->id));

        $response->assertStatus(200);
        $response->assertInertia(function (AssertableInertia $page) use ($product, $other) {
            $page->component('Products/Show')
                 ->where('product.title', $product->title)
                 ->where('product.seller.id', $product->user_id)
                 ->where('auth.user.id', $other->id);
        });
    }
}
