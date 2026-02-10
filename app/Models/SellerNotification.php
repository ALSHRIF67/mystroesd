<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerNotification extends Model
{
    protected $fillable = ['user_id','product_id','type','message','read_at'];
}
