<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Plan;
use App\Models\Store;
use App\Models\Product;
use App\Services\Orders\OrderService;

class OrderServiceStrategyTest extends TestCase
{
    use RefreshDatabase;

    public function test_whatsapp_strategy_redirects_and_logs()
    {
        $plan = Plan::create(['name' => 'Free', 'price' => 0, 'has_whatsapp' => true, 'has_system_orders' => false, 'has_delivery' => false]);
        $store = Store::create(['plan_id' => $plan->id, 'selling_mode' => 'whatsapp', 'name' => 'WA Store', 'whatsapp' => '+123456789']);

        $product = Product::factory()->create(['user_id' => null]);

        $service = app(OrderService::class)->forStore($store);

        $response = $service->place(['product_id' => $product->id, 'product_name' => $product->title ?? $product->name ?? 'p', 'quantity' => 1]);

        $this->assertStringContainsString('wa.me', $response->getTargetUrl());
        $this->assertDatabaseHas('whatsapp_order_logs', ['store_id' => $store->id, 'product_id' => $product->id]);
    }

    public function test_system_strategy_creates_order_and_items()
    {
        $plan = Plan::create(['name' => 'Paid', 'price' => 10, 'has_whatsapp' => true, 'has_system_orders' => true, 'has_delivery' => true]);
        $store = Store::create(['plan_id' => $plan->id, 'selling_mode' => 'system', 'name' => 'System Store']);

        $product = Product::factory()->create(['user_id' => null, 'price' => 50]);

        $payload = [
            'buyer_id' => null,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2, 'price' => 50],
            ],
        ];

        $service = app(OrderService::class)->forStore($store);
        $response = $service->place($payload);

        // Should redirect to payment route
        $this->assertStringContainsString(route('payment.redirect', ['order' => 1]), $response->getTargetUrl());

        $this->assertDatabaseHas('orders', ['store_id' => $store->id, 'total' => 100.00]);
        $this->assertDatabaseHas('order_items', ['product_id' => $product->id, 'quantity' => 2]);
    }
}
