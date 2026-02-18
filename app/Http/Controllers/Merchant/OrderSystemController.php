<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Store;
use App\Models\Plan;

class OrderSystemController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $store = $user->store;

        // If store doesn't exist, show activation prompt
        $productsQuery = [];
        $liveCount = 0;
        $offlineCount = 0;

        if ($store) {
            $productsQuery = \App\Models\Product::where('user_id', $store->user_id)->latest()->get();
            $liveCount = \App\Models\Product::where('user_id', $store->user_id)
                ->where('status', \App\Models\Product::STATUS_APPROVED)
                ->count();
            $offlineCount = \App\Models\Product::where('user_id', $store->user_id)
                ->where('status', 'offline')
                ->count();
        }

        return view('merchant.orders.dashboard', [
            'store' => $store,
            'plan' => $store?->plan,
            'products' => $productsQuery,
            'liveCount' => $liveCount,
            'offlineCount' => $offlineCount,
        ]);
    }

    public function activate(Request $request)
    {
        $user = $request->user();

        $store = $user->store()->firstOrCreate(
            ['user_id' => $user->id],
            ['name' => $user->name ?? 'متجري']
        );

        // If plan_id provided in request, set it
        if ($request->filled('plan_id')) {
            $store->plan_id = $request->plan_id;
        } else if (!$store->plan_id) {
            $free = Plan::where('name', 'Free')->first();
            if ($free) {
                $store->plan_id = $free->id;
            }
        }

        $store->system_enabled = true;
        $store->activated_at = now();
        $store->save();

        return redirect()->route('merchant.orderSystem.dashboard')
            ->with('success', 'تم تفعيل نظام الطلبات لمتجرك');
    }

    public function plans(Request $request)
    {
        $user = $request->user();
        $store = $user->store;
        return view('merchant.plans.index', ['store' => $store]);
    }
}
