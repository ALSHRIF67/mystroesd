@extends('layouts.app')

@section('title','Cart')

@section('content')
    <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-6">سلة المشتريات</h1>

        @php $cart = session('cart', []); $items = $cart['items'] ?? []; @endphp

        @if(empty($items))
            <div class="bg-white p-6 rounded">السلة فارغة</div>
        @else
            <div class="bg-white p-6 rounded">
                @foreach($items as $it)
                    @php $product = \App\Models\Product::find($it['product_id']); @endphp
                    <div class="flex justify-between items-center py-2 border-b">
                        <div>
                            <div class="font-medium">{{ $product->title }}</div>
                            <div class="text-sm text-gray-500">الكمية: {{ $it['quantity'] }}</div>
                        </div>
                        <div>{{ number_format(($it['price'] ?? 0) * $it['quantity'],2) }}</div>
                    </div>
                @endforeach

                <div class="mt-4 text-right">
                    <a href="{{ route('checkout.index') }}" class="px-4 py-2 bg-blue-600 text-white rounded">تابع للدفع</a>
                </div>
            </div>
        @endif
    </div>
@endsection
