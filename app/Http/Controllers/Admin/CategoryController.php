<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::latest()->get();
        return Inertia::render('Admin/Categories/Index', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:255','description' => 'nullable|string','is_active' => 'boolean']);
        Category::create($data);
        return redirect()->back()->with('success','Category created');
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $data = $request->validate(['name' => 'required|string|max:255','description' => 'nullable|string','is_active' => 'boolean']);
        $category->update($data);
        return redirect()->back()->with('success','Category updated');
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return redirect()->back()->with('success','Category deleted');
    }
}
