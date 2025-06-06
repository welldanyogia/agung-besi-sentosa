<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/cashier', function () {
    return Inertia::render('Cashier/Dashboard');
})->middleware(['auth', 'verified'])->name('cashier');
Route::get('/inventory', function () {
    return Inertia::render('Inventory/Dashboard');
})->middleware(['auth', 'verified'])->name('inventory');
//Route::get('/report', function () {
//    return Inertia::render('Report/Dashboard');
//})->middleware(['auth', 'verified'])->name('report');
//Route::get('/setting', function () {
//    return Inertia::render('Setting/Dashboard');
//})->middleware(['auth', 'verified'])->name('setting');

Route::middleware('auth')->group(function () {
    Route::middleware(['role:admin|superadmin'])->group(function () {
        Route::post('/users', [\App\Http\Controllers\SettingController::class, 'store']);
        Route::get('/report', function () {
            return Inertia::render('Report/Dashboard');
        })->name('report');
        Route::get('/setting', [\App\Http\Controllers\SettingController::class, 'index'])->name('setting');

    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
