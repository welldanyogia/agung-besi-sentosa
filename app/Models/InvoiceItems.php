<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InvoiceItems extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invoice_id', 'item_id', 'qty', 'price', 'discount', 'sub_total', 'price_type'
    ];

    protected static function booted(): void
    {
        static::creating(function ($item) {
            $itemModel = Items::find($item->item_id);
            $price = static::getPriceByType($itemModel, $item->price_type);

            $item->price = $price;
            $item->sub_total = $item->qty * $price;

            if (fmod($item->qty, 1) === 0.5) {
                $item->sub_total += 5000;
            }

            $item->sub_total -= $item->discount;
        });

        static::updating(function ($item) {
            $itemModel = Items::find($item->item_id);
            $price = static::getPriceByType($itemModel, $item->price_type);

            $item->price = $price;
            $item->sub_total = $item->qty * $price;

            if (fmod($item->qty, 1) === 0.5) {
                $item->sub_total += 5000;
            }

            $item->sub_total -= $item->discount;
        });
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
