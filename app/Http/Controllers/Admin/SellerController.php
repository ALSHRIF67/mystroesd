<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SellerController extends Controller
{
    public function index()
    {
        $sellers = User::where('role','seller')->latest()->get();
        return Inertia::render('Admin/Sellers/Index', ['sellers' => $sellers]);
    }

    public function toggleSuspend(Request $request, $id)
    {
        $seller = User::findOrFail($id);
        $seller->is_suspended = !$seller->is_suspended;
        $seller->save();

        // When suspended, hide their products by setting status to archived/suspended
        if ($seller->is_suspended) {
            $seller->products()->where('status', Product::STATUS_APPROVED)->update(['status' => 'suspended']);
        }

        return redirect()->back()->with('success','Seller suspension toggled.');
    }
}
