{{-- resources/views/home.blade.php --}}
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'MyStore') }} - الصفحة الرئيسية</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <style>
        body { font-family: 'Cairo', sans-serif; }
        .rtl-flip { transform: scaleX(-1); }
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen"
      x-data="cartData()"
      x-init="initCart()">

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

<!-- ================= HERO ================= -->
<section class="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-12 sm:py-16 md:py-20">
    <div class="container mx-auto px-4 sm:px-6 text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            مرحباً بك في متجرنا
        </h1>
        <p class="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            اكتشف أفضل المنتجات المعتمدة بأفضل الأسعار
        </p>
        <a href="#products" class="inline-block bg-white text-blue-700 px-6 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold hover:bg-gray-200 transition shadow-lg text-sm sm:text-base">
            <i class="fas fa-arrow-down ml-2"></i> تصفح المنتجات
        </a>
    </div>
</section>

<!-- ================= PRODUCTS ================= -->
<section id="products" class="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
    <div class="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-10 mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <i class="fas fa-check-circle ml-2 sm:ml-3 text-green-500 text-2xl sm:text-3xl"></i>
                أحدث المنتجات
            </h2>
            <a href="{{ route('home') }}" class="text-blue-600 hover:text-blue-800 font-bold text-base sm:text-lg flex items-center group">
                عرض الكل
                <i class="fas fa-arrow-left mr-2 rtl-flip group-hover:translate-x-1 transition-transform"></i>
            </a>
        </div>

        @if($products->count() > 0)
        <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            @foreach($products as $product)
                <div class="group bg-gray-50 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
                    <div class="relative pb-[70%] bg-gray-100 overflow-hidden">
                        <img src="{{ $product->image_url ?? 'https://via.placeholder.com/400x300?text=No+Image' }}" alt="{{ $product->name }}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110">
                        <div class="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button @click="addToCart({{ $product->id }}, '{{ addslashes($product->name) }}', {{ $product->price }}, '{{ $product->image_url }}')" class="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold shadow-lg hover:bg-blue-600 hover:text-white transition">
                                <i class="fas fa-cart-plus ml-1"></i> أضف للسلة
                            </button>
                        </div>
                    </div>
                    <div class="p-3 sm:p-4">
                        <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-2 line-clamp-2">{{ $product->name }}</h3>
                        <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{{ $product->description ?? 'وصف المنتج هنا' }}</p>
                        <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                            <span class="text-blue-600 font-bold text-base sm:text-lg">{{ number_format($product->price) }} <span class="text-xs">ج.م</span></span>
                            <div class="flex gap-2 w-full xs:w-auto">
                                <a href="{{ route('products.show', $product->id) }}" class="flex-1 xs:flex-none bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-blue-700 transition text-center text-sm sm:text-base">
                                    <i class="fas fa-eye ml-1"></i> عرض
                                </a>
                                <button @click="addToCart({{ $product->id }}, '{{ addslashes($product->name) }}', {{ $product->price }}, '{{ $product->image_url }}')" class="flex-1 xs:flex-none bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-green-700 transition text-center text-sm sm:text-base">
                                    <i class="fas fa-cart-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
        {{ $products->links('pagination::tailwind') }}
        @else
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 bg-blue-50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <div class="flex w-16 h-16 sm:w-20 sm:h-20 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-200">
                    <i class="fas fa-box-open text-3xl sm:text-4xl text-blue-600"></i>
                </div>
                <div class="text-center sm:text-right">
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">لا توجد منتجات معتمدة</h2>
                    <p class="text-gray-600 text-base sm:text-lg">لم يتم اعتماد أي منتجات بعد. يرجى العودة لاحقاً.</p>
                </div>
            </div>
        @endif
    </div>
</section>

