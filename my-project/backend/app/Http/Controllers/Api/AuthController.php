<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function profileImage(string $path)
    {
        if ($path === '' || str_contains($path, '..')) {
            abort(404);
        }

        $disk = Storage::disk('public');

        if (! $disk->exists($path) || ! Str::startsWith($path, 'profile-images/')) {
            abort(404);
        }

        return response()->file($disk->path($path));
    }

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
            'password_hash' => Hash::make($payload['password']),
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

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password_hash ?? $user->password)) {
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

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $phone = $this->normalizePhone($request->input('phone'));
        $validator = Validator::make(array_merge($request->all(), [
            'phone' => $phone,
        ]), [
            'firstName' => ['required', 'string', 'max:100'],
            'middleName' => ['required', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['required', 'regex:/^9\d{9}$/'],
            'barangay' => ['required', 'string', 'max:255'],
            'houseNumber' => ['required', 'string', 'max:100'],
            'street' => ['required', 'string', 'max:255'],
            'zipCode' => ['required', 'string', 'max:20'],
            'profilePicture' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $profilePicture = $user->profile_picture;

        if ($request->hasFile('profilePicture')) {
            $profilePicture = '/storage/'. $request->file('profilePicture')->store('profile-images', 'public');
        }

        $user->forceFill([
            'first_name' => $data['firstName'],
            'middle_name' => $data['middleName'],
            'last_name' => $data['lastName'],
            'name' => trim($data['firstName'].' '.$data['middleName'].' '.$data['lastName']),
            'email' => Str::lower($data['email']),
            'phone' => $phone,
            'barangay' => $data['barangay'],
            'house_number' => $data['houseNumber'],
            'street' => $data['street'],
            'zip_code' => $data['zipCode'],
            'profile_picture' => $profilePicture,
        ])->save();

        return response()->json(['user' => $this->profile($user->fresh())]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'currentPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        if (! Hash::check($request->string('currentPassword')->toString(), $user->password_hash ?? $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->forceFill([
            'password' => $request->string('newPassword')->toString(),
            'password_hash' => Hash::make($request->string('newPassword')->toString()),
        ])->save();

        return response()->json(['message' => 'Password changed successfully.']);
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
            'role' => $user->role ?? 'user',
            'firstName' => $user->first_name,
            'middleName' => $user->middle_name,
            'lastName' => $user->last_name,
            'fullName' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'barangay' => $user->barangay,
            'houseNumber' => $user->house_number,
            'street' => $user->street,
            'zipCode' => $user->zip_code,
            'profilePicture' => $this->presentProfilePicture($user->profile_picture),
            'companyWebsite' => $user->company_website,
            'rewardPoints' => (int) ($user->reward_points ?? 0),
            'prepaidLoad' => 0,
            'createdAt' => $user->created_at?->toISOString(),
        ];
    }

    private function presentProfilePicture(?string $picture): ?string
    {
        if (! $picture) {
            return null;
        }

        $path = parse_url($picture, PHP_URL_PATH) ?: $picture;

        if (! Str::startsWith($path, '/storage/')) {
            return $picture;
        }

        return request()->getSchemeAndHttpHost().'/api/profile-images/'.ltrim(
            Str::after($path, '/storage/'),
            '/'
        );
    }
}