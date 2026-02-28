<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    ProductController,
    ProfileController,
    CartController,
    SellerController
};

// routes that require basic authentication but not admin
Route::middleware(['auth'])->group(function () {

    // profile management
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile','edit')->name('profile.edit');
        Route::patch('/profile','update')->name('profile.update');
        Route::delete('/profile','destroy')->name('profile.destroy');
    });

    // seller products / dashboard
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

    /* Cart control routes */
    Route::get('cart', [CartController::class, 'show'])->name('cart.index');
    Route::post('cart/{product}', [CartController::class, 'addToCart'])->name('cart.addToCart');
    Route::patch('cart/{product}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('cart/{product}', [CartController::class, 'remove'])->name('cart.remove');
});
