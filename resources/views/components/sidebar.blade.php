<div id="sidebar-overlay"></div>
<aside id="categories-sidebar">
    <div class="sidebar-header">
        <h3><i class="fas fa-th-large ml-2 text-blue-600"></i> تصفح الفئات</h3>
        <button id="close-sidebar-btn" class="close-btn"><i class="fas fa-times"></i></button>
    </div>
    <div class="categories-grid">
        @forelse($categories as $category)
            <a href="{{ route('category.show', $category->slug) }}" class="category-item">
                <div class="category-icon"><i class="{{ $category->icon ?? 'fas fa-tag' }}"></i></div>
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