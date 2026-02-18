<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureSystemOrderEnabled
{
    public function handle(Request $request, Closure $next)
    {
        $store = $request->route('store');

        if (!$store) {
            return redirect()->route('pricing')->with('error', 'Store not found');
        }

        if (!($store->plan && $store->plan->has_system_orders && $store->selling_mode === 'system')) {
            return redirect()->route('pricing')->with('error', 'Please upgrade to enable system orders');
        }

        return $next($request);
    }
}
