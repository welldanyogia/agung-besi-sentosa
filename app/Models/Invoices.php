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

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(InvoiceItems::class, 'invoice_id');
    }
}
