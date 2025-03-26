<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InvoiceItems extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invoice_id', 'item_id', 'qty', 'price', 'discount', 'sub_total'
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoices::class, 'invoice_id');
    }

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }
}
