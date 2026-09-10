<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticateApiToken
{
    public function handle(Request $request, Closure $next): mixed
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $user = User::where('api_token_hash', hash('sha256', $token))->first();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}