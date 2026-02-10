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
            'first_name' => 'Test Store',
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
            'name' => 'Test Store',
            'phone' => '912345678',
        ]);
    }

    public function test_duplicate_phone_fails(): void
    {
        User::factory()->create(['phone' => '900000001']);

        $response = $this->post('/register', [
            'first_name' => 'Dup',
            'email' => 'dupphone@example.com',
            'phone' => '900000001',
            'country_code' => '+249',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_accepted' => 'on',
        ]);

        $response->assertSessionHasErrors('phone');
    }

    public function test_registration_fails_when_email_exists(): void
    {
        User::factory()->create(['email' => 'exists@example.com']);

        $response = $this->post('/register', [
            'first_name' => 'Exists',
            'email' => 'exists@example.com',
            'phone' => '923456789',
            'country_code' => '+249',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_accepted' => true,
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_registration_fails_when_password_too_short(): void
    {
        $response = $this->post('/register', [
            'first_name' => 'Shortpw',
            'email' => 'shortpw@example.com',
            'phone' => '933333333',
            'country_code' => '+249',
            'password' => '123',
            'password_confirmation' => '123',
            'terms_accepted' => true,
        ]);

        $response->assertSessionHasErrors('password');
    }

    public function test_registration_fails_when_terms_not_accepted(): void
    {
        $response = $this->post('/register', [
            'first_name' => 'Noterms',
            'email' => 'noterms@example.com',
            'phone' => '944444444',
            'country_code' => '+249',
            'password' => 'password',
            'password_confirmation' => 'password',
            // terms_accepted omitted or false
        ]);

        $response->assertSessionHasErrors('terms_accepted');
    }

    public function test_registration_fails_with_invalid_phone(): void
    {
        $response = $this->post('/register', [
            'first_name' => 'Badphone',
            'email' => 'badphone@example.com',
            'phone' => 'invalid-phone',
            'country_code' => '+249',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_accepted' => true,
        ]);

        $response->assertSessionHasErrors('phone');
    }
}
