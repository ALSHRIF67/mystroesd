<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\PlansTableSeeder;

class PlansSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_plans_seeder_creates_free_and_paid()
    {
        $this->seed(PlansTableSeeder::class);

        $this->assertDatabaseHas('plans', ['name' => 'Free']);
        $this->assertDatabaseHas('plans', ['name' => 'Paid']);
    }
}
