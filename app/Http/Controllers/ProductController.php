<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::where('type', 'product')
            ->with('subcategory')
            ->get();

        return Inertia::render('Products/Index', [
            'products' => $products
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'negotiable' => 'nullable|boolean',
            'subcategory_id' => 'required|exists:products,id',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $product = Product::create([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'negotiable' => $request->negotiable ?? false,
            'parent_id' => $request->subcategory_id,
            'type' => 'product',
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $image->store('products', 'public');
            }
        }

        return redirect()->route('products.index')
            ->with('success', 'تم إنشاء المنتج بنجاح');
    }

    public function edit(Product $product)
    {
        return Inertia::render('Products/Edit', [
            'product' => $product
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'negotiable' => 'nullable|boolean',
        ]);

        $product->update($request->only([
            'title', 'description', 'price', 'negotiable'
        ]));

        return redirect()->route('products.index')
            ->with('success', 'تم تعديل المنتج');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('products.index')
            ->with('success', 'تم حذف المنتج');
    }

    // API
    public function getCategories()
    {
        return Product::where('type', 'category')->get();
    }

    public function getSubcategories($categoryId)
    {
        return Product::where('type', 'subcategory')
            ->where('parent_id', $categoryId)
            ->get();
    }
}
