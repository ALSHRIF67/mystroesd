<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class SubcategoryController extends Controller
{
    public function byCategory($categoryId)
    {
        try {
            $subcategories = Subcategory::where('category_id', $categoryId)
                ->where('status', 1)
                ->get(['id', 'name', 'category_id']);
            
            return response()->json($subcategories);
        } catch (\Exception $e) {
            \Log::error('Error fetching subcategories: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }
}