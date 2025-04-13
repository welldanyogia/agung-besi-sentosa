<?php

use App\Http\Controllers\CashierController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/', function (Request $request) {
    return response()->json([
        'message' => 'API Berfungsi dengan baik',
    ], 200);
});


Route::post('/login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'loginAPI'])->name('login.api');


Route::post('/inventory/store', [InventoryController::class, 'store'])->named('inventory.store'); // Tambah item baru
Route::post('/inventory/show', [InventoryController::class, 'index'])->named('inventory.show'); // Tambah item baru
Route::post('/inventory/update/{id}', [InventoryController::class, 'update'])->named('inventory.update'); // Tambah item baru
Route::post('/items/{id}', [InventoryController::class, 'destroy'])->named('inventory.destroy'); // Tambah item baru
Route::post('/categories/', [\App\Http\Controllers\CategoryController::class, 'index'])->named('categories.index'); // Tambah item baru
Route::post('/satuans/', [\App\Http\Controllers\InventoryController::class, 'getSatuans'])->named('satuans.index'); // Tambah item baru
Route::post('/categories/store', [\App\Http\Controllers\CategoryController::class, 'store'])->named('categories.store'); // Tambah item baru
Route::post('/satuan/store', [\App\Http\Controllers\InventoryController::class, 'storeSatuan'])->named('satuan.store'); // Tambah item baru
Route::post('/cashier/update-stock', [CashierController::class, 'updateStock']);
Route::post('/cashier/restore-stock', [CashierController::class, 'restoreStock']);
Route::post('/cashier/get-pending-inv', [CashierController::class, 'getPendingInvoice']);
Route::post('/cashier/delete-items', [CashierController::class, 'deleteInvoiceItems']);
// routes/api.php (Laravel)
Route::post('/invoices/{id}/update-status', [CashierController::class, 'updateStatus']);
Route::post('/report/show', [\App\Http\Controllers\ReportController::class, 'index'])->named('report.show'); // Tambah item baru
Route::post('/storeinfo', [\App\Http\Controllers\SettingController::class, 'storeOrUpdate']);
Route::get('/storeinfo', [\App\Http\Controllers\SettingController::class, 'getStoreInfo']);
Route::post('/transactions', [\App\Http\Controllers\ReportController::class, 'getTransaction']);
Route::post('/invoices/{id}/update-is-printed', [ReportController::class, 'updateIsPrinted']);
Route::post('/invoices/{id}', [ReportController::class, 'destroy'])->name('invoices.destroy');




Route::middleware('auth:sanctum')->group(function () {
});
