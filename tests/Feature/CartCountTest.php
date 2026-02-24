<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartCountTest extends TestCase
{
    use RefreshDatabase;

    public function test_count_updates_when_adding_increasing_decreasing_and_removing()
    {
        $user = User::factory()->create();
        $p1 = Product::factory()->create();
        $p2 = Product::factory()->create();

        $this->actingAs($user)
            ->postJson(route('cart.add'), ['product_id' => $p1->id, 'quantity' => 2])
            ->assertJson(['success' => true]);

        $this->assertEquals(2, $this->actingAs($user)->getJson(route('cart.count'))->json()['count']);

        // Add another product
        $this->actingAs($user)->postJson(route('cart.add'), ['product_id' => $p2->id, 'quantity' => 3]);
        $this->assertEquals(5, $this->actingAs($user)->getJson(route('cart.count'))->json()['count']);

        // Increase first product via update
        $this->actingAs($user)->postJson(route('cart.update', $p1), ['quantity' => 4]);
        $this->assertEquals(7, $this->actingAs($user)->getJson(route('cart.count'))->json()['count']);

        // Decrease second product
        $this->actingAs($user)->postJson(route('cart.update', $p2), ['quantity' => 1]);
        $this->assertEquals(5, $this->actingAs($user)->getJson(route('cart.count'))->json()['count']);

        // Remove first product
        $this->actingAs($user)->deleteJson(route('cart.remove', $p1));
        $this->assertEquals(1, $this->actingAs($user)->getJson(route('cart.count'))->json()['count']);
    }

    public function test_count_is_user_specific()
    {
        $a = User::factory()->create();
        $b = User::factory()->create();
        $p = Product::factory()->create();

        Cart::create(['user_id' => $a->id, 'product_id' => $p->id, 'quantity' => 2]);
        Cart::create(['user_id' => $b->id, 'product_id' => $p->id, 'quantity' => 5]);

        $resA = $this->actingAs($a)->getJson(route('cart.count'));
        $resA->assertJson(['success' => true, 'count' => 2]);

        $resB = $this->actingAs($b)->getJson(route('cart.count'));
        $resB->assertJson(['success' => true, 'count' => 5]);
    }
}
