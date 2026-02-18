@extends('layouts.app')

@section('title','Plans & Activation')

@section('content')
    <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4">الخطط وتفعيل نظام الطلبات</h1>

        <div class="bg-white p-6 rounded mb-4">
            <p>حالة التفعيل: {{ $store?->system_enabled ? 'مفعل' : 'غير مفعل' }}</p>
            <p>الخطة الحالية: {{ $store?->plan?->name ?? 'غير محددة' }}</p>
        </div>

        <div class="bg-white p-6 rounded">
            <h2 class="font-semibold mb-2">الخطط المتاحة</h2>
            @foreach(\App\Models\Plan::all() as $plan)
                <div class="flex items-center justify-between p-3 border-b">
                    <div>
                        <div class="font-bold">{{ $plan->name }}</div>
                        <div class="text-sm text-gray-500">{{ $plan->price }} د.س</div>
                    </div>
                    <div>
                        @if($store && $store->plan_id === $plan->id)
                            <span class="px-3 py-1 bg-green-100 text-green-700 rounded">مفعّل</span>
                        @else
                            <form method="POST" action="{{ route('merchant.orderSystem.activate') }}">
                                @csrf
                                <input type="hidden" name="plan_id" value="{{ $plan->id }}" />
                                <button class="px-4 py-2 bg-blue-600 text-white rounded">اختيار</button>
                            </form>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    </div>
@endsection
