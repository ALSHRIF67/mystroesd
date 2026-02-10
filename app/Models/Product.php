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
        'status',
        'user_id',
        'approved_by',
        'approved_at',
        'published_at',
        'rejection_reason',
        'moderation_notes',
    ];

    protected $casts = [
        'negotiable' => 'boolean',
        'price' => 'decimal:2',
        'images' => 'array',
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    // Append accessor URLs so Inertia receives usable image URLs
    protected $appends = [
        'image_url',
        'images_urls',
        'formatted_price',
        'status_text',
    ];

    // Product status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_ARCHIVED = 'archived';
    public const STATUS_DRAFT = 'draft';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_SUSPENDED = 'suspended';

    // حالة النص للعرض
    public const STATUS_TEXTS = [
        self::STATUS_PENDING => 'قيد المراجعة',
        self::STATUS_APPROVED => 'تمت الموافقة',
        self::STATUS_ARCHIVED => 'مؤرشف',
        self::STATUS_SUSPENDED => 'موقف',
        self::STATUS_DRAFT => 'مسودة',
        self::STATUS_REJECTED => 'مرفوض',
    ];

    // Scope to get only live/approved products
    public function scopeLive($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    // تحديث نطاق النشاط ليعرض المنتجات المعتمدة فقط
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    // إضافة النطاقات الأخرى للحالات
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopeArchived($query)
    {
        return $query->where('status', self::STATUS_ARCHIVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function scopeSuspended($query)
    {
        return $query->where('status', self::STATUS_SUSPENDED);
    }

    // نطاق للمنتجات الخاصة بمستخدم معين
    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

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

    // العلاقة مع المستخدم (البائع)
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    // Alias for controller convenience: `seller` relation
    public function seller()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    // العلاقة مع المستخدم الذي وافق على المنتج
    public function approvedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }


    // Alias expected by admin controllers
    public function approver()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }

    // Alias for the user who rejected the product (if column exists)
    public function rejecter()
    {
        return $this->belongsTo(\App\Models\User::class, 'rejected_by');
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
        if (!$this->image) {
            return asset('storage/products/placeholder.png');
        }
        return asset('storage/products/' . $this->image);
    }

    // الوصول لمسارات الصور المتعددة
    public function getImagesUrlsAttribute()
    {
        $images = $this->images ?: [];
        if (!is_array($images)) {
            $images = json_decode($images, true) ?? [];
        }

        if (empty($images)) {
            return [asset('storage/products/placeholder.png')];
        }

        return array_map(function ($image) {
            return asset('storage/products/' . $image);
        }, $images);
    }

    // سعر منسق
    public function getFormattedPriceAttribute()
    {
        return number_format($this->price, 2) . ' $';
    }

    // نص الحالة باللغة العربية
    public function getStatusTextAttribute()
    {
        return self::STATUS_TEXTS[$this->status] ?? $this->status;
    }

    // طرق مساعدة للتحقق من الحالة
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isDraft()
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isArchived()
    {
        return $this->status === self::STATUS_ARCHIVED;
    }

    public function canBeEditedByUser()
    {
        // يمكن للمستخدم تعديل المنتج إذا كان في حالة مسودة أو معلق
        return $this->isDraft() || $this->isPending();
    }

    // حدث عند الإنشاء
    protected static function booted()
    {
        static::creating(function ($product) {
            if (auth()->check() && !$product->user_id) {
                $product->user_id = auth()->id();
            }
            
            // إذا لم يتم تحديد حالة، اجعلها pending
            if (!$product->status) {
                $product->status = self::STATUS_PENDING;
            }
        });
    }
}