<?php

namespace App\Http\Controllers;

use App\Models\Invoices;
use App\Models\Items;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil semua item, beserta relasi kategori dan creator
        $transactions = \App\Models\Invoices::with('createdBy', 'items.item')
            ->latest()
            ->get();

        // BARANG KELUAR (Transaksi)
        $invoiceItems = \App\Models\InvoiceItems::with('item', 'invoice')->get();
        $barangKeluar = [];

        foreach ($invoiceItems as $item) {
            if (!$item->item || !$item->invoice) continue;

            $qty = $item->qty;
            $satuan = $item->item->satuan ?? '-';

            if ($item->price_type === 'eceran' && $item->item->retail_conversion > 0) {
                $qty = $qty / $item->item->retail_conversion;
            }

            $name = $item->item->item_name;
            $date = \Carbon\Carbon::parse($item->invoice->created_at)->format('Y-m-d');
            $key = $name . '_' . $date;

            if (!isset($barangKeluar[$key])) {
                $barangKeluar[$key] = [
                    'name' => $name,
                    'qty' => 0,
                    'date' => $date,
                    'satuan' => $satuan,
                ];
            }

            $barangKeluar[$key]['qty'] += $qty;
        }

        $barangKeluar = collect($barangKeluar)
            ->map(fn($entry) => [
                'name' => $entry['name'],
                'qty' => round($entry['qty']),
                'date' => $entry['date'],
                'satuan' => $entry['satuan'],
            ])
            ->sortByDesc('qty')
            ->values();

        // BARANG MASUK (Pembelian)
        $pembelians = \App\Models\Pembelian::latest()->get();
        $barangMasuk = [];

        foreach ($pembelians as $pembelian) {
            $name = $pembelian->nama_barang;
            $qty = $pembelian->qty;
            $date = \Carbon\Carbon::parse($pembelian->tanggal_pembelian)->format('Y-m-d');
            $satuan = $pembelian->satuan ?? '-';
            $key = $name . '_' . $date;

            if (!isset($barangMasuk[$key])) {
                $barangMasuk[$key] = [
                    'name' => $name,
                    'qty' => 0,
                    'date' => $date,
                    'satuan' => $satuan,
                ];
            }

            $barangMasuk[$key]['qty'] += $qty;
        }

        $barangMasuk = collect($barangMasuk)
            ->map(fn($entry) => [
                'name' => $entry['name'],
                'qty' => round($entry['qty']),
                'date' => $entry['date'],
                'satuan' => $entry['satuan'],
            ])
            ->sortByDesc('qty')
            ->values();

        return response()->json([
            'message' => 'Daftar transaksi berhasil diambil',
            'transaction' => $transactions,
            'barang_keluar' => $barangKeluar,
            'barang_masuk' => $barangMasuk,
        ], 200);
    }

    public function getTransaction(Request $request)
    {
        // Validasi input rentang waktu
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Ambil parameter rentang waktu
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Ambil transaksi dalam rentang waktu
        $transactions = Invoices::with('createdBy', 'items.item')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        return response()->json([
            'message' => 'Daftar transaksi berhasil diambil',
            'transactions' => $transactions
        ], 200);
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
    /**
     * Remove the specified resource from storage.
     */

    public function destroy(string $id)
    {
        try {
            // Log mulai proses penghapusan
            Log::info("Menghapus invoice dengan ID: $id");

            // Cari invoice berdasarkan ID
            $invoice = Invoices::findOrFail($id);

            // Log detail invoice yang ditemukan
            Log::info("Invoice ditemukan: ", $invoice->toArray());

            // Hapus invoice_items terkait dan kembalikan stok
            foreach ($invoice->items as $invoiceItem) {
                // Cari item terkait
                $item = Items::find($invoiceItem->item_id);

                // Log sebelum mengembalikan stok
                Log::info("Mengembalikan stok item: " . $item->item_name . " sebelum stok: " . $item->stock);

                // Kembalikan stok item
                $item->stock += $invoiceItem->qty;
                $item->save();

                // Log setelah mengembalikan stok
                Log::info("Stok item berhasil dikembalikan: " . $item->item_name . " setelah stok: " . $item->stock);

                // Hapus invoice_item terkait
                $invoiceItem->delete();
                Log::info("Invoice item dengan ID: {$invoiceItem->id} berhasil dihapus");
            }

            // Hapus invoice
            $invoice->delete();
            Log::info("Invoice berhasil dihapus: ID $id");

            return response()->json([
                'message' => 'Invoice berhasil dihapus beserta item terkait',
            ], 200);
        } catch (\Exception $e) {
            // Log jika terjadi error
            Log::error("Gagal menghapus invoice dengan ID $id: " . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }




    public function updateIsPrinted(Request $request, $id)
    {
        // Validasi input (pastikan is_printed adalah boolean)
        $request->validate([
            'is_printed' => 'required|boolean',
        ]);

        // Cari invoice berdasarkan ID
        $invoice = Invoices::findOrFail($id);

        // Update status is_printed
        $invoice->update([
            'is_printed' => $request->input('is_printed'),
        ]);

        return response()->json([
            'message' => 'Status is_printed berhasil diperbarui',
            'invoice' => $invoice,
        ], 200);
    }

}
