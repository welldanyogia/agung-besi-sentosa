<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil semua item, beserta relasi kategori dan creator
        $items = \App\Models\Items::with('category', 'createdBy')->get();

        return response()->json([
            'message' => 'Daftar item berhasil diambil',
            'items' => $items
        ], 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'item_name'   => 'required|string|unique:items,item_name',
            'item_code'   => 'required|string|unique:items,item_code',
            'stock'       => 'nullable|numeric|min:0',
            'price'       => 'required|numeric|min:0',
            'satuan'      => 'required|in:Kg,Meter,Batang',
            'category_name' => 'required|string',
            'created_by'   => 'required|string',
            'is_tax' => 'required|boolean',
//            'tax' => 'decimal:8,2',
        ]);

        try {
            // Cek apakah kategori sudah ada berdasarkan nama, jika tidak ada maka buat kategori baru
            $category = \App\Models\Categories::firstOrCreate(
                ['category_name' => $request->category_name],
                ['id' => \Illuminate\Support\Str::uuid()]  // Membuat ID jika kategori baru
            );

            // Debugging: Log kategori yang ditemukan atau dibuat
            Log::info('Category:', $category ? $category->toArray() : 'Kategori gagal dibuat atau ditemukan');

            // Pastikan kategori ada sebelum digunakan
            if (!$category || !$category->id) {
                Log::error('Kategori gagal dibuat atau ditemukan.');
                return response()->json([
                    'message' => 'Gagal menambah kategori.',
                ], 500);
            }

            // Jika kategori sudah ada, gunakan ID kategori yang ada
            // Jika kategori baru, ID sudah dibuat oleh firstOrCreate()
            $categoryId = $category->id;

            // Simpan item baru
            $item = \App\Models\Items::create([
                'id'          => \Illuminate\Support\Str::uuid(),
                'item_name'   => $request->item_name,
                'item_code'   => $request->item_code,
                'stock'       => $request->stock ?? 0,
                'price'       => $request->price,
                'satuan'      => $request->satuan,
                'category_id' => $categoryId, // Pakai ID kategori yang ditemukan atau dibuat
                'created_by'  => $request->created_by,
                'is_tax'      => $request->is_tax ?? 0,
                'tax'         => request()->is_tax ?? 0,
            ]);

            // Debugging: Log item yang berhasil disimpan
            Log::info('Item berhasil ditambahkan:', $item->toArray());

            // Kembalikan response JSON
            return response()->json([
                'message' => 'Item berhasil ditambahkan',
                'item'    => $item,
                'category' => $category,
            ], 201);
        } catch (\Exception $e) {
            // Tangani exception dan log error
            Log::error('Terjadi kesalahan saat menambah item: ' . $e->getMessage(), [
                'error' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat menambah item.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }




    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Cari item berdasarkan ID
        $item = \App\Models\Items::with('category', 'creator')->find($id);

        // Jika item tidak ditemukan, kirim response 404
        if (!$item) {
            return response()->json([
                'message' => 'Item tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail item ditemukan',
            'item' => $item
        ], 200);
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
}
