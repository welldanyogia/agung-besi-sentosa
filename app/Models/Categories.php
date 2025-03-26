<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Categories extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['category_name'];

    public function items()
    {
        return $this->hasMany(Items::class, 'category_id');
    }
}
