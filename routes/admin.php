<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use Inertia\Inertia;

// admin routes are always prefixed and protected by EnsureAdmin middleware
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
    });
