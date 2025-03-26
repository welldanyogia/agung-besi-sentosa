<?php

namespace App\Http\Controllers;

use App\Models\InvoiceItems;
use App\Models\Invoices;
use App\Models\Items;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CashierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'user_id' => 'required|exists:users,id',
        ]);

        // Cek apakah ada invoice dengan status 'pending' untuk user ini
        $invoice = Invoices::where('created_by', $request->user_id)
            ->where('status', 'pending')
            ->first();

        // Jika tidak ada invoice pending, buat invoice baru
        if (!$invoice) {
            // Get the current date
            $today = Carbon::today()->format('Ymd');

// Get the latest invoice for today, ordered by the invoice code
            $latestInvoice = Invoices::where('invoice_code', 'LIKE', 'INV-' . $today . '%')
                ->orderBy('invoice_code', 'desc')
                ->first();

// Extract the sequence number from the last invoice code
            $lastSequence = $latestInvoice ? (int) substr($latestInvoice->invoice_code, -5) : 0;

// Increment the sequence number
            $newSequence = str_pad($lastSequence + 1, 5, '0', STR_PAD_LEFT);

// Generate the new invoice code
            $invoiceCode = 'INV-' . $today . '-' . $newSequence;
            $invoice = Invoices::create([
                'invoice_code' => $invoiceCode,
                'customer_name' => 'Pelanggan', // Bisa disesuaikan dengan input customer
                'total_price' => 0, // Akan diperbarui setelah item ditambahkan
                'payment' => null, // Belum ada pembayaran
                'bayar' => 0,
                'kembalian' => 0,
                'status' => 'pending',
                'created_by' => $request->user_id,
            ]);
        }

        $item = Items::findOrFail($request->item_id);

        // Cek apakah stok mencukupi
        if ($item->stock < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => "Stok tidak mencukupi untuk produk: {$item->name}."
            ], 400);
        }

        // Cek apakah item sudah ada di invoice sebelumnya
        $invoiceItem = InvoiceItems::where('invoice_id', $invoice->id)
            ->where('item_id', $item->id)
            ->first();

        if ($invoiceItem) {
            // Jika item sudah ada, tambahkan qty saja
            $invoiceItem->qty += $request->quantity;
            $invoiceItem->sub_total = $invoiceItem->qty * $invoiceItem->price;
            $invoiceItem->save();
        } else {
            // Jika item belum ada, buat baru
            $invoiceItem = InvoiceItems::create([
                'invoice_id' => $invoice->id,
                'item_id' => $item->id,
                'qty' => $request->quantity,
                'price' => $item->price,
                'discount' => 0, // Bisa disesuaikan jika ada diskon
                'sub_total' => $item->price * $request->quantity,
            ]);
        }

        // Kurangi stok barang
        $item->stock -= $request->quantity;
        $item->save();

        // Hitung ulang total harga invoice
        $totalPrice = InvoiceItems::where('invoice_id', $invoice->id)->sum('sub_total');
        $invoice->total_price = $totalPrice;
        $invoice->save();

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
            'quantity' => 'required|integer|min:1',
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

        // Kembalikan stok barang
        Log::info("Menambahkan stok item ID: {$item->id} sebanyak: {$request->quantity}");
        $item->stock += $request->quantity;
        $item->save();

        // Kurangi qty atau hapus item dari invoice
        if ($invoiceItem->qty > $request->quantity) {
            Log::info("Mengurangi qty item dalam invoice ID: {$invoice->id}");
            $invoiceItem->qty -= $request->quantity;
            $invoiceItem->sub_total = $invoiceItem->qty * $invoiceItem->price;
            $invoiceItem->save();
        } else {
            Log::info("Menghapus item dari invoice ID: {$invoice->id} karena qty habis.");
            $invoiceItem->delete();
        }

        // Hitung ulang total harga invoice
        $totalPrice = InvoiceItems::where('invoice_id', $invoice->id)->sum('sub_total');
        Log::info("Total harga invoice ID: {$invoice->id} setelah penghapusan item: {$totalPrice}");

        $invoice->total_price = $totalPrice;
        $invoice->save();

        // Jika invoice kosong, hapus invoice
        if ($totalPrice == 0) {
            Log::info("Menghapus invoice ID: {$invoice->id} karena tidak ada item tersisa.");
            $invoice->delete();
        }

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
            ->with('items.item')
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
                    // Kembalikan stok ke tabel Items
                    $item = Items::where('id', $itemId)->first();
                    if ($item) {
                        $item->stock += $invoiceItem->qty;
                        $item->save();
                    }

                    // Hapus invoice item
                    $invoiceItem->delete();
                }
            }

            DB::commit();

            return response()->json(['message' => 'Invoice items deleted and stock restored successfully'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete invoice items', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request,$id)
    {
        $request->validate([
            'bayar' => 'required|integer',
            'total' => 'required|integer',
//            'item_ids.*' => 'exists:items,id',
        ]);

        $invoice = Invoices::find($id);
        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $invoice->status = 'paid';
        $invoice->payment = 'cash';
        $invoice->total_price = $request->total;
        $invoice->bayar = $request->bayar;
        $invoice->kembalian = $invoice->bayar - $invoice->total_price;
        $invoice->save();

        return response()->json(['message' => 'Invoice updated successfully']);
    }

}
