<div class="w-full bg-white/70 backdrop-blur-md shadow-lg sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center justify-between gap-4 py-4">
            <button id="hamburger-btn" class="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition ml-2">
                <i class="fas fa-bars text-xl"></i>
            </button>

            <div class="flex items-center">
                <a href="{{ route('home') }}" class="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition">
                    <i class="fas fa-store text-2xl ml-2"></i>
                    <span class="text-xl font-bold">Mystroesd</span>
                </a>
            </div>

            <div class="flex items-center flex-wrap gap-3">
                {{-- Language switcher --}}
                <div class="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-xl shadow-sm">
                    <span class="text-sm font-bold text-blue-600">AR</span>
                    <span class="text-gray-400">|</span>
                    <a href="#" class="text-sm text-gray-600 hover:text-blue-600 transition">EN</a>
                </div>

                <a href="{{ route('products.create') }}" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition">
                    <i class="fas fa-plus ml-2"></i><span class="text-sm">إضافة قائمة</span>
                </a>

                @auth
                    <x-user-dropdown />
                @else
                    <a href="{{ route('login') }}" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition">
                        <i class="fas fa-sign-in-alt ml-2"></i><span class="text-sm">تسجيل الدخول</span>
                    </a>
                    <a href="{{ route('register') }}" class="inline-flex items-center px-4 py-2 bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-md hover:shadow-lg transition">
                        <i class="fas fa-user-plus ml-2"></i><span class="text-sm">إنشاء حساب</span>
                    </a>
                @endauth
            </div>
        </div>
    </div>
</div>