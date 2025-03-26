<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SalesReports extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'report_date', 'total_sales', 'total_income', 'total_discount'
    ];
}
