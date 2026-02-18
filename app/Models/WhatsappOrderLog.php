<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappOrderLog extends Model
{
    protected $fillable = ['store_id','user_id','product_id','message'];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
