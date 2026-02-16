{{-- resources/views/home.blade.php --}}
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Mystroesd') }} - تسوق من عدة محلات في مكان واحد</title>

    {{-- Google Fonts: Cairo (primary) --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

    {{-- Font Awesome 6 --}}
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    {{-- Vite + Tailwind --}}
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <style>
        body {
            font-family: 'Cairo', 'Tajawal', sans-serif;
            direction: rtl;
            background: linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #eff6ff 100%);
            min-height: 100vh;
        }
        .rtl-flip {
            transform: scaleX(-1);
        }
        /* Dropdown menu animation */
        .user-dropdown {
            transition: opacity 0.2s, transform 0.2s;
        }
        .user-menu:hover .user-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .user-dropdown {
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
        }

        /* ===== Sidebar styles ===== */
        #sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
            z-index: 40;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease;
        }
        #sidebar-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        #categories-sidebar {
            position: fixed;
            top: 0;
            left: 0; /* physical left, works fine in RTL */
            width: 280px;
            height: 100vh;
            background-color: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            overflow-y: auto;
        }
        #categories-sidebar.open {
            transform: translateX(0);
        }
        /* Adjust for RTL - content inside sidebar stays RTL */
        #categories-sidebar .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid #f0f0f0;
        }
        #categories-sidebar .sidebar-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1e293b;
        }
        #categories-sidebar .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #64748b;
            cursor: pointer;
            padding: 0.25rem;
            transition: color 0.2s;
        }
        #categories-sidebar .close-btn:hover {
            color: #ef4444;
        }
        #categories-sidebar .categories-grid {
            padding: 1.5rem;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        @media (min-width: 640px) {
            #categories-sidebar .categories-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        #categories-sidebar .category-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            background: linear-gradient(to bottom right, #f9fafb, white);
            border-radius: 1rem;
            border: 1px solid #f1f5f9;
            transition: all 0.2s;
            text-decoration: none;
        }
        #categories-sidebar .category-item:hover {
            border-color: #bfdbfe;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            transform: scale(1.02);
        }
        #categories-sidebar .category-icon {
            width: 2.5rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #dbeafe;
            color: #2563eb;
            border-radius: 9999px;
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
        }
        #categories-sidebar .category-name {
            font-size: 0.8rem;
            font-weight: 600;
            color: #334155;
            text-align: center;
        }
    </style>
