<?php

namespace Database\Seeders;

use App\Models\Items;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UpdateTaxPercentageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Items::where('is_tax', true)->chunk(100, function ($items) {
            foreach ($items as $item) {
                $item->tax_percentage_retail = $item->tax;
                $item->tax_percentage_wholesale = $item->tax;
                $item->tax_percentage_eceran = $item->tax;
                $item->tax_percentage_semi_grosir = $item->tax;
                $item->tax_percentage_reseller = $item->tax;

                // Rehitung pajak luaran
                $item->pajak_luaran_retail = $item->retail_price > 0
                    ? $item->retail_price * ($item->tax / (100 + $item->tax))
                    : 0;
                $item->pajak_luaran_wholesale = $item->wholesale_price > 0
                    ? $item->wholesale_price * ($item->tax / (100 + $item->tax))
                    : 0;
                $item->pajak_luaran_eceran = $item->eceran_price > 0
                    ? $item->eceran_price * ($item->tax / (100 + $item->tax))
                    : 0;
                $item->pajak_luaran_semi_grosir = $item->semi_grosir_price > 0
                    ? $item->semi_grosir_price * ($item->tax / (100 + $item->tax))
                    : 0;
                $item->pajak_luaran_reseller = $item->reseller_price > 0
                    ? $item->reseller_price * ($item->tax / (100 + $item->tax))
                    : 0;

                $item->save();
            }
        });
    }
}
