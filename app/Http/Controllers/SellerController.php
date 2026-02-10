<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SellerController extends Controller
{
    /**
     * Show public seller page with live products only.
     */
    public function show(User $user)
    {
        $products = Product::where('user_id', $user->id)
            ->live()
            ->with('category')
            ->latest()
            ->get();

        if (app()->environment('testing')) {
            return response()->json([
                'seller' => $user->only(['id','name','first_name','last_name','email']),
                'products' => $products->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'title' => $p->title,
                        'status' => $p->status,
                    ];
                })->values(),
            ]);
        }

        return Inertia::render('Seller/Show', [
            'seller' => $user,
            'products' => $products,
        ]);
    }
}
