<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize()
    {
        // يمكن إضافة شروط إضافية هنا (مثلاً المتجر نشط)
        $store = $this->route('store');
        return $store && $store->is_active; // نفترض وجود عمود is_active
    }

    public function rules()
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(function ($query) {
                    // التأكد أن المنتج ينتمي لنفس المتجر (اختياري)
                    $store = $this->route('store');
                    $query->where('store_id', $store->id);
                }),
            ],
            'items.*.quantity' => 'required|integer|min:1',
            // لا نسمح بإرسال price من العميل – سيتم جلبه من قاعدة البيانات
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages()
    {
        return [
            'items.required' => 'يجب إضافة عنصر واحد على الأقل',
            'items.*.product_id.exists' => 'أحد المنتجات غير موجود أو غير متاح',
        ];
    }
}