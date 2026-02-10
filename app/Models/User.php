<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
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

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_marketing_subscribed' => 'boolean',
        'terms_accepted' => 'boolean',
        'role' => 'string',
        'is_suspended' => 'boolean',
    ];

    // Helper
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isSuspended()
    {
        return (bool) $this->is_suspended;
    }

    // Relation: a user (seller) can have many products
    public function products()
    {
        return $this->hasMany(\App\Models\Product::class, 'user_id');
    }
}
