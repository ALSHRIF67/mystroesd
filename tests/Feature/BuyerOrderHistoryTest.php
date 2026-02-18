<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Order;

class BuyerOrderHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_view_their_orders()
    {
        $buyer = User::factory()->create();
        $order = Order::factory()->create(['buyer_id' => $buyer->id]);

        $this->actingAs($buyer)
            ->get(route('orders.index'))
            ->assertStatus(200);

        $this->actingAs($buyer)
            ->get(route('orders.show', $order->id))
            ->assertStatus(200);
    }

    public function test_buyer_cannot_view_others_order()
    {
        $buyerA = User::factory()->create();
        $buyerB = User::factory()->create();
        $order = Order::factory()->create(['buyer_id' => $buyerB->id]);

        $this->actingAs($buyerA)
            ->get(route('orders.show', $order->id))
            ->assertStatus(404);
    }
}
