@extends('layouts.app')

@section('title', 'الصفحة الرئيسية')

@section('content')
    <x-hero />

    <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-10 mb-8">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <i class="fas fa-check-circle ml-3 text-green-500"></i> أحدث المنتجات
            </h2>
            <a href="{{ route('home') }}" class="text-blue-600 hover:text-blue-800 font-bold text-lg flex items-center">
                عرض الكل <i class="fas fa-arrow-left mr-2 rtl-flip"></i>
            </a>
        </div>

        @if($products->count() > 0)
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                @foreach($products as $product)
                    <x-product-card :product="$product" />
                @endforeach
            </div>
            <div class="mt-10">{{ $products->links('pagination::tailwind') }}</div>
        @else
            <div class="flex items-start gap-6 bg-blue-50/50 rounded-2xl p-6 md:p-8">
                <div class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200">
                    <i class="fas fa-box-open text-3xl text-blue-600"></i>
                </div>
                <div class="pt-2">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">لا توجد منتجات معتمدة</h2>
                    <p class="text-gray-600 text-lg">لم يتم اعتماد أي منتجات بعد. يرجى العودة لاحقاً.</p>
                </div>
            </div>
        @endif
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <x-feature-card icon="fa-shield-alt" title="تسوق آمن" desc="ضمان حماية معلوماتك" />
        <x-feature-card icon="fa-truck" title="توصيل سريع" desc="أسرع خدمة توصيل" />
        <x-feature-card icon="fa-credit-card" title="دفع آمن" desc="طرق دفع متعددة" />
        <x-feature-card icon="fa-headset" title="دعم 24/7" desc="فريق دائم لخدمتك" />
    </div>
@endsection