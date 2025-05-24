<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\Log;

class InvoiceItems extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invoice_id', 'item_id', 'qty', 'price', 'discount', 'sub_total', 'price_type'
    ];

//    protected static function booted(): void
//    {
//        static::creating(function ($item) {
//            $itemModel = Items::find($item->item_id);
//            $price = static::getPriceByType($itemModel, $item->price_type);
//
//            $excludedCategories = [
//                'engsel bubut',
//                'plat timbangan',
//                'timbangan',
//                'pipa gas timbangan',
//                'engsel',
//                'kawat las stenlis',
//                'kawat las',
//            ];
//
//            $item->price = $price;
//            $item->sub_total = $item->qty * $price;
//
//            $categoryName = strtolower($itemModel->category->category_name ?? '');
//
//            if (fmod($item->qty, 1) === 0.5 && !in_array($categoryName, $excludedCategories)) {
//                $item->sub_total += 5000;
//            }
//
//            $item->sub_total -= $item->discount;
//        });
//
//        static::updating(function ($item) {
//            $itemModel = Items::find($item->item_id);
//            $price = static::getPriceByType($itemModel, $item->price_type);
//
//            $excludedCategories = [
//                'engsel bubut',
//                'plat timbangan',
//                'timbangan',
//                'pipa gas timbangan',
//                'engsel',
//                'kawat las stenlis',
//                'kawat las',
//            ];
//
//            $item->price = $price;
//            $item->sub_total = $item->qty * $price;
//
//            $categoryName = strtolower($itemModel->category_name ?? '');
//
//            if (fmod($item->qty, 1) === 0.5 && !in_array($categoryName, $excludedCategories)) {
//                $item->sub_total += 5000;
//            }
//
//            $item->sub_total -= $item->discount;
//        });
//
//    }

    protected static function booted(): void
    {
        foreach (['creating', 'updating'] as $event) {
            static::$event(function ($item) {
                $itemModel = Items::find($item->item_id);
                $price = static::getPriceByType($itemModel, $item->price_type);

                $excludedCategories = [
                    'engsel bubut',
                    'plat timbangan',
                    'timbangan',
                    'pipa gas timbangan',
                    'engsel',
                    'kawat las stenlis',
                    'kawat las',
                    'amplas',
                    'kabel las',
                ];

                $excludedItemKeywords = [
                    'talang'
                ];

                $excludedUnits = [
                    'meter',
                ];

                $item->price = $price;
                $item->sub_total = $item->qty * $price;

                $categoryName = strtolower($itemModel->category->category_name ?? '');
                $itemName = strtolower($itemModel->item_name ?? '');
                $unit = strtolower($itemModel->retail_unit ?? '');

                $isCategoryExcluded = in_array($categoryName, $excludedCategories);
                $isItemNameExcluded = collect($excludedItemKeywords)->contains(
                    fn($keyword) => str_contains($itemName, $keyword)
                );
                $isUnitExcluded = $item->price_type === 'eceran' && in_array($unit, $excludedUnits);

                $shouldExclude = $isCategoryExcluded || $isItemNameExcluded || $isUnitExcluded;

                if ($item->qty == 0.5 && !$shouldExclude) {
                    $item->sub_total += 5000;
                }

                $item->sub_total -= $item->discount;
            });
        }
    }


    protected static function getPriceByType($item, $type)
    {
        return match ($type) {
            'retail' => $item->retail_price,
            'grosir' => $item->wholesale_price,
            'eceran' => $item->eceran_price,
            default => 0,
        };
    }
    public function invoice()
    {
        return $this->belongsTo(Invoices::class, 'invoice_id');
    }

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }
}
