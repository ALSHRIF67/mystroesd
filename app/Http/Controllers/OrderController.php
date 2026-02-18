<?php

namespace App\Http\Controllers;

use App\Services\Orders\OrderService;
use App\Models\Store;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected OrderService $service;

    public function __construct(OrderService $service)
    {
        $this->service = $service;
    }

    // Place an order for a specific store
    public function place(Request $request, Store $store)
    {
        $payload = $request->validate([
            'buyer_id' => 'nullable|integer',
            'product_id' => 'nullable|integer',
            'product_name' => 'nullable|string',
            'quantity' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:1000',
            // For system orders
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|integer',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.price' => 'required_with:items|numeric|min:0',
        ]);

        return $this->service->forStore($store)->place($payload);
    }
}
