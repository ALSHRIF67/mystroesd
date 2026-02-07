<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            // categories table uses `is_active` column
            $categories = Category::where('is_active', 1)
                ->get(['id', 'name', 'slug']);
            
            return response()->json($categories);
        } catch (\Exception $e) {
            \Log::error('Error fetching categories: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }
}