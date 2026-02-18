<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Order;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition()
    {
        $store = \App\Models\Store::factory()->create();
        $buyer = \App\Models\User::factory()->create();

        return [
            'store_id' => $store->id,
            'buyer_id' => $buyer->id,
            'total' => $this->faker->randomFloat(2, 10, 500),
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ];
    }
}
