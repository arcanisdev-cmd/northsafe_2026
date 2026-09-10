<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_a_user_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/signup', [
            'firstName' => 'Juan',
            'middleName' => 'Santos',
            'lastName' => 'Dela Cruz',
            'email' => 'juan@example.com',
            'phone' => '09 123 456 789',
            'barangay' => 'Barangay 1',
            'companyWebsite' => '',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'juan@example.com')
            ->assertJsonPath('token_type', 'Bearer');

        $this->assertDatabaseHas('users', [
            'email' => 'juan@example.com',
            'first_name' => 'Juan',
            'api_token_hash' => hash('sha256', $response->json('token')),
        ]);
    }

    public function test_login_returns_a_token_for_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'jane@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'jane@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', 'jane@example.com')
            ->assertJsonStructure(['message', 'token_type', 'token', 'user']);
    }

    public function test_me_and_logout_require_a_bearer_token(): void
    {
        $plainToken = 'plain-test-token';

        $user = User::factory()->create([
            'api_token_hash' => hash('sha256', $plainToken),
        ]);

        $this->withHeader('Authorization', 'Bearer '.$plainToken)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);

        $this->withHeader('Authorization', 'Bearer '.$plainToken)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'api_token_hash' => null,
        ]);
    }
}