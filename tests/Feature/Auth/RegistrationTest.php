<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '912345678',
            'country_code' => '+249',
            'terms_accepted' => true,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'first_name' => 'Test',
            'phone' => '912345678',
        ]);
    }

    public function test_duplicate_phone_fails(): void
    {
        User::factory()->create(['phone' => '900000001']);

        $response = $this->post('/register', [
            'first_name' => 'Dup',
            'last_name' => 'Phone',
            'email' => 'dupphone@example.com',
            'phone' => '900000001',
            'country_code' => '+249',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_accepted' => 'on',
        ]);

        $response->assertSessionHasErrors('phone');
    }
}
