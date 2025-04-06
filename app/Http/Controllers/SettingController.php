<?php

namespace App\Http\Controllers;

use App\Models\StoreInfo;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class SettingController extends Controller
{
    public function index()
    {
        // Ambil data pengguna beserta role mereka dan hitung jumlah invoice mereka
        $users = User::withCount('invoices')->with('roles')->get(); // Ambil semua user beserta relasi role dan hitung jumlah invoices mereka

        // Jika pengguna yang login adalah Superadmin, ambil semua pengguna
        // Jika pengguna yang login adalah Admin, ambil pengguna yang role-nya 'employee'
        if (auth()->check() && auth()->user()->hasRole('superadmin')) {
            $users = User::withCount('invoices')->with('roles')->get();
        } elseif (auth()->check() && auth()->user()->hasRole('admin')) {
            $users = User::withCount('invoices')->with('roles')->whereHas('roles', function ($query) {
                $query->where('name', 'employee');
            })->get();
        } else {
            $users = collect(); // atau redirect, atau tampilkan error
        }


        $storeInfo = StoreInfo::first();

        // Kirim data ke view Inertia
        return Inertia::render('Setting/Dashboard', [
            'users' => $users, // Kirim data users beserta jumlah invoice mereka ke frontend
            'storeInfo' => $storeInfo,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        // Validate the incoming request
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:'.User::class,
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', Rules\Password::defaults()],
            'role' => 'required|in:superadmin,admin,employee', // Validate the role
            'phone_number' => 'required|string|max:15', // Validate phone number
        ]);

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone_number' => $request->phone_number, // Store phone number
        ]);

        // Assign the role to the user
        $user->assignRole($request->role);

        // Fire an event for user registration
        event(new Registered($user));

//        // Log the user in
//        Auth::login($user);

        // Return JSON response with success message and user data
        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201); // HTTP 201 for resource creation
    }

    public function storeOrUpdate(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'store_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone_number' => 'required|string|max:15',
        ]);

        // Check if store info already exists, if so, update it; otherwise, create a new one
        $storeInfo = StoreInfo::firstOrNew(['id' => 1]); // assuming there is only one store
        $storeInfo->store_name = $validatedData['store_name'];
        $storeInfo->address = $validatedData['address'];
        $storeInfo->phone_number = $validatedData['phone_number'];
        $storeInfo->save();

        return response()->json([
            'message' => 'Store information has been successfully saved/updated.',
            'data' => $storeInfo
        ]);
    }

    public function getStoreInfo()
    {
        // Retrieve the store info, if exists
        $storeInfo = StoreInfo::first();

        // If store info is found, return it; otherwise, return a not found message
        if ($storeInfo) {
            return response()->json([
                'message' => 'Store information retrieved successfully.',
                'data' => $storeInfo
            ]);
        }

        return response()->json([
            'message' => 'No store information found.',
            'data' => null
        ], 404);
    }
}
