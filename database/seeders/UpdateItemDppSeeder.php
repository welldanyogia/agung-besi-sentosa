<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Items;
use App\Models\Pembelian;

class UpdateItemDppSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Items::chunk(100, function ($items) {
            foreach ($items as $item) {
                $latest = Pembelian::where('kode_barang', $item->item_code)
                    ->orderBy('tanggal_pembelian', 'desc')
                    ->first();

                if ($latest) {
                    $item->dpp = $latest->harga_total;
                } elseif ($item->is_tax) {
                    $taxRate = $item->tax ?? 0;
                    $item->dpp = round($item->price / (1 + $taxRate / 100), 2);
                } else {
                    continue; // tidak ada perubahan dpp
                }

                $item->save();
            }
        });
    }
}
