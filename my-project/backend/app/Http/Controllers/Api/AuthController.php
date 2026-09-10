<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $payload = $this->validatedPayload($request);

        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $user = User::create([
            'first_name' => $payload['firstName'],
            'middle_name' => $payload['middleName'],
            'last_name' => $payload['lastName'],
            'name' => trim($payload['firstName'].' '.$payload['middleName'].' '.$payload['lastName']),
            'email' => $payload['email'],
            'phone' => $payload['phone'],
            'barangay' => $payload['barangay'],
            'company_website' => $payload['companyWebsite'] ?? null,
            'password' => $payload['password'],
        ]);

        $token = $this->issueToken($user);

        return response()->json([
            'message' => 'Account created successfully.',
            'token_type' => 'Bearer',
            'token' => $token,
            'user' => $this->profile($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = Str::of($request->string('email'))->trim()->lower()->toString();
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 422);
        }

        $token = $this->issueToken($user);

        return response()->json([
            'message' => 'Signed in successfully.',
            'token_type' => 'Bearer',
            'token' => $token,
            'user' => $this->profile($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->profile($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $user?->forceFill([
            'api_token_hash' => null,
        ])->save();

        return response()->json([
            'message' => 'Signed out successfully.',
        ]);
    }

    private function validatedPayload(Request $request): array|JsonResponse
    {
        $phone = $this->normalizePhone($request->input('phone'));

        $validator = Validator::make([
            'firstName' => $request->input('firstName'),
            'middleName' => $request->input('middleName'),
            'lastName' => $request->input('lastName'),
            'email' => Str::of($request->input('email'))->trim()->lower()->toString(),
            'phone' => $phone,
            'barangay' => $request->input('barangay'),
            'companyWebsite' => $request->input('companyWebsite'),
            'password' => $request->input('password'),
            'password_confirmation' => $request->input('password_confirmation'),
        ], [
            'firstName' => ['required', 'string', 'max:100'],
            'middleName' => ['required', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'regex:/^9\d{9}$/'],
            'barangay' => ['required', 'string', 'max:255'],
            'companyWebsite' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        return $validator->validated();
    }

    private function normalizePhone(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone) ?? '';

        if (Str::startsWith($digits, '63')) {
            $digits = Str::substr($digits, 2);
        }

        if (Str::startsWith($digits, '0')) {
            $digits = Str::substr($digits, 1);
        }

        return Str::limit($digits, 10, '');
    }

    private function issueToken(User $user): string
    {
        $plainToken = Str::random(64);

        $user->forceFill([
            'api_token_hash' => hash('sha256', $plainToken),
        ])->save();

        return $plainToken;
    }

    private function profile(?User $user): ?array
    {
        if ($user === null) {
            return null;
        }

        return [
            'id' => $user->id,
            'firstName' => $user->first_name,
            'middleName' => $user->middle_name,
            'lastName' => $user->last_name,
            'fullName' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'barangay' => $user->barangay,
            'companyWebsite' => $user->company_website,
            'createdAt' => $user->created_at?->toISOString(),
        ];
    }
}