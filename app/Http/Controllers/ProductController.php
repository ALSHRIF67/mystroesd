<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with('category')
            ->active()
            ->latest()
            ->get();

        return Inertia::render('Products/Index', [
            'products' => $products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::active()->get();

        return Inertia::render('Products/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // تحقق من البيانات الواردة
        Log::info('Store request data:', $request->all());
        Log::info('Files:', $request->file() ?: []);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'negotiable' => 'boolean',
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'tags' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'phone' => ['nullable','regex:/^\+?[0-9]{6,20}$/'],
            'country_code' => 'nullable|string|max:5',
            // الصور كمصفوفة
            'images' => 'nullable|array|max:10',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            // صورة واحدة (للدعم القديم)
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // Ensure subcategory belongs to the given category (if provided)
        if (!empty($validated['subcategory_id'])) {
            $belongs = Subcategory::where('id', $validated['subcategory_id'])
                ->where('category_id', $validated['category_id'])
                ->exists();

            if (!$belongs) {
                return back()->withErrors(['subcategory_id' => 'القسم الفرعي غير مرتبط بالقسم المحدد.'])->withInput();
            }
        }

        // معالجة الصور المتعددة
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $filename = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('products', $filename, 'public');
                $imagePaths[] = $filename;
            }
        }
        
        // للحفاظ على التوافق مع الصورة الفردية
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('products', $filename, 'public');
            $validated['image'] = $filename;
        }

        // تحويل الصور المتعددة إلى JSON للتخزين
        if (!empty($imagePaths)) {
            $validated['images'] = $imagePaths; // store as array -> JSON column will handle
        }

        // تعيين القيم الافتراضية للحقول الاختيارية
        $validated['negotiable'] = $request->boolean('negotiable', false);
        $validated['tags'] = $request->input('tags', '');
        $validated['email'] = $request->input('email', '');
        $validated['phone'] = $request->input('phone', '');
        $validated['country_code'] = $request->input('country_code', '+249');
        $validated['subcategory_id'] = $request->input('subcategory_id', null);

        // تعيين المستخدم إذا كان مسجلاً
        if (auth()->check()) {
            $validated['user_id'] = auth()->id();
        }

        // إنشاء المنتج
        Product::create($validated);

        return redirect()->route('products.index')
            ->with('success', 'تم إنشاء المنتج بنجاح.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return Inertia::render('Products/Show', [
            'product' => $product->load('category'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $categories = Category::active()->get();

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'negotiable' => 'boolean',
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'tags' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'phone' => ['nullable','regex:/^\+?[0-9]{6,20}$/'],
            'country_code' => 'nullable|string|max:5',
            'images' => 'nullable|array|max:10',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // Ensure subcategory belongs to the given category (if provided)
        if (!empty($validated['subcategory_id'])) {
            $belongs = Subcategory::where('id', $validated['subcategory_id'])
                ->where('category_id', $validated['category_id'])
                ->exists();

            if (!$belongs) {
                return back()->withErrors(['subcategory_id' => 'القسم الفرعي غير مرتبط بالقسم المحدد.'])->withInput();
            }
        }

        // معالجة الصور: دعم إزالة محددة ودمج الصور الجديدة مع القديمة
        $existingImages = $product->images ?: [];
        if (!is_array($existingImages)) {
            $existingImages = json_decode($existingImages, true) ?: [];
        }

        // حذف صور محددة إذا تم إرسالها
        if ($request->filled('remove_images')) {
            $toRemove = $request->input('remove_images', []);
            foreach ($toRemove as $rm) {
                if (in_array($rm, $existingImages)) {
                    Storage::disk('public')->delete('products/' . $rm);
                    $existingImages = array_values(array_diff($existingImages, [$rm]));
                }
            }
        }

        // إضافة الصور الجديدة (دمج)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $filename = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('products', $filename, 'public');
                $existingImages[] = $filename;
            }
        }

        // ضمان حد أقصى من الصور
        if (count($existingImages) > 10) {
            $existingImages = array_slice($existingImages, 0, 10);
        }

        if (!empty($existingImages)) {
            $validated['images'] = $existingImages;
        } else {
            $validated['images'] = null;
        }

        // معالجة الصورة الفردية
        if ($request->hasFile('image')) {
            // حذف الصورة القديمة
            if ($product->image) {
                Storage::disk('public')->delete('products/' . $product->image);
            }

            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('products', $filename, 'public');
            $validated['image'] = $filename;
        } else {
            unset($validated['image']);
        }

        $validated['negotiable'] = $request->boolean('negotiable', false);

        $product->update($validated);

        return redirect()->route('products.index')
            ->with('success', 'تم تحديث المنتج بنجاح.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Soft delete
        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'تم حذف المنتج بنجاح (يمكن استعادته).');
    }

    /**
     * Restore a soft-deleted product.
     */
    public function restore($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();

        return redirect()->route('products.index')
            ->with('success', 'تم استعادة المنتج بنجاح.');
    }

    /**
     * Permanently delete a product.
     */
    public function forceDelete($id)
    {
        $product = Product::withTrashed()->findOrFail($id);

        // Delete images from storage
        if ($product->image) {
            Storage::disk('public')->delete('products/' . $product->image);
        }
        
        if ($product->images) {
            $images = json_decode($product->images, true) ?? [];
            foreach ($images as $image) {
                Storage::disk('public')->delete('products/' . $image);
            }
        }

        $product->forceDelete();

        return redirect()->route('products.index')
            ->with('success', 'تم حذف المنتج نهائياً.');
    }
}