<?php
use App\Http\Controllers\Api\SubcategoryController as ApiSubcategoryController;
use App\Http\Controllers\Api\CategoryController as ApiCategoryController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SellerController;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Public seller pages (SEO-friendly optional slug)
Route::get('/seller/{user}/{slug?}', [SellerController::class, 'show'])->name('seller.show');

/*
|--------------------------------------------------------------------------
| API Routes (لجلب الأقسام الفرعية)
|--------------------------------------------------------------------------
*/

// Safe fallback route using a closure to avoid controller autoload issues
Route::get('/api/subcategories/{category}', function ($categoryId) {
    try {
        $subs = \App\Models\Subcategory::where('category_id', $categoryId)
            ->where('status', 1)
            ->get(['id', 'name', 'category_id']);

        return response()->json($subs);
    } catch (\Exception $e) {
        \Log::error('Error fetching subcategories (closure): ' . $e->getMessage());
        return response()->json([], 500);
    }
});

// Primary controller-based route (kept for normal operation)
Route::get('/api/subcategories/{category}', [ApiSubcategoryController::class, 'byCategory']);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Redirects for common capitalized/admin-asset paths (user-facing typos)
Route::get('/Admin', function () {
    \Log::warning('Redirecting capitalized admin path', ['path' => request()->path(), 'ip' => request()->ip()]);
    return redirect('/admin');
});
Route::get('/Admin/Products', function () {
    \Log::warning('Redirecting capitalized admin path', ['path' => request()->path(), 'ip' => request()->ip()]);
    return redirect('/admin/products');
});
Route::get('/Admin/Products/Index.jsx', function () {
    \Log::warning('Redirecting capitalized admin path', ['path' => request()->path(), 'ip' => request()->ip()]);
    return redirect('/admin/products');
});

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Products (CRUD كامل)
    // Backwards-compatible redirect: handle old/incorrect frontend path
    Route::get('products/MyProducts', function () {
        return redirect()->route('products.mine');
    });
    // Temporary debug route to verify auth in tests
    Route::get('debug-mine', function () {
        return auth()->check() ? response('auth-ok', 200) : response('no-auth', 401);
    });
    // Seller: my products (must be registered before resource to avoid
    // the resource `show` route capturing the 'mine' segment as {product})
    Route::get('products/mine', [ProductController::class, 'mine'])->name('products.mine');
   Route::get('/my-products/pending', [ProductController::class, 'pending'])->name('products.pending');
    // Products resource (CRUD كامل)
    Route::resource('products', ProductController::class);
    // Additional product routes for restore and permanent delete
    Route::post('products/{id}/restore', [ProductController::class, 'restore'])->name('products.restore');
    Route::delete('products/{id}/force-delete', [ProductController::class, 'forceDelete'])->name('products.forceDelete');
    // Admin actions: approve / reject
    Route::post('products/{id}/approve', [ProductController::class, 'approve'])->name('products.approve');
    Route::post('products/{id}/reject', [ProductController::class, 'reject'])->name('products.reject');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth', \App\Http\Middleware\EnsureAdmin::class])->group(function () {
    Route::get('/', function () { 
        return Inertia::render('Admin/Dashboard'); 
    })->name('admin.dashboard');

    // ==================== PRODUCT MANAGEMENT ====================
    Route::prefix('products')->name('admin.products.')->group(function () {
        // Product listing with filters
        Route::get('/', [\App\Http\Controllers\Admin\ProductController::class, 'index'])
            ->name('index');
        
        // Product details
        Route::get('/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'show'])
            ->name('show');
        
        // Edit product
        Route::get('/{id}/edit', [\App\Http\Controllers\Admin\ProductController::class, 'edit'])
            ->name('edit');
        
        // Update product
        Route::put('/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'update'])
            ->name('update');
        
        // Delete product permanently
        Route::delete('/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy'])
            ->name('destroy');
        
        // Product status actions
        Route::post('/{id}/approve', [\App\Http\Controllers\Admin\ProductController::class, 'approve'])
            ->name('approve');
        
        Route::post('/{id}/reject', [\App\Http\Controllers\Admin\ProductController::class, 'reject'])
            ->name('reject');
        
        Route::post('/{id}/suspend', [\App\Http\Controllers\Admin\ProductController::class, 'suspend'])
            ->name('suspend');
        
        Route::post('/{id}/archive', [\App\Http\Controllers\Admin\ProductController::class, 'archive'])
            ->name('archive');
        
        Route::post('/{id}/restore', [\App\Http\Controllers\Admin\ProductController::class, 'restore'])
            ->name('restore');
        
        // Bulk actions
        Route::post('/bulk-action', [\App\Http\Controllers\Admin\ProductController::class, 'bulkAction'])
            ->name('bulk-action');
        
        // Statistics and activity
        Route::get('/stats', [\App\Http\Controllers\Admin\ProductController::class, 'stats'])
            ->name('stats');
        
        Route::get('/activity', [\App\Http\Controllers\Admin\ProductController::class, 'activity'])
            ->name('activity');
    });

    // ==================== SELLER MANAGEMENT ====================
    Route::prefix('sellers')->name('admin.sellers.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\SellerController::class, 'index'])
            ->name('index');
        
        Route::get('/{id}', [\App\Http\Controllers\Admin\SellerController::class, 'show'])
            ->name('show');
        
        Route::post('/{id}/toggle-suspend', [\App\Http\Controllers\Admin\SellerController::class, 'toggleSuspend'])
            ->name('toggleSuspend');
        
        // Additional seller routes for full CRUD
        Route::get('/{id}/edit', [\App\Http\Controllers\Admin\SellerController::class, 'edit'])
            ->name('edit');
        
        Route::put('/{id}', [\App\Http\Controllers\Admin\SellerController::class, 'update'])
            ->name('update');
        
        Route::delete('/{id}', [\App\Http\Controllers\Admin\SellerController::class, 'destroy'])
            ->name('destroy');
        
        Route::post('/{id}/activate', [\App\Http\Controllers\Admin\SellerController::class, 'activate'])
            ->name('activate');
        
        Route::post('/{id}/suspend', [\App\Http\Controllers\Admin\SellerController::class, 'suspend'])
            ->name('suspend');
        
        Route::post('/bulk-action', [\App\Http\Controllers\Admin\SellerController::class, 'bulkAction'])
            ->name('bulk-action');
    });

    // ==================== CATEGORY MANAGEMENT ====================
    Route::prefix('categories')->name('admin.categories.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])
            ->name('index');
        
        Route::get('/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'show'])
            ->name('show');
        
        Route::get('/{id}/edit', [\App\Http\Controllers\Admin\CategoryController::class, 'edit'])
            ->name('edit');
        
        Route::post('/', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])
            ->name('store');
        
        Route::put('/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])
            ->name('update');
        
        Route::patch('/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])
            ->name('update.patch');
        
        Route::delete('/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])
            ->name('destroy');
        
        Route::post('/{id}/restore', [\App\Http\Controllers\Admin\CategoryController::class, 'restore'])
            ->name('restore');
        
        Route::post('/reorder', [\App\Http\Controllers\Admin\CategoryController::class, 'reorder'])
            ->name('reorder');
        
        Route::post('/toggle-active/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'toggleActive'])
            ->name('toggle-active');
    });

    // ==================== DASHBOARD STATISTICS ====================
    Route::get('/dashboard-stats', function () {
        return \App\Models\Product::stats();
    })->name('dashboard.stats');
});

// ==================== API ROUTES (Public & Authenticated) ====================
Route::middleware('api')->group(function () {
    // Public API endpoints
    Route::get('/categories', [ApiCategoryController::class, 'index'])->name('api.categories.index');
    Route::get('/subcategories/{category}', [ApiSubcategoryController::class, 'byCategory'])->name('api.subcategories.byCategory');
    
    // Authenticated API endpoints for sellers
    Route::middleware('auth')->group(function () {
        Route::get('/my-products/stats', function () {
            $seller = auth()->user()->seller;
            if (!$seller) {
                return response()->json(['error' => 'Not a seller'], 403);
            }
            
            return response()->json([
                'total' => $seller->products()->count(),
                'pending' => $seller->products()->where('status', 'pending')->count(),
                'approved' => $seller->products()->where('status', 'approved')->count(),
                'rejected' => $seller->products()->where('status', 'rejected')->count(),
                'suspended' => $seller->products()->where('status', 'suspended')->count(),
                'archived' => $seller->products()->onlyTrashed()->count(),
            ]);
        })->name('api.my-products.stats');
    });
});

require __DIR__.'/auth.php';