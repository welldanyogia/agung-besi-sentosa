<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembelian extends Model
{
    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'kategori',
        'qty',
        'satuan',
        'spesifikasi',
        'harga',
        'pajak',
        'persentase_pajak',
        'pajak_masukan',
        'harga_total',
        'tanggal_pembelian',
    ];

    protected $casts = [
        'qty' => 'integer',
        'harga' => 'decimal:2',
        'pajak' => 'decimal:0',
        'persentase_pajak' => 'decimal:2',
        'pajak_masukan' => 'decimal:2',
        'harga_total' => 'decimal:2',
        'tanggal_pembelian' => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(Categories::class, 'kategori');
    }

    protected static function booted()
    {
        static::deleting(function ($pembelian) {
            $item = \App\Models\Items::where('item_code', $pembelian->kode_barang)->first();
            if ($item) {
                $item->stock = max(0, $item->stock - $pembelian->qty);
                $item->save();
            }
        });

        static::updating(function ($pembelian) {
            $originalQty = $pembelian->getOriginal('qty');
            $newQty = $pembelian->qty;

            $item = \App\Models\Items::where('item_code', $pembelian->kode_barang)->first();
            if ($item) {
                $selisih = $newQty - $originalQty;
                $item->stock += $selisih;
                $item->stock = max(0, $item->stock);
                $item->save();
            }
        });

        static::saving(function ($pembelian) {
            $originalQty = $pembelian->getOriginal('qty');
            $newQty = $pembelian->qty;

            $item = \App\Models\Items::where('item_code', $pembelian->kode_barang)->first();
            if ($item) {
                // Update stok
                $selisih = $newQty - $originalQty;
                $item->stock += $selisih;
                $item->stock = max(0, $item->stock);

                // Cek perubahan harga
                $oldPrice = $item->price;
                $newPrice = $pembelian->harga;

                if ($oldPrice !== null) {
                    $selisihHarga = $newPrice - $oldPrice;

                    if ($selisihHarga > 0) {
//                        $pembelian->status_perubahan_harga = 'naik';
                        $item->status_perubahan_harga = 'naik';
                    } elseif ($selisihHarga < 0) {
//                        $pembelian->status_perubahan_harga = 'turun';
                        $item->status_perubahan_harga = 'turun';
                    } else {
//                        $pembelian->status_perubahan_harga = 'tetap';
                        $item->status_perubahan_harga = 'tetap';
                    }

                    $item->selisih_perubahan_harga = abs($selisihHarga);
                } else {
                    // Jika tidak ada harga sebelumnya, dianggap barang baru
                    $item->status_perubahan_harga = 'baru';
                    $item->selisih_perubahan_harga = 0;
                }

                // Update harga
                $item->price = $newPrice;
                $item->save();
            }
        });

        static::saved(function ($pembelian) {
            self::syncItemDpp($pembelian->kode_barang);
        });

        static::deleted(function ($pembelian) {
            self::syncItemDpp($pembelian->kode_barang);
        });

    }

    protected static function syncItemDpp(string $kodeBarang): void
    {
        $item = \App\Models\Items::where('item_code', $kodeBarang)->first();
        if ($item) {
            $latest = self::where('kode_barang', $kodeBarang)
                ->orderBy('tanggal_pembelian', 'desc')
                ->first();

            $item->dpp = $latest?->harga_total;
            $item->save();
        }
    }
}
