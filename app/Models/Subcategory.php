<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Category;

class Subcategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    // العلاقة مع القسم الرئيسي
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // العلاقة مع المنتجات
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // نطاق النشاط
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
}