<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = ['name','price','has_whatsapp','has_system_orders','has_delivery'];
}
