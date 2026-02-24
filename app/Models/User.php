<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /*
    |--------------------------------------------------------------------------
    | Mass Assignable
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'country_code',
        'is_marketing_subscribed',
        'terms_accepted',
        'role',
        'is_suspended',
    ];

    /*
    |--------------------------------------------------------------------------
    | Hidden
    |--------------------------------------------------------------------------
    */

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_marketing_subscribed' => 'boolean',
        'terms_accepted' => 'boolean',
        'role' => 'string',
        'is_suspended' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSuspended(): bool
    {
        return (bool) $this->is_suspended;
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // Seller products
    public function products()
    {
        return $this->hasMany(\App\Models\Product::class);
    }

    // Store (if seller)
    public function store()
    {
        return $this->hasOne(\App\Models\Store::class);
    }

    // 🧺 User has ONE active cart
    public function cart()
    {
        return $this->hasOne(\App\Models\Cart::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Professional Helpers
    |--------------------------------------------------------------------------
    */

    // Total quantity in cart
    public function cartCount(): int
    {
        if (!$this->cart) {
            return 0;
        }

        return $this->cart->items()->sum('quantity');
    }

    // Total price in cart
    public function cartTotal(): float
    {
        if (!$this->cart) {
            return 0;
        }

        return $this->cart->items->sum(function ($item) {
            return $item->quantity * $item->price_snapshot;
        });
    }
}