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