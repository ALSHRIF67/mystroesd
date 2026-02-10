<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        $admin = User::factory()->create([ 'name' => 'Admin User', 'email' => 'admin@example.com', 'role' => 'admin' ]);
        $seller = User::factory()->create([ 'name' => 'Seller One', 'email' => 'seller@example.com', 'role' => 'seller' ]);

        Product::factory()->count(3)->create([
            'user_id' => $seller->id,
            'status' => Product::STATUS_PENDING,
        ]);
    }
}
