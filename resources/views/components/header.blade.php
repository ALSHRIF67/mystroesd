<!-- ================= HEADER ================= -->
<header class="bg-white shadow-md sticky top-0 z-50">
    <div class="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
        <!-- Logo -->
        <a href="{{ route('home') }}" class="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition">
            <i class="fas fa-store text-xl sm:text-2xl ml-1 sm:ml-2"></i>
            <span class="text-base sm:text-xl font-bold">MyStore</span>
        </a>

        <!-- Cart + User Menu -->
        <div class="flex items-center gap-2 sm:gap-4">
            <!-- Cart Dropdown -->
            <div class="relative">
                <button @click="cartOpen = !cartOpen" class="relative p-2 sm:p-3 text-gray-700 hover:text-blue-600 transition">
                    <i class="fas fa-shopping-cart text-xl sm:text-2xl"></i>
                    <span x-show="cartCount > 0" x-text="cartCount" class="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"></span>
                </button>

                <div x-show="cartOpen" @click.away="cartOpen = false" x-transition
                     class="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                    <div class="p-4 border-b border-gray-200 bg-gradient-to-l from-blue-50 to-white">
                        <h3 class="font-bold text-gray-900 flex items-center">
                            <i class="fas fa-shopping-cart ml-2 text-blue-600"></i>
                            سلة التسوق
                            <span x-show="cartCount > 0" x-text="'(' + cartCount + ')'" class="mr-2 text-sm text-gray-600"></span>
                        </h3>
                    </div>

                    <div class="max-h-96 overflow-y-auto">
                        <template x-for="item in cartItems" :key="item.id">
                            <div class="p-4 border-b border-gray-100 hover:bg-gray-50 transition flex gap-3 items-center">
                                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img :src="item.image_url" class="w-full h-full object-cover" :alt="item.name">
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-bold text-gray-900 text-sm line-clamp-1" x-text="item.name"></h4>
                                    <div class="flex items-center justify-between mt-2">
                                        <span class="text-blue-600 font-bold" x-text="item.price + ' ج.م'"></span>
                                        <span class="text-sm text-gray-600" x-text="'الكمية: ' + item.quantity"></span>
                                    </div>
                                </div>
                                <button @click="removeFromCart(item.product_id)" class="text-gray-400 hover:text-red-600 transition">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </template>
                        <div x-show="cartItems.length === 0" class="p-8 text-center">
                            <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-3"></i>
                            <p class="text-gray-600">سلتك فارغة</p>
                        </div>
                    </div>

                    <div class="p-4 bg-gray-50 border-t border-gray-200">
                        <div class="flex justify-between items-center mb-3">
                            <span class="font-bold text-gray-900">المجموع:</span>
                            <span class="text-xl font-bold text-blue-600" x-text="cartTotal + ' ج.م'"></span>
                        </div>
                        <div class="flex gap-2">
                            <a href="{{ route('checkout.index') }}" class="flex-1 bg-green-600 text-white text-center px-4 py-2 rounded-xl hover:bg-green-700 transition text-sm font-bold">
                                إتمام الشراء
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Menu -->
            <nav class="hidden md:flex items-center gap-4 text-gray-700 font-semibold">
                @auth
                    <a href="{{ route('dashboard') }}" class="hover:text-blue-600 transition"><i class="fas fa-tachometer-alt ml-1"></i> لوحة التحكم</a>
                    <form method="POST" action="{{ route('logout') }}" class="inline">@csrf<button class="text-red-500 hover:text-red-700 transition flex items-center"><i class="fas fa-sign-out-alt ml-1"></i> تسجيل الخروج</button></form>
                @else
                    <a href="{{ route('login') }}" class="hover:text-blue-600 transition"><i class="fas fa-sign-in-alt ml-1"></i> تسجيل الدخول</a>
                    <a href="{{ route('register') }}" class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-md"><i class="fas fa-user-plus ml-1"></i> إنشاء حساب</a>
                @endauth
            </nav>

            <button class="md:hidden p-2 text-gray-700 hover:text-blue-600 transition" onclick="toggleMobileMenu()">
                <i class="fas fa-bars text-2xl"></i>
            </button>
        </div>
    </div>
</header>
