<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\{
    ProductController,
    ProfileController,
    SellerController
};
use App\Http\Controllers\CartController;
use App\Http\Controllers\Api\{
    CategoryController as ApiCategoryController,
    SubcategoryController as ApiSubcategoryController
};
use App\Http\Controllers\Admin\{
    ProductController as AdminProductController,
    SellerController as AdminSellerController,
    CategoryController as AdminCategoryController
};

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

Route::get('/', [ProductController::class, 'home'])->name('home');
Route::get('/seller/{user}/{slug?}', [SellerController::class, 'show'])->name('seller.show');

/*
|--------------------------------------------------------------------------
| API (Subcategories fallback + normal)
|--------------------------------------------------------------------------
*/

Route::get('/api/subcategories/{category}', function ($categoryId) {
    try {
        return response()->json(
            \App\Models\Subcategory::where('category_id', $categoryId)
                ->where('status', 1)
                ->get(['id','name','category_id'])
        );
    } catch (\Exception $e) {
        \Log::error($e->getMessage());
        return response()->json([], 500);
    }
});

Route::middleware('api')->group(function () {
    Route::get('/categories', [ApiCategoryController::class, 'index'])->name('api.categories.index');
    Route::get('/subcategories/{category}', [ApiSubcategoryController::class, 'byCategory'])
        ->name('api.subcategories.byCategory');

    Route::middleware('auth')->get('/my-products/stats', function () {
        $seller = auth()->user()->seller;
        abort_if(!$seller, 403, 'Not a seller');

        $products = $seller->products();

        return response()->json([
            'total'     => $products->count(),
            'pending'   => $products->where('status','pending')->count(),
            'approved'  => $products->where('status','approved')->count(),
            'rejected'  => $products->where('status','rejected')->count(),
            'suspended' => $products->where('status','suspended')->count(),
            'archived'  => $products->onlyTrashed()->count(),
        ]);
    })->name('api.my-products.stats');
});

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

Route::middleware(['auth','verified'])->get('/dashboard', function () {
    $user = auth()->user();
    return Inertia::render('Dashboard', [
        'store' => $user ? $user->store : null,
    ]);
})->name('dashboard');

/*
|--------------------------------------------------------------------------
| Capitalized Admin Redirect Fix
|--------------------------------------------------------------------------
*/

foreach ([
    '/Admin' => '/admin',
    '/Admin/Products' => '/admin/products',
    '/Admin/Products/Index.jsx' => '/admin/products'
] as $from => $to) {
    Route::get($from, fn() => redirect($to));
}

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile','edit')->name('profile.edit');
        Route::patch('/profile','update')->name('profile.update');
        Route::delete('/profile','destroy')->name('profile.destroy');
    });

    Route::get('products/MyProducts', fn() => redirect()->route('products.mine'));
    Route::get('debug-mine', fn() => auth()->check() ? response('auth-ok') : response('no-auth',401));

        Route::controller(ProductController::class)->group(function () {
        Route::get('products/mine','mine')->name('products.mine');
        Route::get('/my-products/pending','pending')->name('products.pending');

        Route::post('products/{id}/restore','restore')->name('products.restore');
        Route::delete('products/{id}/force-delete','forceDelete')->name('products.forceDelete');
        // generic products action route
        Route::post('products/{id}/{action}','approve')
            ->where('action','approve|reject')
            ->name('products.action');

        // convenience single-action approve route for compatibility with older code/tests
        Route::post('products/{id}/approve','approve')
            ->defaults('action','approve')
            ->name('products.approve');

        // Exclude the 'show' route from the auth-protected resource so the
        // public product detail route (defined after the auth group) can
        // serve product pages to guests without requiring authentication.
        Route::resource('products', ProductController::class)->except(['show']);
    });
});

/*
|-------------------------------------------------------------------------- 
| Cart Routes
|-------------------------------------------------------------------------- 
*/

Route::middleware('auth')->group(function () {

    // عرض السلة
    Route::get('cart', [CartController::class, 'show'])->name('cart.index');

    // إضافة منتج للسلة
    Route::post('cart/{product}', [CartController::class, 'addToCart'])
        ->name('cart.addToCart'); // ← اسم فريد

    // تحديث كمية منتج في السلة
    Route::patch('cart/{product}', [CartController::class, 'update'])
        ->name('cart.update');

    // حذف منتج من السلة
    Route::delete('cart/{product}', [CartController::class, 'remove'])
        ->name('cart.remove');
});

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