<!-- ================= FOOTER ================= -->
<footer class="bg-gray-900 text-gray-300 py-8 sm:py-10 mt-12 sm:mt-20">
    <div class="container mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-right">
            <div>
                <h3 class="text-lg sm:text-xl font-bold text-white mb-4">{{ config('app.name', 'MyStore') }}</h3>
                <p class="text-gray-400 text-sm leading-relaxed">منصتك المفضلة للتسوق عبر الإنترنت. نوفر لك أفضل المنتجات بأفضل الأسعار.</p>
            </div>
            <div>
                <h4 class="text-white font-bold mb-4">روابط سريعة</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="{{ route('home') }}" class="hover:text-white transition">الرئيسية</a></li>
                    <li><a href="#products" class="hover:text-white transition">المنتجات</a></li>
                    <li><a href="{{ route('checkout.index') }}" class="hover:text-white transition">الدفع</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-bold mb-4">تواصل معنا</h4>
                <ul class="space-y-2 text-sm">
                    <li><i class="fas fa-phone ml-2 text-blue-400"></i> +20 123 456 7890</li>
                    <li><i class="fas fa-envelope ml-2 text-blue-400"></i> info@mystore.com</li>
                    <li><i class="fas fa-map-marker-alt ml-2 text-blue-400"></i> القاهرة، مصر</li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-bold mb-4">تابعنا</h4>
                <div class="flex justify-center sm:justify-start gap-4 text-2xl">
                    <a href="#" class="hover:text-white transition"><i class="fab fa-facebook"></i></a>
                    <a href="#" class="hover:text-white transition"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="hover:text-white transition"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="hover:text-white transition"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-6 text-center">
            <p class="text-gray-400 text-sm">جميع الحقوق محفوظة &copy; {{ date('Y') }} {{ config('app.name', 'MyStore') }}</p>
        </div>
    </div>
</footer>

<!-- ================= SCRIPTS ================= -->
<script>
function toggleMobileMenu(){ document.getElementById('mobileMenu').classList.toggle('hidden'); }

function cartData() {
    return {
        cartOpen:false, cartItems:[], cartCount:0, cartTotal:0,
        async initCart(){
            @auth await this.refreshCart(); @else
            const saved = localStorage.getItem('shoppingCart');
            if(saved){ try{ const c=JSON.parse(saved); this.cartItems=c.items||[]; this.cartCount=c.count||0; this.cartTotal=c.total||0;}catch(e){console.error(e);} }
            @endauth
        },
        async refreshCart(){
            @auth
            try{
                const res=await fetch('/cart');
                if(res.ok){
                    const data=await res.json();
                    this.cartItems = data.cart.map(i=>({
                        id:i.id,
                        product_id:i.product_id,
                        name:i.product.name,
                        price:i.product.price,
                        quantity:i.quantity,
                        image_url:i.product.image_url||'https://via.placeholder.com/400x300?text=No+Image'
                    }));
                    this.cartCount=this.cartItems.reduce((sum,i)=>sum+i.quantity,0);
                    this.cartTotal=this.cartItems.reduce((sum,i)=>sum+(i.price*i.quantity),0);
                }
            }catch(e){console.error(e);}
            @else
            this.cartCount=this.cartItems.reduce((sum,i)=>sum+i.quantity,0);
            this.cartTotal=this.cartItems.reduce((sum,i)=>sum+(i.price*i.quantity),0);
            localStorage.setItem('shoppingCart', JSON.stringify({items:this.cartItems,count:this.cartCount,total:this.cartTotal}));
            @endauth
        },
        async addToCart(productId,name,price,imageUrl){
            @auth
            try{
                const res=await fetch(`/cart/${productId}`,{
                    method:'POST',
                    headers:{'X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
                });
                if(res.ok) await this.refreshCart();
            }catch(e){console.error(e);}
            @else
            const existing=this.cartItems.find(i=>i.product_id===productId);
            if(existing) existing.quantity++;
            else this.cartItems.push({id:Date.now()+productId, product_id:productId,name,price,quantity:1,image_url:imageUrl});
            this.refreshCart();
            @endauth
        },
        async removeFromCart(productId){
            @auth
            try{
                const res=await fetch(`/cart/${productId}`,{
                    method:'DELETE',
                    headers:{'X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
                });
                if(res.ok) await this.refreshCart();
            }catch(e){console.error(e);}
            @else
            this.cartItems=this.cartItems.filter(i=>i.product_id!==productId);
            this.refreshCart();
            @endauth
        }
    }
}
</script>
</body>
</html>
