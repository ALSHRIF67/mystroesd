<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Store;

class OrderSystemActivationTest extends TestCase
{
    use RefreshDatabase;

    public function test_merchant_can_activate_order_system()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('merchant.orderSystem.activate'))
            ->assertRedirect(route('merchant.orderSystem.dashboard'));

        $this->assertDatabaseHas('stores', [
            'user_id' => $user->id,
            'system_enabled' => 1,
        ]);
    }
}
