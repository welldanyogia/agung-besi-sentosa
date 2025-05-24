<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

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
    protected static function booted()
    {
        static::updating(function ($item) {
            if ($item->is_tax && $item->tax > 0) {
                $multiplier = 1 + ($item->tax / 100);

                $item->wholesale_price = self::roundUpToHundred($item->wholesale_price * $multiplier);
                $item->retail_price    = self::roundUpToHundred($item->retail_price * $multiplier);
                $item->eceran_price    = self::roundUpToHundred($item->eceran_price * $multiplier);
            }
        });
    }


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
