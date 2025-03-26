<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kategoris = \App\Models\Categories::all();

        return response()->json([
            'message' => 'Daftar kategori berhasil diambil',
            'categories' => $kategoris,
            'length' => count($kategoris),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_name'   => 'required|string|unique:categories,category_name',
        ]);
        try {
            // Cek apakah kategori sudah ada berdasarkan nama, jika tidak ada maka buat kategori baru
            $category = \App\Models\Categories::firstOrCreate(
                ['category_name' => $request->category_name],
                ['id' => \Illuminate\Support\Str::uuid()]  // Membuat ID jika kategori baru
            );

            // Debugging: Log kategori yang dkategoriukan atau dibuat
            Log::info('Category:', $category ? $category->toArray() : 'Kategori gagal dibuat atau dkategoriukan');

            // Pastikan kategori ada sebelum digunakan
            if (!$category || !$category->id) {
                Log::error('Kategori gagal dibuat atau dkategoriukan.');
                return response()->json([
                    'message' => 'Gagal menambah kategori.',
                ], 500);
            }

            // Jika kategori sudah ada, gunakan ID kategori yang ada
            // Jika kategori baru, ID sudah dibuat oleh firstOrCreate()
//            $categoryId = $category->id;
//
//            // Simpan kategori baru
//            $kategori = \App\Models\kategoris::create([
//                'id'          => \Illuminate\Support\Str::uuid(),
//                'kategori_name'   => $request->kategori_name,
//                'kategori_code'   => $request->kategori_code,
//                'stock'       => $request->stock ?? 0,
//                'price'       => $request->price,
//                'satuan'      => $request->satuan,
//                'category_id' => $categoryId, // Pakai ID kategori yang dkategoriukan atau dibuat
//                'created_by'  => $request->created_by,
//            ]);
//
//            // Debugging: Log kategori yang berhasil disimpan
//            Log::info('kategori berhasil ditambahkan:', $kategori->toArray());

            // Kembalikan response JSON
            return response()->json([
                'message' => 'Kategori berhasil ditambahkan',
                'category' => $category,
            ], 201);
        } catch (\Exception $e) {
            // Tangani exception dan log error
            Log::error('Terjadi kesalahan saat menambah kategori: ' . $e->getMessage(), [
                'error' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat menambah kategori.',
                'error'   => $e->getMessage(),
            ], 500);
        }
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
}
