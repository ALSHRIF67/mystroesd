@extends('layouts.app')

@section('title', 'منتجاتي')

@section('content')
    <div class="container mx-auto px-4 py-8 max-w-7xl">
        {{-- رأس الصفحة مع زر الإضافة --}}
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 class="text-3xl font-bold text-gray-900">منتجاتي</h1>
            <a href="{{ route('merchant.products.create') }}" 
               class="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition">
                <i class="fas fa-plus-circle ml-2"></i>
                إنشاء منتج جديد
            </a>
        </div>

        {{-- رسالة النجاح --}}
        @if(session('success'))
            <div class="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                <i class="fas fa-check-circle ml-2 text-green-600"></i>
                {{ session('success') }}
            </div>
        @endif

        {{-- جدول المنتجات --}}
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div class="overflow-x-auto">
                <table class="w-full text-right">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600">#</th>
                            @if(isset($products->first()->image_url) || isset($products->first()->image))
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">الصورة</th>
                            @endif
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600">العنوان</th>
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600">السعر</th>
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse($products as $p)
                            <tr class="hover:bg-gray-50 transition">
                                <td class="px-6 py-4 text-gray-900">{{ $p->id }}</td>
                                @if(isset($p->image_url) || isset($p->image))
                                    <td class="px-6 py-4">
                                        <img src="{{ $p->image_url ?? asset('storage/' . $p->image) }}" 
                                             alt="{{ $p->title }}" 
                                             class="w-12 h-12 object-cover rounded-lg shadow-sm">
                                    </td>
                                @endif
                                <td class="px-6 py-4 font-medium text-gray-900">{{ $p->title }}</td>
                                <td class="px-6 py-4 text-gray-900 font-medium">
                                    {{ number_format($p->price, 2) }} ج.س
                                </td>
                                <td class="px-6 py-4">
                                    @php
                                        $status = $p->status ?? 'draft';
                                        $badge = match($status) {
                                            'approved' => ['bg-green-50', 'text-green-700', 'Live'],
                                            'pending'  => ['bg-yellow-50', 'text-yellow-800', 'Pending Approval'],
                                            'offline'  => ['bg-gray-100', 'text-gray-700', 'Offline'],
                                            default    => ['bg-gray-100', 'text-gray-600', $status],
                                        };
                                    @endphp
                                    <span class="px-3 py-1 inline-flex text-xs font-semibold rounded-full {{ $badge[0] }} {{ $badge[1] }}">
                                        {{ $badge[2] }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <a href="{{ route('merchant.products.edit', $p->id) }}" 
                                           class="inline-flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition"
                                           title="تعديل">
                                            <i class="fas fa-edit"></i>
                                            <span class="mr-1 hidden sm:inline">تعديل</span>
                                        </a>
                                        <form action="{{ route('merchant.products.destroy', $p->id) }}" method="POST" class="inline-block">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" 
                                                    class="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
                                                    onclick="return confirm('هل أنت متأكد من حذف هذا المنتج؟')"
                                                    title="حذف">
                                                <i class="fas fa-trash-alt"></i>
                                                <span class="mr-1 hidden sm:inline">حذف</span>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
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

            {{-- روابط التصفح --}}
            @if($products->hasPages())
                <div class="px-6 py-4 border-t border-gray-100">
                    {{ $products->links() }}
                </div>
            @endif
        </div>
    </div>
@endsection