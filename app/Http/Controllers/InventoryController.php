<?php

namespace App\Http\Controllers;

use App\Models\Categories;
use App\Models\Items;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil semua item, beserta relasi kategori dan creator
        $items = \App\Models\Items::with('category', 'createdBy')->get();
        $satuan = \App\Models\Satuan::all();

        return Inertia::render('Inventory/Dashboard', [
            'items' => $items,
            'satuan' => $satuan,
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
//    public function store(Request $request)
//    {
//        // Validasi input
//        $request->validate([
//            'item_name'   => 'required|string|unique:items,item_name',
//            'item_code'   => 'required|string|unique:items,item_code',
//            'stock'       => 'nullable|numeric|min:0',
//            'price'       => 'required|numeric|min:0',
//            'satuan'      => 'required',
//            'category_name' => 'required|string',
//            'created_by'   => 'required|string',
//            'is_tax' => 'required|boolean',
//            'tax' => 'nullable|integer',
//        ]);
//
//        try {
//            // Cek apakah kategori sudah ada berdasarkan nama, jika tidak ada maka buat kategori baru
//            $category = \App\Models\Categories::firstOrCreate(
//                ['category_name' => $request->category_name],
//                ['id' => \Illuminate\Support\Str::uuid()]  // Membuat ID jika kategori baru
//            );
//
//            // Debugging: Log kategori yang ditemukan atau dibuat
//            Log::info('Category:', $category ? $category->toArray() : 'Kategori gagal dibuat atau ditemukan');
//
//            // Pastikan kategori ada sebelum digunakan
//            if (!$category || !$category->id) {
//                Log::error('Kategori gagal dibuat atau ditemukan.');
//                return response()->json([
//                    'message' => 'Gagal menambah kategori.',
//                ], 500);
//            }
//
//            // Jika kategori sudah ada, gunakan ID kategori yang ada
//            // Jika kategori baru, ID sudah dibuat oleh firstOrCreate()
//            $categoryId = $category->id;
//
//            // Simpan item baru
//            $item = \App\Models\Items::create([
//                'id'          => \Illuminate\Support\Str::uuid(),
//                'item_name'   => $request->item_name,
//                'item_code'   => $request->item_code,
//                'stock'       => $request->stock ?? 0,
//                'price'       => $request->price,
//                'satuan'      => $request->satuan,
//                'category_id' => $categoryId, // Pakai ID kategori yang ditemukan atau dibuat
//                'created_by'  => $request->created_by,
//                'is_tax'      => $request->is_tax ?? 0,
//                'tax'         => request()->tax ?? 0,
//            ]);
//
//            // Debugging: Log item yang berhasil disimpan
//            Log::info('Item berhasil ditambahkan:', $item->toArray());
//
//            // Kembalikan response JSON
//            return response()->json([
//                'message' => 'Item berhasil ditambahkan',
//                'item'    => $item,
//                'category' => $category,
//            ], 201);
//        } catch (\Exception $e) {
//            // Tangani exception dan log error
//            Log::error('Terjadi kesalahan saat menambah item: ' . $e->getMessage(), [
//                'error' => $e->getTraceAsString(),
//            ]);
//
//            return response()->json([
//                'message' => 'Terjadi kesalahan saat menambah item.',
//                'error'   => $e->getMessage(),
//            ], 500);
//        }
//    }

    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'item_code'        => 'required|string|unique:items,item_code',
            'item_name'        => 'required|string|unique:items,item_name',
            'category_name'    => 'required|string',
            'stock'            => 'nullable|numeric|min:0',
            'satuan'           => 'required|string',
            'price'            => 'nullable|numeric|min:0',
            'wholesale_price'  => 'nullable|numeric|min:0',
            'retail_price'     => 'nullable|numeric|min:0',
            'eceran_price'     => 'nullable|numeric|min:0',
            'retail_unit'      => 'nullable|string',
            'bulk_unit'        => 'nullable|string',
            'bulk_spec'        => 'nullable|string',
            'retail_convertion'=> 'nullable|numeric|min:0',
            'is_tax'           => 'required|boolean',
            'tax'              => 'nullable|integer',
            'created_by'        => 'required|exists:users,id',
        ]);

        try {
            // Cek apakah kategori sudah ada, jika tidak buat baru
            $category = \App\Models\Categories::firstOrCreate(
                ['category_name' => $request->category_name],
                ['id' => \Illuminate\Support\Str::uuid()]
            );

            if (!$category || !$category->id) {
                Log::error('Kategori gagal dibuat atau ditemukan.');
                return response()->json(['message' => 'Gagal menambah kategori.'], 500);
            }

            // Simpan item baru
            $taxMultiplier = $request->is_tax ? (1 + ($request->tax / 100)) : 1;

            $item = \App\Models\Items::create([
                'id'               => \Illuminate\Support\Str::uuid(),
                'item_code'        => $request->item_code,
                'item_name'        => $request->item_name,
                'category_id'      => $category->id,
                'stock'            => $request->stock ?? 0,
                'satuan'           => $request->satuan,
                'price'            => $request->price,
                'wholesale_price'  => $request->wholesale_price ? $request->wholesale_price * $taxMultiplier : null,
                'retail_price'     => $request->retail_price ? $request->retail_price * $taxMultiplier : null,
                'eceran_price'     => $request->eceran_price ? $request->eceran_price * $taxMultiplier : null,
                'retail_unit'      => $request->retail_unit ?? null,
                'bulk_unit'        => $request->bulk_unit ?? null,
                'bulk_spec'        => $request->bulk_spec ?? null,
                'retail_conversion'=> $request->retail_convertion ?? null,
                'is_tax'           => $request->is_tax,
                'tax'              => $request->is_tax ? $request->tax : null,
                'created_by'       => $request->created_by,
            ]);


            Log::info('Item berhasil ditambahkan:', $item->toArray());

            return response()->json([
                'message'  => 'Item berhasil ditambahkan',
                'item'     => $item,
                'category' => $category,
            ], 201);

        } catch (\Exception $e) {
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
        Log::info('Memulai proses update item', ['item_code' => $id, 'request_data' => $request->all()]);

        try {
            $item = Items::findOrFail($id);

            // Rules dinamis untuk validasi update
            $rules = [];

            if ($request->has('item_code')) {
                $rules['item_code'] = ['string', Rule::unique('items')->ignore($id)];
            }

            if ($request->has('item_name')) {
                $rules['item_name'] = ['string', Rule::unique('items')->ignore($id)];
            }

            if ($request->has('category_name')) {
                $rules['category_name'] = ['string'];
            }

            $rules += [
                'stock'              => ['nullable', 'numeric', 'min:0'],
                'satuan'             => ['sometimes', 'string'],
                'price'              => ['nullable', 'numeric', 'min:0'],
                'wholesale_price'    => ['nullable', 'numeric', 'min:0'],
                'retail_price'       => ['nullable', 'numeric', 'min:0'],
                'eceran_price'       => ['nullable', 'numeric', 'min:0'],
                'retail_unit'        => ['nullable', 'string'],
                'bulk_unit'          => ['nullable', 'string'],
                'bulk_spec'          => ['nullable', 'string'],
                'retail_convertion'  => ['nullable', 'numeric', 'min:0'],
                'is_tax'             => ['sometimes', 'boolean'],
                'tax'                => ['nullable', 'integer'],
                'created_by'         => ['nullable'], // Optional
            ];

            $validated = $request->validate($rules);

            // Update kategori jika dikirim
            if ($request->has('category_name')) {
                $category = Categories::firstOrCreate(
                    ['category_name' => $request->category_name],
                    ['id' => Str::uuid()]
                );
                $validated['category_id'] = $category->id;

                Log::info('Category ditemukan atau dibuat', $category->toArray());
            }

            // Kalikan harga dengan tax jika is_tax true
//            $taxMultiplier = ($request->is_tax ?? false) ? (1 + ($request->tax / 100)) : 1;

            foreach (['wholesale_price', 'retail_price', 'eceran_price'] as $priceField) {
                if ($request->has($priceField)) {
                    $validated[$priceField] = $request->$priceField;
                }
            }

            // Jika ada field 'tax' tapi is_tax false, kosongkan nilainya
            if ($request->has('is_tax') && !$request->is_tax) {
                $validated['tax'] = null;
            }

            $item->update($validated);

            Log::info('Item berhasil diperbarui', ['item' => $item->toArray()]);

            return response()->json([
                'message'  => 'Item berhasil diperbarui',
                'item'     => $item,
                'category' => $category ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Terjadi kesalahan saat memperbarui item', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui item.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            // Cek apakah item ada
            $item = \App\Models\Items::where('item_code', $id)->first();

            if (!$item) {
                Log::warning('Item tidak ditemukan', ['id' => $id]);
                return response()->json([
                    'message' => 'Item tidak ditemukan.',
                ], 404);
            }

            // Hapus item
            $item->delete();

            Log::info('Item berhasil dihapus', ['item_code' => $id]);

            return response()->json([
                'message' => 'Item berhasil dihapus.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Terjadi kesalahan saat menghapus item', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus item.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function storeSatuan(Request $request)
    {
        $request->validate([
            'satuan_name'   => 'required|string|unique:satuans,name',
        ]);
        try {
            // Cek apakah kategori sudah ada berdasarkan nama, jika tidak ada maka buat kategori baru
            $satuan = \App\Models\Satuan::firstOrCreate(
                ['name' => $request->satuan_name],
                ['id' => \Illuminate\Support\Str::uuid()]  // Membuat ID jika kategori baru
            );

            // Debugging: Log kategori yang dkategoriukan atau dibuat
            Log::info('Satuan:', $satuan ? $satuan->toArray() : 'Kategori gagal dibuat atau dkategoriukan');

            // Pastikan kategori ada sebelum digunakan
            if (!$satuan || !$satuan->id) {
                Log::error('Satuan gagal dibuat atau dkategoriukan.');
                return response()->json([
                    'message' => 'Gagal menambah Satuan.',
                ], 500);
            }

            // Jika kategori sudah ada, gunakan ID kategori yang ada
            // Jika kategori baru, ID sudah dibuat oleh firstOrCreate()
//            $categoryId = $satuan->id;
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
                'message' => 'Satuan berhasil ditambahkan',
                'satuan' => $satuan,
            ], 201);
        } catch (\Exception $e) {
            // Tangani exception dan log error
            Log::error('Terjadi kesalahan saat menambah satuan: ' . $e->getMessage(), [
                'error' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat menambah satuan.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function getSatuans()
    {
        $satuan = \App\Models\Satuan::all();

        return response()->json([
            'message' => 'Daftar kategori berhasil diambil',
            'satuan' => $satuan,
            'length' => count($satuan),
        ], 200);
    }
}
