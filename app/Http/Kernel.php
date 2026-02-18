<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's route middleware.
     *
     * @var array
     */
    protected $routeMiddleware = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
        'system.orders' => \App\Http\Middleware\EnsureSystemOrderEnabled::class,
        'admin' => \App\Http\Middleware\EnsureAdmin::class,
        'store.owner' => \App\Http\Middleware\EnsureStoreOwner::class,
    ];
}
