<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\{
    ProductController,
    ProfileController,
    SellerController
};
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

Route::middleware(['auth','verified'])->get('/dashboard', fn() =>
    Inertia::render('Dashboard')
)->name('dashboard');

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
        Route::post('products/{id}/{action}','approve')
            ->where('action','approve|reject')
            ->name('products.approve');

        Route::resource('products', ProductController::class);
    });
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
    });

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Public product detail (catch-all for id or slug)
|--------------------------------------------------------------------------
|
| This route is intentionally placed after authenticated/resource routes so
| it doesn't accidentally match reserved segments like "create" or "edit".
|
*/
Route::get('/products/{idSlug}', [ProductController::class, 'publicShow'])->name('products.public.show');
