<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request with API.
     */
    public function loginAPI(LoginRequest $request)
    {
        // Validasi dan autentikasi pengguna
        $credentials = $request->only('username', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // Jika pengguna memiliki role, log sesuai role
            if ($user->hasRole('superadmin')) {
                Log::info('User is superadmin.', ['id' => $user->id, 'email' => $user->email]);
            } elseif ($user->hasRole('admin')) {
                Log::info('User is admin.', ['id' => $user->id, 'email' => $user->email]);
            } else {
                Log::info('User has no specific role.', ['id' => $user->id, 'email' => $user->email]);
            }

            // Membuat token autentikasi
            $token = $user->createToken('YourAppName')->plainTextToken;

            // Mengembalikan response dengan token
            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ], 200);
        }

        // Jika kredensial tidak valid
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();
//        Log::info('Authenticated user:', ['id' => $user->id, 'email' => $user->email]);

        if ($user->hasRole('superadmin')) {
            Log::info('User is admin.');
            return redirect()->intended(route('report', absolute: false));
        } elseif ($user->hasRole('admin')) {
            Log::info('User is customer.');
            return redirect()->intended(route('report', absolute: false));
        } else {
            Log::info('User has no specific role, redirecting to default.');
            return redirect()->intended(route('cashier', absolute: false));
        }

//        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
