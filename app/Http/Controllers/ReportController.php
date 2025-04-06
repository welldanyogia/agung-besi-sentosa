<?php

namespace App\Http\Controllers;

use App\Models\Invoices;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil semua item, beserta relasi kategori dan creator
//        $transactions = \App\Models\Invoices::with('createdBy', 'items')->get();
        $transactions = \App\Models\Invoices::with('createdBy', 'items.item')
            ->latest()
            ->get();


        return response()->json([
            'message' => 'Daftar transaksi berhasil diambil',
            'transaction' => $transactions
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
    public function destroy(string $id)
    {
        //
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
