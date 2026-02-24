@props(['product'])
<div class="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
    <a href="{{ route('products.show', $product->slug ? $product->id.'-'.$product->slug : $product->id) }}" class="block">
        <div class="relative pb-[70%] bg-gray-100 overflow-hidden">
            <img src="{{ $product->image_url ?? config('app.placeholder_image') }}" alt="{{ $product->name }}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110">
            <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md flex items-center">
                <i class="fas fa-store text-blue-600 text-xs ml-1"></i>
                <span class="text-xs font-bold text-gray-800">{{ $product->store->name ?? 'متجر' }}</span>
            </div>
            <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center">
                <i class="fas fa-map-marker-alt ml-1"></i>
                {{ $product->city ?? 'غير محدد' }}
            </div>
        </div>
        <div class="p-4">
            <h3 class="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{{ $product->name }}</h3>
            <div class="flex items-center justify-between">
                <span class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-blue-800">
                    {{ number_format($product->price, 2) }} {{ $product->currency ?? 'د.س' }}
                </span>
            </div>
            <div class="mt-4">
                @php
                    $store = $product->store ?? ($product->seller->store ?? null);
                @endphp

                @if($store && $store->plan && $store->plan->has_system_orders && $store->selling_mode === 'system')
                    <div class="flex gap-2">
                        <button type="button" onclick="(async function(){
                            try {
                                const res = await window.cartHelper.add({{ $product->id }}, 1);
                                if (!res || res.success === false) {
                                    alert('تعذّر إضافة المنتج إلى السلة');
                                } else {
                                    // Small UX: you can replace this with a toast
                                    alert('تمت إضافة المنتج إلى السلة');
                                }
                            } catch (e) {
                                console.error(e);
                                alert('حدث خطأ أثناء إضافة المنتج');
                            }
                        })()" class="flex-1 w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-sm">
                            <span>أضف إلى السلة</span>
                        </button>

                        <a href="{{ route('checkout.index') }}" class="inline-flex items-center px-4 py-3 bg-white border border-blue-600 text-blue-700 font-bold rounded-xl shadow-md hover:shadow-lg transition text-sm">
                            الخروج
                        </a>
                    </div>
                @else
                    <form method="POST" action="{{ route('stores.order.place', $store ?? $product->seller->store ?? 0) }}">
                        @csrf
                        <input type="hidden" name="product_id" value="{{ $product->id }}">
                        <input type="hidden" name="product_name" value="{{ $product->name }}">
                        <input type="hidden" name="quantity" value="1">
                        <button type="submit" class="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-sm">
                            اطلب عبر واتساب
                        </button>
                    </form>
                @endif
            </div>
        </div>
    </a>
</div>