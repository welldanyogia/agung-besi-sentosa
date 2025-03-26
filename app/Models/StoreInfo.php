<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreInfo extends Model
{
    protected $fillable = [
        'store_name',
        'address',
        'phone_number',
    ];
}
