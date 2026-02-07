<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Category;
use App\Models\Subcategory;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'price',
        'negotiable',
        'category_id',
        'subcategory_id',
        'tags',
        'email',
        'phone',
        'country_code',
        'image',
        'images',
        'user_id', // إذا كان لديك نظام مستخدمين
    ];

    protected $casts = [
        'negotiable' => 'boolean',
        'price' => 'decimal:2',
        'images' => 'array',
    ];

    // Append accessor URLs so Inertia receives usable image URLs
    protected $appends = [
        'image_url',
        'images_urls',
    ];

    // العلاقة مع التصنيف
    public function category()
    {
            return $this->belongsTo(Category::class);
    }

    // العلاقة مع التصنيف الفرعي
    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class, 'subcategory_id');
    }

    // نطاق النشاط
    public function scopeActive($query)
    {
        // Older code expected a 'status' column; if none exists, return query unmodified.
        return $query;
    }

    // نطاق البحث
    public function scopeSearch($query, $search)
    {
        return $query->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%')
                    ->orWhere('tags', 'like', '%' . $search . '%');
    }

    // الوصول لمسار الصورة
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/products/' . $this->image) : null;
    }

    // الوصول لمسارات الصور المتعددة
    public function getImagesUrlsAttribute()
    {
        $images = $this->images ?: [];
        if (!is_array($images)) {
            $images = json_decode($images, true) ?? [];
        }

        return array_map(function ($image) {
            return asset('storage/products/' . $image);
        }, $images);
    }
}