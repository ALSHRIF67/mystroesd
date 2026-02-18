<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;
use App\Models\Category;
use App\Http\Controllers\ProductController as PublicProductController;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $products = Product::where('user_id', $user->id)->paginate(20);
        return view('merchant.products.index', compact('products'));
    }

    public function create()
    {
        $user = auth()->user();
        $categories = Category::active()->get();
        $store = $user?->store ?? null;

        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'orderSystemEnabled' => $store?->system_enabled ?? false,
            'store' => $store,
            'auth' => $user,
        ]);
    }
    //C:\xampp\htdocs\mystroesd\mystroesd\resources\js\Pages\Products\Create.jsx

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $data['user_id'] = $user->id;
        // ensure category exists for product (some tests/environments require category_id)
        if (empty($data['category_id'])) {
            $cat = \App\Models\Category::where('name', 'Uncategorized')->first();
            if (!$cat) {
                $cat = new \App\Models\Category();
                $cat->name = 'Uncategorized';
                // set fields expected by schema
                if (\Schema::hasColumn('categories', 'slug')) {
                    $cat->slug = 'uncategorized';
                }
                if (\Schema::hasColumn('categories', 'status')) {
                    $cat->status = 1;
                }
                if (\Schema::hasColumn('categories', 'is_active')) {
                    $cat->is_active = true;
                }
                $cat->save();
            }
            $data['category_id'] = $cat->id;
        }
        // Ensure merchant-created products are always pending approval
        $data['status'] = \App\Models\Product::STATUS_PENDING;

        $product = Product::create($data);

        return redirect()->route('merchant.products.index')->with('success','تم إنشاء المنتج (قيد المراجعة)');
    }

    public function edit($id)
    {
        $product = Product::where('user_id', auth()->id())->findOrFail($id);
        return view('merchant.products.edit', compact('product'));
    }

    public function update(Request $request, $id)
    {
        $product = Product::where('user_id', auth()->id())->findOrFail($id);

        // Merchants may only update title, price and description. Status changes are reserved for admins.
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $product->update($data);

        return redirect()->route('merchant.products.index')->with('success','تم تحديث المنتج');
    }

    public function destroy($id)
    {
        $product = Product::where('user_id', auth()->id())->findOrFail($id);
        $product->delete();
        return redirect()->route('merchant.products.index')->with('success','تم حذف المنتج');
    }
}
