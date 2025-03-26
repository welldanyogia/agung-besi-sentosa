<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Items extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'item_name', 'item_code', 'stock', 'price', 'satuan', 'category_id', 'created_by', 'is_tax', 'tax'
    ];

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
