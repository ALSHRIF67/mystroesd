<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlansTableSeeder extends Seeder
{
    public function run()
    {
        Plan::updateOrCreate([
            'name' => 'Free'
        ], [
            'price' => 0,
            'has_whatsapp' => true,
            'has_system_orders' => false,
            'has_delivery' => false,
        ]);

        Plan::updateOrCreate([
            'name' => 'Paid'
        ], [
            'price' => 29.99,
            'has_whatsapp' => true,
            'has_system_orders' => true,
            'has_delivery' => true,
        ]);
    }
}
