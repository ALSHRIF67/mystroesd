<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Store extends Model
{
    use HasFactory;
    protected $fillable = ['user_id','plan_id','selling_mode','name','whatsapp'];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function whatsappLogs()
    {
        return $this->hasMany(WhatsappOrderLog::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
