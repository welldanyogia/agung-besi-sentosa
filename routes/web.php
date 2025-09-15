<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('cashier'); // Redirect ke cashier jika sudah login
    }

    return redirect()->route('login'); // Redirect ke login jika belum login
});

//Route::get('/', function () {
////    return Inertia::render('Auth/Login', [
////        'canLogin' => Route::has('login'),
////        'canRegister' => Route::has('register'),
////        'laravelVersion' => Application::VERSION,
////        'phpVersion' => PHP_VERSION,
////    ]);
//    return redirect("/login");
//});

//Route::get('/dashboard', function () {
//    return Inertia::render('Dashboard');
//})->middleware(['auth', 'verified'])->name('dashboard');


//Route::get('/inventory', function () {
//    return Inertia::render('Inventory/Dashboard');
//})->middleware(['auth', 'verified'])->name('inventory');
//Route::get('/report', function () {
//    return Inertia::render('Report/Dashboard');
//})->middleware(['auth', 'verified'])->name('report');
//Route::get('/setting', function () {
//    return Inertia::render('Setting/Dashboard');
//})->middleware(['auth', 'verified'])->name('setting');

Route::middleware('auth')->group(function () {
    Route::middleware(['role:admin|superadmin'])->group(function () {
        Route::get('/report', function () {
            return Inertia::render('Report/Dashboard');
        })->name('report');
    });
});
Route::middleware('auth')->group(function () {
    Route::middleware(['role:superadmin'])->group(function () {
        Route::get('/dashboard',[\App\Http\Controllers\DashboardController::class,'index'])->name('dashboard');
    });
});



Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::delete('/user/{id}', [\App\Http\Controllers\SettingController::class, 'destroy'])->name('user.destroy');
    Route::get('/cashier',[\App\Http\Controllers\CashierController::class,'index'])->name('cashier');
    Route::get('/inventory',[\App\Http\Controllers\InventoryController::class,'index'])->name('inventory');
    Route::post('/users', [\App\Http\Controllers\SettingController::class, 'store']);
    Route::get('/setting', [\App\Http\Controllers\SettingController::class, 'index'])->name('setting');
});


require __DIR__.'/auth.php';
