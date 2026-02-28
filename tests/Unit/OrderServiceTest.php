<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Store;
use App\Models\Plan;
use App\Services\Orders\OrderService;
use App\Services\Orders\Strategies\WhatsAppOrderStrategy;
use App\Services\Orders\Strategies\SystemOrderStrategy;

class OrderServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_for_store_uses_whatsapp_strategy_by_default()
    {
        $store = Store::factory()->create();
        $service = new OrderService();

        $returned = $service->forStore($store);
        $this->assertInstanceOf(WhatsAppOrderStrategy::class, $this->getProtectedProperty($returned, 'strategy'));
    }

    public function test_for_store_uses_system_strategy_when_plan_supports_system_orders()
    {
        $plan = Plan::create(['name'=>'test','price'=>0,'has_system_orders' => true, 'has_whatsapp'=>false,'has_delivery'=>false]);
        $store = Store::factory()->create(['plan_id' => $plan->id, 'selling_mode' => 'system']);

        $service = new OrderService();
        $returned = $service->forStore($store);
        $this->assertInstanceOf(SystemOrderStrategy::class, $this->getProtectedProperty($returned, 'strategy'));
    }

    // helper to read protected/private property via reflection
    protected function getProtectedProperty($object, string $property)
    {
        $ref = new \ReflectionClass($object);
        $prop = $ref->getProperty($property);
        $prop->setAccessible(true);
        return $prop->getValue($object);
    }
}
