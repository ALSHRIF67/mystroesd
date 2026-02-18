<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Store;
use App\Models\User;

class StoreFactory extends Factory
{
    protected $model = Store::class;

    public function definition()
    {
        $user = User::factory()->create();
        return [
            'user_id' => $user->id,
            'plan_id' => null,
            'selling_mode' => 'system',
            'name' => $this->faker->company,
            'whatsapp' => '1234567890',
            'system_enabled' => true,
        ];
    }
}
