@extends('layouts.app')

@section('title','Create Product')

@section('content')
    <div class="max-w-3xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4">إنشاء منتج</h1>

        @php $store = auth()->user()->store ?? null; @endphp
        @if($store && !$store->system_enabled)
            <div class="mb-4 bg-yellow-50 border border-yellow-100 text-yellow-800 p-4 rounded">
                نظام الطلبات غير مفعل. لتفعيل السلة والدفع وإدارة الطلبات، فعِّل النظام <a href="{{ route('merchant.orderSystem.plans') }}" class="underline">من هنا</a>.
            </div>
        @elseif(!$store)
            <div class="mb-4 bg-yellow-50 border border-yellow-100 text-yellow-800 p-4 rounded">
                لم يتم إعداد متجر بعد — أنشئ المتجر أو فعِّل نظام الطلبات للوصول إلى لوحة الإدارة.
            </div>
        @endif

        <form method="POST" action="{{ route('products.store') }}" enctype="multipart/form-data">
            @csrf
            <div class="mb-4">
                <label class="block mb-1">العنوان</label>
                <input type="text" name="title" class="w-full border p-2 rounded" value="{{ old('title') }}" required />
            </div>
            <div class="mb-4">
                <label class="block mb-1">السعر</label>
                <input type="text" name="price" class="w-full border p-2 rounded" value="{{ old('price') }}" required />
            </div>
            <div class="mb-4">
                <label class="block mb-1">الوصف</label>
                <textarea name="description" class="w-full border p-2 rounded">{{ old('description') }}</textarea>
            </div>
            <div>
                <button class="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
        </form>
    </div>
@endsection
