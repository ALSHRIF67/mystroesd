@extends('layouts.app')

@section('title', 'نظام الطلبات - لوحة التحكم')

@section('content')
    <div class="container mx-auto px-4 py-8 max-w-7xl">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">نظام الطلبات الخاص بمتجري</h1>

        @if(session('success'))
            <div class="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                <i class="fas fa-check-circle ml-2 text-green-600"></i>
                {{ session('success') }}
            </div>
        @endif

        @if(!$store || !$store->system_enabled)
            {{-- حالة عدم التفعيل --}}
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg p-8 text-center border border-blue-100">
                <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                    <i class="fas fa-shopping-cart text-3xl text-blue-600"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-3">نظام الطلبات غير مفعل</h2>
                <p class="text-gray-600 mb-6 max-w-md mx-auto">
                    فعّل نظام الطلبات للاستفادة من إدارة السلة، الدفع الإلكتروني، وتتبع الطلبات بسهولة.
                </p>
                <form method="POST" action="{{ route('merchant.orderSystem.activate') }}">
                    @csrf
                    <button type="submit" 
                        class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                        <i class="fas fa-rocket ml-2"></i>
                        تفعيل النظام الآن
                    </button>
                </form>
            </div>
        @else
            {{-- عرض معلومات التفعيل والإحصائيات --}}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {{-- بطاقة تاريخ التفعيل --}}
                <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-blue-100 rounded-xl">
                            <i class="fas fa-calendar-check text-2xl text-blue-600"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">تاريخ التفعيل</p>
                            <p class="font-semibold text-gray-900">
                                {{ $store->activated_at ? \Carbon\Carbon::parse($store->activated_at)->format('Y/m/d') : '-' }}
                            </p>
                        </div>
                    </div>
                </div>

                {{-- بطاقة المنتجات الحية --}}
                <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-green-100 rounded-xl">
                            <i class="fas fa-check-circle text-2xl text-green-600"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">منتجات منشورة (Live)</p>
                            <p class="font-semibold text-gray-900">{{ $liveCount }}</p>
                        </div>
                    </div>
                </div>

                {{-- بطاقة المنتجات غير النشطة --}}
                <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-gray-100 rounded-xl">
                            <i class="fas fa-pause-circle text-2xl text-gray-600"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">غير منشورة (Offline)</p>
                            <p class="font-semibold text-gray-900">{{ $offlineCount }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- أزرار الإجراءات السريعة --}}
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div class="flex items-center gap-3">
                    <a href="{{ route('merchant.products.index') }}" 
                        class="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-sm transition">
                        <i class="fas fa-boxes ml-2"></i>
                        إدارة المنتجات
                    </a>
                    <a href="{{ route('merchant.products.create') }}" 
                        class="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition">
                        <i class="fas fa-plus-circle ml-2"></i>
                        إنشاء منتج جديد
                    </a>
                </div>

                {{-- شريط بحث اختياري (Bonus) --}}
                <div class="relative">
                    <input type="text" placeholder="بحث عن منتج..." 
                        class="w-full md:w-64 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>

            {{-- جدول المنتجات --}}
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div class="overflow-x-auto">
                    <table class="w-full text-right">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">المنتج</th>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">الوصف</th>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">السعر</th>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
                                @if(isset($products->first()->image))
                                    <th class="px-6 py-4 text-sm font-semibold text-gray-600">الصورة</th>
                                @endif
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @forelse($products as $product)
                                <tr class="hover:bg-gray-50 transition">
                                    <td class="px-6 py-4 font-medium text-gray-900">{{ $product->title }}</td>
                                    <td class="px-6 py-4 text-gray-600 max-w-xs">
                                        <div class="line-clamp-2" title="{{ $product->description }}">
                                            {{ $product->description ?: '—' }}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-gray-900 font-medium">
                                        {{ number_format($product->price, 2) }} ج.س
                                    </td>
                                    <td class="px-6 py-4">
                                                @php
                                                    $status = $product->status ?? 'draft';
                                                    $badge = match($status) {
                                                        \App\Models\Product::STATUS_APPROVED => ['bg-green-50', 'text-green-700', 'Live'],
                                                        'pending' => ['bg-yellow-50', 'text-yellow-800', 'Pending Approval'],
                                                        'offline' => ['bg-gray-100', 'text-gray-700', 'Offline'],
                                                        default => ['bg-gray-100', 'text-gray-700', ucfirst($status)],
                                                    };
                                                @endphp
                                                <span class="px-3 py-1 inline-flex text-xs font-semibold rounded-full {{ $badge[0] }} {{ $badge[1] }}">
                                                    {{ $badge[2] }}
                                                </span>
                                    </td>
                                    @if(isset($product->image_url) || isset($product->image))
                                        <td class="px-6 py-4">
                                            <img src="{{ $product->image_url ?? asset('storage/' . $product->image) }}" 
                                                alt="{{ $product->title }}" 
                                                class="w-12 h-12 object-cover rounded-lg shadow-sm">
                                        </td>
                                    @endif
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                                        <i class="fas fa-box-open text-4xl mb-3 opacity-30"></i>
                                        <p class="text-lg">لا توجد منتجات بعد</p>
                                        <a href="{{ route('merchant.products.create') }}" 
                                            class="inline-block mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                                            + أضف منتجك الأول
                                        </a>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        @endif
    </div>
@endsection