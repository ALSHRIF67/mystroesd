@extends('layouts.app')

@section('title', 'Checkout')

@section('content')
    <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-6">صفحة السلة و الدفع</h1>

        <div class="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">المنتجات</h2>
            <div class="space-y-4">
                @foreach($items as $it)
                    @php
                        $product = \App\Models\Product::find($it['product_id']);
                        $lineTotal = ($it['price'] ?? 0) * ($it['quantity'] ?? 1);
                    @endphp
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <img src="{{ $product->image_url ?? config('app.placeholder_image') }}" alt="{{ $product->title ?? $product->name ?? 'Product' }}" class="w-16 h-16 object-cover rounded" />
                            <div>
                                <div class="font-medium">{{ $product->title ?? $product->name ?? 'Product' }}</div>
                                <div class="text-sm text-gray-500">الكمية: {{ $it['quantity'] }}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold">{{ number_format($lineTotal,2) }} {{ $product->currency ?? 'د.س' }}</div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">الملخص</h2>
            @php
                $total = array_reduce($items, function($carry, $it) { return $carry + (($it['price'] ?? 0) * ($it['quantity'] ?? 1)); }, 0);
            @endphp
            <div class="flex items-center justify-between mb-4">
                <div>المجموع</div>
                <div class="font-bold text-xl">{{ number_format($total,2) }} {{ $product->currency ?? 'د.س' }}</div>
            </div>

            <form method="POST" action="{{ route('checkout.place') }}">
                @csrf
                <button type="submit" class="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-sm">
                    المتابعة إلى الدفع
                </button>
            </form>
        </div>

        <div class="text-sm text-gray-500">المتجر: {{ $store->name ?? 'غير معروف' }}</div>
    </div>
@endsection
