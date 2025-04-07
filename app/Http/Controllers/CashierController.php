<?php

namespace App\Http\Controllers;

use App\Models\InvoiceItems;
use App\Models\Invoices;
use App\Models\Items;
use App\Models\StoreInfo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CashierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $storeInfo = StoreInfo::first();
        $userId = Auth::id();
        $kategoris = \App\Models\Categories::all();

        Log::info($userId);
        $items = \App\Models\Items::with('category', 'createdBy')
            ->whereNotNull('retail_price')
            ->orWhereNotNull('wholesale_price')
            ->get();


        $invoice = Invoices::where('created_by', $userId)
            ->where('status', 'pending')
            ->latest()
            ->with('items.item','createdBy')
            ->first(); // Ambil invoice terakhir yang masih pending

        return Inertia::render('Cashier/Dashboard', [
            'storeInfo' => $storeInfo,
            'invoice' => $invoice,
            'items' => $items,
            'kategoris' => $kategoris,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Mengurangi stok barang saat ditambahkan ke transaksi.
     */

    public function updateStock(Request $request)
    {
        // Debugging - Log the incoming request
        Log::debug('Incoming Request:', $request->all());

        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|numeric',
            'user_id' => 'required|exists:users,id',
            'price_type' => 'required|in:retail,grosir,eceran', // Validasi price_type
        ]);

        // Cek apakah ada invoice dengan status 'pending' untuk user ini
        $invoice = Invoices::where('created_by', $request->user_id)
            ->where('status', 'pending')
            ->first();

        // Debugging - Log invoice retrieval status
        Log::debug('Invoice check for user:', ['user_id' => $request->user_id, 'invoice' => $invoice]);

        if (!$invoice) {
            $today = Carbon::today()->format('Ymd');
            $latestInvoice = Invoices::where('invoice_code', 'LIKE', 'INV-' . $today . '%')
                ->orderBy('invoice_code', 'desc')
                ->first();

            $lastSequence = $latestInvoice ? (int)substr($latestInvoice->invoice_code, -5) : 0;
            $newSequence = str_pad($lastSequence + 1, 5, '0', STR_PAD_LEFT);

            $invoiceCode = 'INV-' . $today . '-' . $newSequence;

            $invoice = Invoices::create([
                'invoice_code' => $invoiceCode,
                'customer_name' => 'Pelanggan',
                'total_price' => 0,
                'payment' => null,
                'bayar' => 0,
                'kembalian' => 0,
                'status' => 'pending',
                'created_by' => $request->user_id,
            ]);

            // Debugging - Log the creation of a new invoice
            Log::debug('New Invoice Created:', ['invoice_code' => $invoiceCode, 'user_id' => $request->user_id]);
        }

        $item = Items::findOrFail($request->item_id);

        // Debugging - Log the item information
        Log::debug('Item found:', ['item_id' => $item->id, 'item_name' => $item->name]);

        // Tentukan harga berdasarkan price_type
        switch ($request->price_type) {
            case 'eceran':
                $price = $item->eceran_price;
                $quantityReduction = $request->quantity / ($item->retail_conversion ?: 1);
                break;
            case 'grosir':
                $price = $item->wholesale_price;
                $quantityReduction = $request->quantity;
                break;
            case 'retaill':
                $price = $item->retail_price;
                $quantityReduction = $request->quantity;
                break;
            default:
                $price = $item->price;
                $quantityReduction = $request->quantity;
                break;
        }

        // Debugging - Log price determination
        Log::debug('Price Determination:', ['price_type' => $request->price_type, 'price' => $price, 'quantity_reduction' => $quantityReduction]);

        // Cek apakah stok mencukupi setelah perhitungan konversi
        if ($item->stock < $quantityReduction) {
            return response()->json([
                'success' => false,
                'message' => "Stok tidak mencukupi untuk produk: {$item->name}."
            ], 400);
        }

        // Cek apakah item sudah ada di invoice sebelumnya
        $invoiceItem = InvoiceItems::where('invoice_id', $invoice->id)
            ->where('item_id', $item->id)
            ->first();

        // Debugging - Log existing invoice item check
        Log::debug('Invoice Item Check:', ['invoice_id' => $invoice->id, 'item_id' => $item->id, 'invoice_item' => $invoiceItem]);

        if ($invoiceItem) {
            // Jika item sudah ada, tetapi price_type berbeda, tambahkan item baru
            if ($invoiceItem->price_type !== $request->price_type) {
                // Tambahkan item baru dengan harga yang baru
                InvoiceItems::create([
                    'invoice_id' => $invoice->id,
                    'item_id' => $item->id,
                    'qty' => $request->quantity,
                    'price' => $price,
                    'discount' => 0,
                    'sub_total' => $price * $request->quantity,
                    'price_type' => $request->price_type,
                ]);
                Log::debug('New item added due to price_type mismatch');
            } else {
                // Jika price_type sama, tambahkan qty saja
                $invoiceItem->qty += $request->quantity;
                $invoiceItem->sub_total = $invoiceItem->qty * $price;
                $invoiceItem->price_type = $request->price_type;
                $invoiceItem->save();
                Log::debug('Updated existing invoice item with new quantity');
            }
        } else {
            // Jika item belum ada, buat baru
            InvoiceItems::create([
                'invoice_id' => $invoice->id,
                'item_id' => $item->id,
                'qty' => $request->quantity,
                'price' => $price,
                'discount' => 0,
                'sub_total' => $price * $request->quantity,
                'price_type' => $request->price_type,
            ]);
            Log::debug('New item created in invoice');
        }

        // Kurangi stok barang sesuai dengan jenis harga yang dipilih
        $item->stock -= $quantityReduction;
        $item->save();

        // Debugging - Log stock reduction
        Log::debug('Stock reduced:', ['item_id' => $item->id, 'new_stock' => $item->stock,'quantity_reduction' => $quantityReduction]);

        // Hitung ulang total harga invoice
        $totalPrice = InvoiceItems::where('invoice_id', $invoice->id)->sum('sub_total');
        $invoice->total_price = $totalPrice;
        $invoice->save();

        // Debugging - Log total price update
        Log::debug('Total price updated for invoice:', ['invoice_id' => $invoice->id, 'total_price' => $totalPrice]);

        return response()->json([
            'success' => true,
            'message' => 'Stok berhasil diperbarui dan item ditambahkan ke invoice.',
            'invoice_id' => $invoice->id,
            'remaining_stock' => $item->stock
        ]);
    }




    /**
     * Menambahkan stok kembali apabila transaksi dibatalkan.
     */


    public function restoreStock(Request $request)
    {
        Log::info('restoreStock request:', $request->all());

        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'item_id' => 'required|exists:invoice_items,item_id',
            'quantity' => 'required|numeric',
            'user_id' => 'required|exists:users,id',
        ]);

        Log::info("Mencari invoice dengan ID: {$request->invoice_id} dan user: {$request->user_id}");
        $invoice = Invoices::where('id', $request->invoice_id)
            ->where('created_by', $request->user_id)
            ->where('status', 'pending')
            ->first();

        if (!$invoice) {
            Log::warning("Invoice tidak ditemukan atau tidak bisa diubah untuk user: {$request->user_id}");
            return response()->json([
                'success' => false,
                'message' => 'Invoice tidak ditemukan atau tidak dapat diubah.'
            ], 400);
        }

        Log::info("Mencari item di invoice_items dengan ID: {$request->item_id}");
        $invoiceItem = InvoiceItems::where('invoice_id', $invoice->id)
            ->where('item_id', $request->item_id)
            ->first();

        if (!$invoiceItem) {
            Log::warning("Item tidak ditemukan dalam invoice ID: {$invoice->id}");
            return response()->json([
                'success' => false,
                'message' => 'Item tidak ditemukan di dalam invoice.'
            ], 400);
        }

        Log::info("Mencari item di tabel items dengan ID: {$invoiceItem->item_id}");
        $item = Items::find($invoiceItem->item_id);

        if (!$item) {
            Log::error("Item dengan ID: {$invoiceItem->item_id} tidak ditemukan di tabel items.");
            return response()->json([
                'success' => false,
                'message' => 'Item tidak ditemukan dalam sistem.'
            ], 400);
        }

        // Hitung jumlah stok yang harus dikembalikan
        $restoreQuantity = $request->quantity;
        if ($invoiceItem->price_type === 'eceran' && $item->retail_conversion > 0) {
            $restoreQuantity = $request->quantity/$item->retail_conversion;
        }

        // Kembalikan stok barang
        Log::info("Menambahkan stok item ID: {$item->id} sebanyak: {$restoreQuantity}, {$item->item_name}, {$item->retail_conversion}, {$invoiceItem->price_type}");
        $item->stock += $restoreQuantity;
        $item->save();

        // Kurangi qty atau hapus item dari invoice
        if ($invoiceItem->qty > $request->quantity) {
            Log::info($invoiceItem);
            Log::info("Mengurangi qty {$request->quantity} item dalam invoice ID: {$invoice->id}");
            $invoiceItem->qty -= $request->quantity;
            Log::info("invoiceItem->qty : {$invoiceItem->qty}");
            $invoiceItem->sub_total = $invoiceItem->qty * $invoiceItem->price;
            Log::info("invoiceItem->sub_total : {$invoiceItem->sub_total}");
            Log::info("invoiceItem->price : {$invoiceItem->price}");

            $invoiceItem->save();
        }
