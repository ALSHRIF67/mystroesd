@extends('layouts.app')

@section('title', 'إتمام الطلب')

@section('content')
<div class="container mx-auto px-4 py-8" 
     x-data="checkoutData()" 
     x-init="initCheckout({{ json_encode([
         'items' => $items,
         'total' => $total,
         'store' => $store ? $store->name : null
     ]) }})">

    <h1 class="text-3xl font-bold text-gray-900 mb-8 flex items-center">
        <i class="fas fa-credit-card ml-3 text-green-600"></i>
        إتمام الطلب
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Checkout Form -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                    <i class="fas fa-user ml-2 text-blue-600"></i>
                    معلومات الشحن
                </h2>

                <form @submit.prevent="submitOrder" class="space-y-6">
                    @csrf
                    <input type="hidden" name="total" x-model="total">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Phone -->
                        <div>
                            <label class="block text-gray-700 font-bold mb-2">
                                رقم الهاتف <span class="text-red-500">*</span>
                            </label>
                            <input type="tel" 
                                   x-model="phone"
                                   class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                   required>
                        </div>

                        <!-- City -->
                        <div>
                            <label class="block text-gray-700 font-bold mb-2">
                                المدينة <span class="text-red-500">*</span>
                            </label>
                            <select x-model="city"
                                    class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                    required>
                                <option value="">اختر المدينة</option>
                                <option value="cairo">القاهرة</option>
                                <option value="alex">الإسكندرية</option>
                                <option value="giza">الجيزة</option>
                                <option value="others">مدن أخرى</option>
                            </select>
                        </div>
                    </div>

                    <!-- Address -->
                    <div>
                        <label class="block text-gray-700 font-bold mb-2">
                            العنوان بالتفصيل <span class="text-red-500">*</span>
                        </label>
                        <textarea x-model="address"
                                  rows="3"
                                  class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                  required></textarea>
                    </div>

                    <!-- Notes -->
                    <div>
                        <label class="block text-gray-700 font-bold mb-2">
                            ملاحظات إضافية
                        </label>
                        <textarea x-model="notes"
                                  rows="2"
                                  class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                  placeholder="أي ملاحظات إضافية للطلب..."></textarea>
                    </div>

                    <h2 class="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200 mt-8">
                        <i class="fas fa-credit-card ml-2 text-green-600"></i>
                        طريقة الدفع
                    </h2>

                    <!-- Payment Methods -->
                    <div class="space-y-4">
                        <label class="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                            <input type="radio" name="payment_method" value="cash" x-model="paymentMethod" class="ml-3">
                            <div class="flex-1">
                                <span class="font-bold text-gray-800">الدفع عند الاستلام</span>
                                <p class="text-sm text-gray-600">ادفع نقداً عند استلام الطلب</p>
                            </div>
                            <i class="fas fa-money-bill-wave text-2xl text-green-600"></i>
                        </label>

                        <label class="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                            <input type="radio" name="payment_method" value="card" x-model="paymentMethod" class="ml-3">
                            <div class="flex-1">
                                <span class="font-bold text-gray-800">بطاقة ائتمان</span>
                                <p class="text-sm text-gray-600">ادفع ببطاقتك الائتمانية</p>
                            </div>
                            <i class="fas fa-credit-card text-2xl text-blue-600"></i>
                        </label>
                    </div>

                    <!-- Card Details (shown if card selected) -->
                    <div x-show="paymentMethod === 'card'" x-transition class="space-y-4 mt-4 p-4 bg-gray-50 rounded-xl">
                        <div>
                            <label class="block text-gray-700 font-bold mb-2">رقم البطاقة</label>
                            <input type="text" placeholder="0000 0000 0000 0000" 
                                   class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none transition">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-700 font-bold mb-2">تاريخ الانتهاء</label>
                                <input type="text" placeholder="MM/YY" 
                                       class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none transition">
                            </div>
                            <div>
                                <label class="block text-gray-700 font-bold mb-2">CVV</label>
                                <input type="text" placeholder="123" 
                                       class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none transition">
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button (Mobile) -->
                    <button type="submit" 
                            class="lg:hidden w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg mt-8">
                        <i class="fas fa-check-circle ml-2"></i>
                        تأكيد الطلب
                    </button>
                </form>
            </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 class="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                    <i class="fas fa-shopping-cart ml-2 text-blue-600"></i>
                    طلبك
                </h2>

                <div class="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    @foreach($items as $item)
                        <div class="flex items-start gap-3">
                            <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img src="{{ $item['image_url'] ?? 'https://via.placeholder.com/400x300?text=No+Image' }}" 
                                     alt="{{ $item['name'] }}"
                                     class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-gray-900 text-sm">{{ $item['name'] }}</h4>
                                <p class="text-xs text-gray-600">الكمية: {{ $item['quantity'] }}</p>
                                <span class="text-blue-600 font-bold text-sm">{{ number_format($item['subtotal']) }} ج.م</span>
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="space-y-3 pt-4 border-t border-gray-200">
                    <div class="flex justify-between text-gray-600">
                        <span>المجموع الفرعي</span>
                        <span class="font-bold">{{ number_format($total) }} ج.م</span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                        <span>الشحن</span>
                        <span>مجاني</span>
                    </div>
                    <div class="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                        <span>الإجمالي</span>
                        <span class="text-green-600">{{ number_format($total) }} ج.م</span>
                    </div>
                </div>

                <!-- Submit Button (Desktop) -->
                <button @click="submitOrder" 
                        class="hidden lg:block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-center font-bold py-4 px-6 rounded-xl transition shadow-lg mt-6">
                    <i class="fas fa-check-circle ml-2"></i>
                    تأكيد الطلب
                </button>

                <div class="mt-4 text-center">
                    <i class="fas fa-lock text-gray-400 ml-1"></i>
                    <span class="text-sm text-gray-500">معلوماتك آمنة ومشفرة</span>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function checkoutData() {
    return {
        items: [],
        total: 0,
        store: null,
        phone: '',
        city: '',
        address: '',
        notes: '',
        paymentMethod: 'cash',
        
        initCheckout(data) {
            this.items = data.items;
            this.total = data.total;
            this.store = data.store;
        },
        
        submitOrder() {
            if (!this.phone || !this.city || !this.address) {
                alert('يرجى إكمال جميع الحقول المطلوبة');
                return;
            }

            if (this.items.length === 0) {
                alert('سلتك فارغة');
                return;
            }

            // Submit form
            const form = document.querySelector('form');
            if (form) {
                // Add items as hidden inputs
                this.items.forEach((item, index) => {
                    let input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = `items[${index}][product_id]`;
                    input.value = item.product_id;
                    form.appendChild(input);
                    
                    input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = `items[${index}][quantity]`;
                    input.value = item.quantity;
                    form.appendChild(input);
                    
                    input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = `items[${index}][price]`;
                    input.value = item.price;
                    form.appendChild(input);
                });
                
                form.submit();
            }
        }
    }
}
</script>
@endsection