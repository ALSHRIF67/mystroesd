<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;

Route::post('/stores/{store}/order', [OrderController::class, 'place'])->name('stores.order.place');

// Payment
Route::get('/payment/redirect/{order}', [PaymentController::class, 'redirectToProvider'])->name('payment.redirect');
Route::get('/payment/callback/{order}', [PaymentController::class, 'callback'])->name('payment.callback');

// Cart & Checkout (simple placeholders)
Route::post('/cart/add', [\App\Http\Controllers\CartController::class, 'add'])->name('cart.add');
Route::get('/checkout', [\App\Http\Controllers\CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/place', [\App\Http\Controllers\CheckoutController::class, 'place'])->name('checkout.place');
