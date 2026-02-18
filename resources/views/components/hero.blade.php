<div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 mb-12 text-center">
    <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-4">تسوق من عدة محلات في مكان واحد</h1>
    <p class="text-xl md:text-2xl text-gray-300 mb-8">مكان واحد، ماي ستور</p>
    <form method="GET" action="{{ route('home') }}">
        <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
            <div class="flex-1 flex items-center border border-gray-200 rounded-xl px-4 py-3 bg-white">
                <i class="fas fa-search text-gray-400 ml-2"></i>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="ماذا ؟" class="w-full outline-none text-gray-700 placeholder-gray-400 text-lg">
            </div>
            <button type="submit" class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
                <i class="fas fa-search"></i><span>بحث</span>
            </button>
        </div>
    </form>
</div>