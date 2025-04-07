<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Invoices extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invoice_code', 'customer_name', 'total_price', 'payment', 'bayar', 'kembalian', 'status', 'created_by', 'is_printed'
    ];

    protected static function booted()
    {
        static::saving(function ($invoice) {
            // Pastikan relasi 'items' sudah dimuat
            if (!$invoice->relationLoaded('items')) {
                $invoice->load('items');
            }

            // Hitung total harga
            $invoice->total_price = $invoice->items->sum('sub_total');

            // Hitung kembalian jika nilai bayar sudah ada
            $invoice->kembalian = ($invoice->bayar ?? 0) - $invoice->total_price;
        });
    }
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(InvoiceItems::class, 'invoice_id');
    }
}
