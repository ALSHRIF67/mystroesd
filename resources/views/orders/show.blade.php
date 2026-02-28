

@section('title','My Orders')

    <x-temp />
    
    <div class="max-w-3xl mx-auto p-6">
    <!-- Header with order number and back button (optional) -->
    <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">تفاصيل الطلب #{{ $order->id }}</h1>
        <a href="{{ route('orders.index') }}" class="text-blue-600 hover:underline text-sm">← العودة للطلبات</a>
    </div>

    <!-- Main Order Card -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Order Summary Section (grid layout for better readability) -->
        <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold mb-4">ملخص الطلب</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <span class="block text-sm text-gray-500">المتجر</span>
                    <span class="font-medium">{{ $order->store?->name ?? $order->store_id }}</span>
                </div>
                <div>
                    <span class="block text-sm text-gray-500">المجموع</span>
                    <span class="font-medium">{{ number_format($order->total, 2) }} ر.س</span>
                </div>
                <div>
                    <span class="block text-sm text-gray-500">حالة الدفع</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        @if($order->payment_status == 'paid') bg-green-100 text-green-800
                        @elseif($order->payment_status == 'pending') bg-yellow-100 text-yellow-800
                        @else bg-red-100 text-red-800
                        @endif">
                        {{ $order->payment_status }}
                    </span>
                </div>
                <div>
                    <span class="block text-sm text-gray-500">الحالة</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        @if($order->status == 'completed') bg-green-100 text-green-800
                        @elseif($order->status == 'processing') bg-blue-100 text-blue-800
                        @else bg-gray-100 text-gray-800
                        @endif">
                        {{ $order->status }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Order Items Section -->
        <div class="p-6">
            <h2 class="text-lg font-semibold mb-4">عناصر الطلب</h2>
            <div class="space-y-3">
                @foreach($order->items as $it)
                    <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div class="flex-1">
                            <span class="font-medium">{{ $it->product?->title ?? $it->product_id }}</span>
                        </div>
                        <div class="text-left whitespace-nowrap">
                            <span>{{ $it->quantity }} × {{ number_format($it->price, 2) }} ر.س</span>
                            <span class="mr-4 font-medium">{{ number_format($it->quantity * $it->price, 2) }} ر.س</span>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Footer with action button -->
        <div class="bg-gray-50 px-6 py-4 flex justify-end">
            <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                تتبع الطلب
            </button>
        </div>
    </div>
</div>
