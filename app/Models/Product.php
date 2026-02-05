<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'price',
        'negotiable',
        'parent_id',
        'type',
    ];

    protected $casts = [
        'negotiable' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Parent / Children Relations
    |--------------------------------------------------------------------------
    */

    // Parent of this product (Category or Subcategory)
    public function parent()
    {
        return $this->belongsTo(Product::class, 'parent_id');
    }

    // Children of this product (Subcategories or Products)
    public function children()
    {
        return $this->hasMany(Product::class, 'parent_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Explicit Category / Subcategory Relations
    |--------------------------------------------------------------------------
    */

    // Product → Subcategory
    public function subcategory()
    {
        return $this->belongsTo(Product::class, 'parent_id')
                    ->where('type', 'subcategory');
    }

    // Product → Category (through Subcategory)
    public function category()
    {
        return $this->belongsTo(Product::class, 'parent_id')
                    ->where('type', 'category')
                    ->orWhereHas('parent', function($query) {
                        $query->where('type', 'category');
                    });
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers for Category & Subcategory
    |--------------------------------------------------------------------------
    */

    // Category → Subcategories
    public function subcategories()
    {
        return $this->hasMany(Product::class, 'parent_id')
                    ->where('type', 'subcategory');
    }

    // Subcategory → Products
    public function products()
    {
        return $this->hasMany(Product::class, 'parent_id')
                    ->where('type', 'product');
    }
}