//        else {
//            Log::info("Menghapus item dari invoice ID: {$invoice->id} karena qty habis.");
//            $invoiceItem->delete();
//        }

        // Hitung ulang total harga invoice
        $totalPrice = InvoiceItems::where('invoice_id', $invoice->id)->sum('sub_total');
        Log::info("Total harga invoice ID: {$invoice->id} setelah penghapusan item: {$totalPrice}");

        $invoice->total_price = $totalPrice;
        $invoice->save();

        // Jika invoice kosong, hapus invoice
//        if ($totalPrice == 0) {
//            Log::info("Menghapus invoice ID: {$invoice->id} karena tidak ada item tersisa.");
//            $invoice->delete();
//        }

        return response()->json([
            'success' => true,
            'message' => 'Stok dikembalikan dan item dihapus dari invoice.',
            'remaining_stock' => $item->stock,
            'invoice_total' => $totalPrice
        ]);
    }



    public function getPendingInvoice(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $invoice = Invoices::where('created_by', $request->user_id)
            ->where('status', 'pending')
            ->latest()
            ->with('items.item','createdBy')
            ->first(); // Ambil invoice terakhir yang masih pending

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada invoice pending untuk user ini.'
            ], 200);
        }

        return response()->json([
            'success' => true,
            'invoice' => $invoice
        ]);
    }

    public function deleteInvoiceItems(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'item_ids' => 'required|array',
            'item_ids.*' => 'exists:items,id',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->item_ids as $itemId) {
                // Ambil invoice item berdasarkan invoice_id dan item_id
                $invoiceItem = InvoiceItems::where('invoice_id', $request->invoice_id)
                    ->where('item_id', $itemId)
                    ->first();

                if ($invoiceItem) {
                    // Ambil item dari tabel Items
                    $item = Items::where('id', $itemId)->first();

                    if ($item) {
                        // Hitung jumlah stok yang dikembalikan
                        $restoreQuantity = $invoiceItem->qty;
                        if ($invoiceItem->price_type === 'eceran' && $item->retail_conversion > 0) {
                            $restoreQuantity = $invoiceItem->qty/$item->retail_conversion;
                        }

                        // Kembalikan stok
                        $item->stock += $restoreQuantity;
                        $item->save();
                    }

                    // Hapus invoice item
                    $invoiceItem->delete();
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Invoice items deleted and stock restored successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete invoice items',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'bayar' => 'required|integer',
            'payment' => 'required|string',
            'customer_name' => 'required|string',
            'is_printed' => 'required|boolean',
            'total' => 'required|integer',
//            'item_ids.*' => 'exists:items,id',
        ]);

        $invoice = Invoices::find($id);
        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $invoice->status = 'paid';
        $invoice->payment = $request->payment;
        $invoice->customer_name = $request->customer_name;
        $invoice->total_price = $request->total;
        $invoice->is_printed = $request->is_printed;
        $invoice->bayar = $request->bayar;
        $invoice->kembalian = $invoice->bayar - $invoice->total_price;
        $invoice->save();

        return response()->json(['message' => 'Invoice updated successfully']);
    }

}
