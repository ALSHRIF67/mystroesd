@extends('layouts.app')

@section('title','Edit Product')

@section('content')
    <div class="max-w-3xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4">تعديل المنتج</h1>

        <form method="POST" action="{{ route('merchant.products.update', $product->id) }}">
            @csrf
            @method('PUT')
            <div class="mb-4">
                <label class="block mb-1">العنوان</label>
                <input type="text" name="title" class="w-full border p-2 rounded" value="{{ old('title', $product->title) }}" required />
            </div>
            <div class="mb-4">
                <label class="block mb-1">السعر</label>
                <input type="text" name="price" class="w-full border p-2 rounded" value="{{ old('price', $product->price) }}" required />
            </div>
            <div class="mb-4">
                <label class="block mb-1">الوصف</label>
                <textarea name="description" class="w-full border p-2 rounded">{{ old('description', $product->description) }}</textarea>
            </div>
            <div>
                <button class="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
        </form>
    </div>
@endsection
