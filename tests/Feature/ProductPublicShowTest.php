<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;

class ProductPublicShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_product_details_without_edit_delete_buttons()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(["user_id" => $user->id, 'title' => 'Public Product']);

        $response = $this->get(route('products.show', $product->id));

        $response->assertStatus(200);
        $response->assertSee('Public Product');
        $response->assertDontSee('تعديل');
        $response->assertDontSee('حذف');
    }

    public function test_owner_sees_edit_and_delete_buttons()
    {
        $owner = User::factory()->create();
        $product = Product::factory()->create(["user_id" => $owner->id, 'title' => 'Owner Product']);

        $response = $this->actingAs($owner)->get(route('products.show', $product->id));

        $response->assertStatus(200);
        $response->assertSee('Owner Product');
        $response->assertSee('تعديل');
        $response->assertSee('حذف');
    }

    public function test_non_owner_authenticated_user_does_not_see_edit_delete()
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $product = Product::factory()->create(["user_id" => $owner->id, 'title' => 'Someone Else Product']);

        $response = $this->actingAs($other)->get(route('products.show', $product->id));

        $response->assertStatus(200);
        $response->assertSee('Someone Else Product');
        $response->assertDontSee('تعديل');
        $response->assertDontSee('حذف');
    }
}
