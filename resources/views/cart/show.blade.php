{{-- resources/views/cart/show.blade.php --}}
@extends('layouts.app')

@section('content')
<div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">سلة التسوق</h1>

    @if($cartItems->isEmpty())
        <p class="text-gray-600">السلة فارغة.</p>
    @else
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($cartItems as $item)
            <div class="bg-white shadow-md rounded-lg overflow-hidden">
                <img src="{{ $item->image }}" alt="{{ $item->name }}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h2 class="text-xl font-semibold mb-2">{{ $item->name }}</h2>
                    <p class="text-gray-700 mb-2">السعر: {{ $item->price }} جنيه</p>
                    <p class="text-gray-500 mb-4">الكمية: {{ $item->quantity }}</p>

                    {{-- زر لتحديث الكمية --}}
                    <form action="{{ route('cart.update', $item->id) }}" method="POST" class="flex mb-2">
                        @csrf
                        @method('PATCH')
                        <input type="number" name="quantity" value="{{ $item->quantity }}" min="1" class="border p-1 rounded w-16">
                        <button type="submit" class="ml-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                            تحديث
                        </button>
                    </form>

                    {{-- زر لحذف المنتج --}}
                    <form action="{{ route('cart.remove', $item->id) }}" method="POST">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                            حذف
                        </button>
                    </form>
                </div>
            </div>
            @endforeach
        </div>

        {{-- المجموع الكلي --}}
        <div class="mt-6 text-right">
            <h2 class="text-2xl font-bold">
                المجموع الكلي: {{ $cartItems->sum(fn($item) => $item->price * $item->quantity) }} جنيه
            </h2>
        </div>
    @endif
</div>
@endsection