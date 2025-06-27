<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\Log;

class Items extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'item_name', 'item_code', 'stock', 'price', 'satuan', 'category_id', 'created_by', 'is_tax', 'tax','wholesale_price',
        'retail_price',
        'eceran_price',
        'retail_unit',
        'bulk_unit',
        'bulk_spec',
        'is_retail',
        'retail_conversion',
        'pajak_luaran_retail',
        'pajak_luaran_wholesale',
        'pajak_luaran_eceran',
        'tax_percentage_retail',
        'tax_percentage_wholesale',
        'tax_percentage_eceran',
        'semi_grosir_price', 'tax_percentage_semi_grosir','pajak_luaran_semi_grosir',
        'status_perubahan_harga', 'selisih_perubahan_harga',
        'dpp'
    ];
    protected static function booted()
    {
        static::saving(function ($item) {
            // Jika eceran_price tidak null dan lebih dari 0, set is_retail = true
            $item->is_retail = !is_null($item->eceran_price) && $item->eceran_price > 0;
            self::calculateTaxValues($item);
        });
        static::creating(function ($item) {
            self::calculateTaxValues($item);
        });

        static::updating(function ($item) {
            self::calculateTaxValues($item);
        });
    }


//    protected static function booted()
//    {
//        static::updating(function ($item) {
//            $original = $item->getOriginal();
//
//            if ($item->is_tax && $item->tax > 0) {
//                $oldTaxRate = ($original['tax'] ?? 0) / 100;
//                $newTaxRate = $item->tax / 100;
//
//                $originalWholesale = $original['wholesale_price'] / (1 + $oldTaxRate);
//                $originalRetail    = $original['retail_price']    / (1 + $oldTaxRate);
//                $originalEceran    = $original['eceran_price']    / (1 + $oldTaxRate);
//
//                // Logging sebelum update
//                Log::info('Updating item prices with tax:', [
//                    'item_id' => $item->id,
//                    'old_tax' => $original['tax'],
//                    'new_tax' => $item->tax,
//                    'wholesale_before_tax' => $originalWholesale,
//                    'retail_before_tax' => $originalRetail,
//                    'eceran_before_tax' => $originalEceran,
//                ]);
//
//                $item->wholesale_price = self::roundUpToHundred($originalWholesale * (1 + $newTaxRate));
//                $item->retail_price    = self::roundUpToHundred($originalRetail * (1 + $newTaxRate));
//                $item->eceran_price    = self::roundUpToHundred($originalEceran * (1 + $newTaxRate));
//
//                // Logging sesudah update
//                Log::info('Updated item prices after applying new tax:', [
//                    'item_id' => $item->id,
//                    'new_wholesale_price' => $item->wholesale_price,
//                    'new_retail_price' => $item->retail_price,
//                    'new_eceran_price' => $item->eceran_price,
//                ]);
//            }
//        });
//    }



    protected static function roundUpToHundred($value)
    {
        return ceil($value / 100) * 100;
    }


    public function category()
    {
        return $this->belongsTo(Categories::class, 'category_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function invoiceItems()
    {
        return $this->hasMany(InvoiceItems::class, 'item_id');
    }
    protected static function calculateTaxValues($item)
    {
        // Set semua tax_percentage_* = tax jika is_tax true
        if ($item->is_tax) {
            $item->tax_percentage_retail = $item->tax;
            $item->tax_percentage_wholesale = $item->tax;
            $item->tax_percentage_eceran = $item->tax;
            $item->tax_percentage_semi_grosir = $item->tax;
        }

        // Pajak Luaran Retail
        if ($item->tax_percentage_retail > 0 && $item->retail_price > 0) {
            $item->pajak_luaran_retail = $item->retail_price * ($item->tax_percentage_retail / (100 + $item->tax_percentage_retail));
        } else {
            $item->pajak_luaran_retail = 0;
        }

        // Pajak Luaran Wholesale
        if ($item->tax_percentage_wholesale > 0 && $item->wholesale_price > 0) {
            $item->pajak_luaran_wholesale = $item->wholesale_price * ($item->tax_percentage_wholesale / (100 + $item->tax_percentage_wholesale));
        } else {
            $item->pajak_luaran_wholesale = 0;
        }

        // Pajak Luaran Eceran
        if ($item->tax_percentage_eceran > 0 && $item->eceran_price > 0) {
            $item->pajak_luaran_eceran = $item->eceran_price * ($item->tax_percentage_eceran / (100 + $item->tax_percentage_eceran));
        } else {
            $item->pajak_luaran_eceran = 0;
        }

        // Pajak Luaran Semi Grosir
        if ($item->tax_percentage_semi_grosir > 0 && $item->semi_grosir_price > 0) {
            $item->pajak_luaran_semi_grosir = $item->semi_grosir_price * ($item->tax_percentage_semi_grosir / (100 + $item->tax_percentage_semi_grosir));
        } else {
            $item->pajak_luaran_semi_grosir = 0;
        }
    }


}
