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
        'retail_conversion'
    ];

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
}
