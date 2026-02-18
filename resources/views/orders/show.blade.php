@extends('layouts.app')

@section('title','Order Details')

@section('content')
    <div class="max-w-3xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4">تفاصيل الطلب #{{ $order->id }}</h1>

        <div class="bg-white p-4 rounded mb-4">
            <div>المتجر: {{ $order->store?->name ?? $order->store_id }}</div>
            <div>المجموع: {{ number_format($order->total,2) }}</div>
            <div>حالة الدفع: {{ $order->payment_status }}</div>
            <div>الحالة: {{ $order->status }}</div>
        </div>

        <div class="bg-white p-4 rounded">
            <h2 class="font-semibold mb-2">عناصر الطلب</h2>
            @foreach($order->items as $it)
                <div class="flex justify-between py-2 border-b">
                    <div>{{ $it->product?->title ?? $it->product_id }}</div>
                    <div>{{ $it->quantity }} x {{ number_format($it->price,2) }}</div>
                </div>
            @endforeach
        </div>
    </div>
@endsection