</head>
<body class="antialiased">

    {{-- ========== الهيدر بالخلفية الكاملة العرض ========== --}}
    <div class="w-full bg-white/70 backdrop-blur-md shadow-lg sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-wrap items-center justify-between gap-4 py-4">
                
                {{-- أيقونة الهامبورجر (في اليسار الفعلي) --}}
                <button id="hamburger-btn" class="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition ml-2">
                    <i class="fas fa-bars text-xl"></i>
                </button>

                {{-- الشعار + اسم المتجر --}}
                <div class="flex items-center">
                    <a href="{{ route('home') }}" class="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition">
                        <i class="fas fa-store text-2xl ml-2"></i>
                        <span class="text-xl font-bold">Mystroesd</span>
                    </a>
                </div>

                {{-- الأزرار اليمنى (دولة / لغة / إضافة قائمة / دخول) --}}
                <div class="flex items-center flex-wrap gap-3">

                    {{-- مبدل اللغة --}}
                    <div class="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-xl shadow-sm">
                        <span class="text-sm font-bold text-blue-600">AR</span>
                        <span class="text-gray-400">|</span>
                        <a href="#" class="text-sm text-gray-600 hover:text-blue-600 transition">EN</a>
                    </div>

                    {{-- زر "إضافة قائمة" --}}
                    <a href="{{ route('products.create') }}" 
                       class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition">
                        <i class="fas fa-plus ml-2"></i>
                        <span class="text-sm">إضافة قائمة</span>
                    </a>

                    {{-- حالة المصادقة --}}
                    @auth
                        <div class="relative user-menu">
                            <button class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition">
                                <i class="fas fa-user-circle text-xl"></i>
                                <span class="text-sm font-bold hidden sm:inline">{{ auth()->user()->name }}</span>
                                <i class="fas fa-chevron-down text-xs"></i>
                            </button>
                            <div class="user-dropdown absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                                <a href="{{ route('dashboard') }}" class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-t-xl transition">
                                    <i class="fas fa-tachometer-alt"></i>
                                    <span class="font-medium">لوحة التحكم</span>
                                </a>
                                <a href="{{ route('products.mine') }}" class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                                    <i class="fas fa-box"></i>
                                    <span class="font-medium">منتجاتي</span>
                                </a>
                                <a href="{{ route('profile.edit') }}" class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                                    <i class="fas fa-user-cog"></i>
                                    <span class="font-medium">الملف الشخصي</span>
                                </a>
                                <form method="POST" action="{{ route('logout') }}" class="border-t border-gray-100">
                                    @csrf
                                    <button type="submit" class="flex items-center gap-3 w-full text-right px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-xl transition">
                                        <i class="fas fa-sign-out-alt"></i>
                                        <span class="font-medium">تسجيل خروج</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    @else
                        <a href="{{ route('login') }}" 
                           class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition">
                            <i class="fas fa-sign-in-alt ml-2"></i>
                            <span class="text-sm">تسجيل الدخول</span>
                        </a>
                        <a href="{{ route('register') }}" 
                           class="inline-flex items-center px-4 py-2 bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-md hover:shadow-lg transition">
                            <i class="fas fa-user-plus ml-2"></i>
                            <span class="text-sm">إنشاء حساب</span>
                        </a>
                    @endauth
                </div>
            </div>
        </div>
    </div>

    {{-- ========== Sidebar التصنيفات + backdrop ========== --}}
    <div id="sidebar-overlay"></div>
    <aside id="categories-sidebar">
        <div class="sidebar-header">
            <h3><i class="fas fa-th-large ml-2 text-blue-600"></i> تصفح الفئات</h3>
            <button id="close-sidebar-btn" class="close-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="categories-grid">
            @forelse($categories ?? [] as $category)
                <a href="{{ route('category.show', $category->slug) }}" class="category-item">
                    <div class="category-icon">
                        <i class="{{ $category->icon ?? 'fas fa-tag' }}"></i>
                    </div>
                    <span class="category-name">{{ $category->name }}</span>
                </a>
            @empty
                <div class="col-span-full text-center py-8 text-gray-500">
                    <i class="fas fa-folder-open text-3xl mb-2"></i>
                    <p>لا توجد فئات حالياً</p>
                </div>
            @endforelse
        </div>
    </aside>

    {{-- ========== المحتوى الرئيسي داخل الحاوية ========== --}}
    <div class="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
        <div class="w-full max-w-7xl">

            {{-- ========== قسم الهيرو (خلفية داكنة + بحث) ========== --}}
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 mb-12 text-center">
                <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-4">
                    تسوق من عدة محلات في مكان واحد
                </h1>
                <p class="text-xl md:text-2xl text-gray-300 mb-8">
                    مكان واحد، ماي ستور
                </p>

                <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
                    <div class="flex-1 flex items-center border border-gray-200 rounded-xl px-4 py-3 bg-white">
                        <i class="fas fa-search text-gray-400 ml-2"></i>
                        <input type="text" placeholder="ماذا ؟" class="w-full outline-none text-gray-700 placeholder-gray-400 text-lg">
                    </div>
                    <div class="flex-1 flex items-center border border-gray-200 rounded-xl px-4 py-3 bg-white">
                        <i class="fas fa-map-marker-alt text-gray-400 ml-2"></i>
                        <input type="text" placeholder="أين ؟" class="w-full outline-none text-gray-700 placeholder-gray-400 text-lg">
                    </div>
                    <button class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
                        <i class="fas fa-search"></i>
                        <span>بحث</span>
                    </button>
                </div>
            </div>

            {{-- تمت إزالة قسم الفئات من هنا --}}

            {{-- ========== قسم المنتجات المعتمدة ========== --}}
            <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-10 mb-8">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                        <i class="fas fa-check-circle ml-3 text-green-500"></i>
                        أحدث المنتجات
                    </h2>
                    <a href="{{ route('home') }}" class="text-blue-600 hover:text-blue-800 font-bold text-lg flex items-center">
                        عرض الكل
                        <i class="fas fa-arrow-left mr-2 rtl-flip"></i>
                    </a>
                </div>

                @if($products->count() > 0)
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        @foreach($products as $product)
                            <div class="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                                <a href="{{ route('products.show', $product->slug ? $product->id.'-'+$product->slug : $product->id) }}" class="block">
                                    <div class="relative pb-[70%] bg-gray-100 overflow-hidden">
                                        <img src="{{ $product->image_url ?? 'https://via.placeholder.com/400x300?text=No+Image' }}"
                                             alt="{{ $product->name }}"
                                             loading="lazy"
                                             class="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110">
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
                                        <h3 class="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                                            {{ $product->name }}
                                        </h3>
                                        <div class="flex items-center justify-between">
                                            <span class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-blue-800">
                                                {{ number_format($product->price, 2) }} {{ $product->currency ?? 'د.س' }}
                                            </span>
                                        </div>
                                        <div class="mt-4">
                                            <span class="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-sm group-hover:scale-[1.02]">
                                                <span>عرض التفاصيل</span>
                                                <i class="fas fa-arrow-left mr-2 rtl-flip"></i>
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        @endforeach
                    </div>

                    <div class="mt-10">
                        {{ $products->links('pagination::tailwind') }}
                    </div>
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

            {{-- ========== ميزات إضافية ========== --}}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-md text-center">
                    <i class="fas fa-shield-alt text-3xl text-blue-600 mb-2"></i>
                    <p class="text-sm font-bold text-gray-800">تسوق آمن</p>
                    <p class="text-xs text-gray-500">ضمان حماية معلوماتك</p>
                </div>
                <div class="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-md text-center">
                    <i class="fas fa-truck text-3xl text-blue-600 mb-2"></i>
                    <p class="text-sm font-bold text-gray-800">توصيل سريع</p>
                    <p class="text-xs text-gray-500">أسرع خدمة توصيل</p>
                </div>
                <div class="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-md text-center">
                    <i class="fas fa-credit-card text-3xl text-blue-600 mb-2"></i>
                    <p class="text-sm font-bold text-gray-800">دفع آمن</p>
                    <p class="text-xs text-gray-500">طرق دفع متعددة</p>
                </div>
                <div class="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-md text-center">
                    <i class="fas fa-headset text-3xl text-blue-600 mb-2"></i>
                    <p class="text-sm font-bold text-gray-800">دعم 24/7</p>
                    <p class="text-xs text-gray-500">فريق دائم لخدمتك</p>
                </div>
            </div>

            {{-- ========== الفوتر ========== --}}
            <div class="text-center mt-8 pt-8 border-t border-gray-200">
                <p class="text-gray-500 text-sm">
                    © {{ date('Y') }} منصة Mystroesd. جميع الحقوق محفوظة.
                </p>
                <p class="text-gray-400 text-xs mt-2">
                    Laravel v{{ Illuminate\Foundation\Application::VERSION }} (PHP v{{ PHP_VERSION }})
                </p>
            </div>
        </div>
    </div>

    {{-- ========== JavaScript للتحكم في Sidebar ========== --}}
    <script>
        (function() {
            'use strict';

            const hamburgerBtn = document.getElementById('hamburger-btn');
            const sidebar = document.getElementById('categories-sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            const closeBtn = document.getElementById('close-sidebar-btn');

            function openSidebar() {
                sidebar.classList.add('open');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // منع التمرير خلف الـ sidebar
            }

            function closeSidebar() {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }

            // فتح بالضغط على الهامبورجر
            if (hamburgerBtn) {
                hamburgerBtn.addEventListener('click', openSidebar);
            }

            // إغلاق بزر الإغلاق داخل الـ sidebar
            if (closeBtn) {
                closeBtn.addEventListener('click', closeSidebar);
            }

            // إغلاق بالضغط على الخلفية (backdrop)
            if (overlay) {
                overlay.addEventListener('click', closeSidebar);
            }

            // إغلاق بضغط ESC
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                    closeSidebar();
                }
            });

            // منع انتشار الضغط داخل الـ sidebar عشان ما يقفلش لما نضغط جواه
            if (sidebar) {
                sidebar.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }

            // لو الشاشة كبّرت و فتحنا الـ sidebar، بعدين ضغطنا على أي لينك نسيبه يشتغل و يقفل الـ sidebar تلقائي
            const categoryLinks = sidebar.querySelectorAll('a.category-item');
            categoryLinks.forEach(link => {
                link.addEventListener('click', function() {
                    // نقفل الـ sidebar بعد ميضغط على الرابط (بمهلة بسيطة)
                    setTimeout(closeSidebar, 100);
                });
            });

        })();
    </script>

</body>
</html>