<?php

namespace App\Services\Orders;

use App\Contracts\OrderStrategy;
use App\Models\Store;

class OrderService
{
    protected OrderStrategy $strategy;

    public function __construct()
    {
        // strategy will be set when executing place()
    }

    public function forStore(Store $store): self
    {
        // pick strategy based on store plan or selling_mode
        if ($store->plan && $store->plan->has_system_orders && $store->selling_mode === 'system') {
            $this->strategy = app(\App\Services\Orders\Strategies\SystemOrderStrategy::class, ['store' => $store]);
        } else {
            $this->strategy = app(\App\Services\Orders\Strategies\WhatsAppOrderStrategy::class, ['store' => $store]);
        }

        return $this;
    }

    public function place(array $payload)
    {
        return $this->strategy->place($payload);
    }
}