Route::prefix('admin')
    ->middleware(['auth', \App\Http\Middleware\EnsureAdmin::class])
    ->group(function () {

        Route::get('/', fn() => Inertia::render('Admin/Dashboard'))->name('admin.dashboard');
        Route::get('/dashboard-stats', fn() => \App\Models\Product::stats())->name('admin.dashboard.stats');

        // PRODUCTS
        Route::prefix('products')->name('admin.products.')->controller(AdminProductController::class)->group(function () {
            Route::get('/','index')->name('index');
            Route::get('/stats','stats')->name('stats');
            Route::get('/activity','activity')->name('activity');
            Route::post('/bulk-action','bulkAction')->name('bulk-action');
            Route::post('/bulk-destroy','bulkDestroy')->name('bulk-destroy');

            Route::get('/{id}','show')->name('show');
            Route::get('/{id}/edit','edit')->name('edit');
            Route::put('/{id}','update')->name('update');
            Route::delete('/{id}','destroy')->name('destroy');

            Route::post('/{id}/{action}','approve')
                ->where('action','approve|reject|suspend|archive|restore')
                ->name('action');
        });

        // SELLERS
        Route::prefix('sellers')->name('admin.sellers.')->controller(AdminSellerController::class)->group(function () {
            Route::get('/','index')->name('index');
            Route::get('/{id}','show')->name('show');
            Route::get('/{id}/edit','edit')->name('edit');
            Route::put('/{id}','update')->name('update');
            Route::delete('/{id}','destroy')->name('destroy');

            Route::post('/{id}/{action}','toggleSuspend')
                ->where('action','toggle-suspend|activate|suspend')
                ->name('action');

            Route::post('/bulk-action','bulkAction')->name('bulk-action');
        });

        // CATEGORIES
        Route::prefix('categories')->name('admin.categories.')->controller(AdminCategoryController::class)->group(function () {
            Route::get('/','index')->name('index');
            Route::post('/','store')->name('store');
            Route::post('/reorder','reorder')->name('reorder');

            Route::get('/{id}','show')->name('show');
            Route::get('/{id}/edit','edit')->name('edit');
            Route::match(['put','patch'],'/{id}','update')->name('update');
            Route::delete('/{id}','destroy')->name('destroy');

            Route::post('/{id}/restore','restore')->name('restore');
            Route::post('/toggle-active/{id}','toggleActive')->name('toggle-active');
        });

        // Legacy named routes (backwards-compatibility for tests / old links)
        // keep generic action route but named as action
        Route::post('/products/{id}/{action}', [AdminProductController::class, 'approve'])
            ->where('action','approve|reject|suspend|archive|restore')
            ->name('admin.products.action');

        // single-parameter approve route used by older code/tests
        Route::post('/products/{id}/approve', [AdminProductController::class, 'approve'])
            ->defaults('action','approve')
            ->name('admin.products.approve');

        Route::post('/sellers/{id}/{action}', [AdminSellerController::class, 'toggleSuspend'])
            ->where('action','toggle-suspend|activate|suspend')
            ->name('admin.sellers.action');

        // single-parameter toggle route
        Route::post('/sellers/{id}/toggleSuspend', [AdminSellerController::class, 'toggleSuspend'])
            ->defaults('action','toggle-suspend')
            ->name('admin.sellers.toggleSuspend');
    });

require __DIR__.'/auth.php';
require __DIR__.'/orders.php';

/*
|--------------------------------------------------------------------------
| Merchant Order System
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', \App\Http\Middleware\EnsureStoreOwner::class])->prefix('merchant')->group(function () {
    Route::get('order-system', [\App\Http\Controllers\Merchant\OrderSystemController::class, 'dashboard'])
        ->name('merchant.orderSystem.dashboard');

    Route::post('order-system/activate', [\App\Http\Controllers\Merchant\OrderSystemController::class, 'activate'])
        ->name('merchant.orderSystem.activate');

    Route::get('plans', [\App\Http\Controllers\Merchant\OrderSystemController::class, 'plans'])
        ->name('merchant.orderSystem.plans');

    Route::get('orders', [\App\Http\Controllers\Merchant\OrderController::class, 'index'])->name('merchant.orders.index');
    Route::get('orders/{id}', [\App\Http\Controllers\Merchant\OrderController::class, 'show'])->name('merchant.orders.show');
    Route::post('orders/{id}/status', [\App\Http\Controllers\Merchant\OrderController::class, 'updateStatus'])->name('merchant.orders.updateStatus');

    Route::resource('products', \App\Http\Controllers\Merchant\ProductController::class, [
        'as' => 'merchant'
    ]);
});

/*
|--------------------------------------------------------------------------
| Public product detail (catch-all for id or slug)
|--------------------------------------------------------------------------
|
| This route is intentionally placed after authenticated/resource routes so
| it doesn't accidentally match reserved segments like "create" or "edit".
|
*/
Route::get('/products/{idSlug}', [ProductController::class, 'publicShow'])->name('products.show');

// Buyer orders
Route::middleware('auth')->group(function () {
    Route::get('/orders', [\App\Http\Controllers\User\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [\App\Http\Controllers\User\OrderController::class, 'show'])->name('orders.show');
});
