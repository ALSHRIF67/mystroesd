<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureStoreOwner
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Allow activation route to be accessed by authenticated users
        // who don't yet have a store (they need to create/activate it).
        $routeName = optional($request->route())->getName();
        if ($routeName === 'merchant.orderSystem.activate') {
            return $next($request);
        }

        $store = $request->route('store') ?? $user->store;
        if (!$store) {
            abort(404);
        }

        if ($store->user_id !== $user->id) {
            abort(403);
        }

        return $next($request);
    }
}
