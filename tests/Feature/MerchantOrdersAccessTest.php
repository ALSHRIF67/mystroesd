<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Order;

class MerchantOrdersAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_merchant_can_view_their_orders()
    {
        $merchant = User::factory()->create();
        $merchant->store()->create(['name' => 'Store A', 'system_enabled' => true]);

        $order = Order::factory()->create(['store_id' => $merchant->store->id]);

        $this->actingAs($merchant)
            ->get(route('merchant.orders.index'))
            ->assertStatus(200);

        $this->actingAs($merchant)
            ->get(route('merchant.orders.show', $order->id))
            ->assertStatus(200);
    }

    public function test_merchant_cannot_view_others_orders()
    {
        $merchantA = User::factory()->create();
        $merchantA->store()->create(['name' => 'Store A', 'system_enabled' => true]);

        $merchantB = User::factory()->create();
        $merchantB->store()->create(['name' => 'Store B', 'system_enabled' => true]);

        $order = Order::factory()->create(['store_id' => $merchantB->store->id]);

        $this->actingAs($merchantA)
            ->get(route('merchant.orders.show', $order->id))
            ->assertStatus(404);
    }
}
