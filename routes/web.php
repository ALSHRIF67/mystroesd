



















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

Route::middleware('api')->group(function () {
    Route::get('/categories', [ApiCategoryController::class, 'index']);
    Route::get('/subcategories/{category}', [ApiSubcategoryController::class, 'byCategory']);

});

require __DIR__.'/auth.php';