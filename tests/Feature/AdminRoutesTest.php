<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;

class AdminRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_can_access_admin_products()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/admin/products')
            ->assertStatus(200);
    }

    public function test_capitalized_admin_path_redirects_to_admin_lowercase()
    {
        $resp = $this->get('/Admin/Products/Index.jsx');
        $resp->assertRedirect('/admin/products');
    }
}
