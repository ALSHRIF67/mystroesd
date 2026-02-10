<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Build the query with eager loading
        $query = Product::with([
            'user:id,name,email',
            'category:id,name,slug',
            'seller:id,name,is_suspended',
            'approver:id,name',
        ])->withTrashed()
          ->latest();

        // Apply search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('seller', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Apply status filter
        if ($request->has('status') && $request->status) {
            if ($request->status === 'archived') {
                $query->onlyTrashed();
            } else {
                $query->where('status', $request->status);
            }
        }

        // Apply category filter
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Apply price filters
        if ($request->has('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', $request->min_price);
        }
        
        if ($request->has('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', $request->max_price);
        }

        // Get paginated results
        $products = $query->paginate(20)->withQueryString();

        // Get categories for filter dropdown
        $categories = Category::active()->select('id', 'name')->get();

        // Calculate statistics
        $stats = [
            'total' => Product::withTrashed()->count(),
            'pending' => Product::where('status', Product::STATUS_PENDING)->count(),
            'approved' => Product::where('status', Product::STATUS_APPROVED)->count(),
            'rejected' => Product::where('status', Product::STATUS_REJECTED)->count(),
            'suspended' => Product::where('status', Product::STATUS_SUSPENDED)->count(),
            'archived' => Product::onlyTrashed()->count(),
        ];

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only([
                'search', 'status', 'category_id', 
                'min_price', 'max_price'
            ]),
        ]);
    }

    public function show($id)
    {
        $product = Product::with([
            'user:id,name,email,created_at',
            'category:id,name,slug',
            'seller:id,name,is_suspended,created_at',
            'approver:id,name',
            'rejecter:id,name',
        ])
        ->withTrashed()
        ->findOrFail($id);

        // Get product activity logs
        $activity = ActivityLog::where('subject_type', Product::class)
            ->where('subject_id', $id)
            ->with('causer:id,name')
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
            'activity' => $activity,
        ]);
    }

    public function edit($id)
    {
        $product = Product::withTrashed()
            ->with(['category:id,name', 'seller:id,name'])
            ->findOrFail($id);
        
        $categories = Category::active()->get();
        
        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'status' => ['required', Rule::in([
                Product::STATUS_PENDING,
                Product::STATUS_APPROVED,
                Product::STATUS_REJECTED,
                Product::STATUS_SUSPENDED,
                Product::STATUS_ARCHIVED
            ])],
            'sku' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'condition' => 'nullable|in:new,used,refurbished',
            'warranty' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($product, $request) {
            $oldStatus = $product->status;
            
            $product->update($request->only([
                'name', 'description', 'price', 'stock', 'category_id',
                'sku', 'weight', 'dimensions', 'brand', 'condition', 'warranty'
            ]));
            
            // Handle status change
            if ($request->status !== $oldStatus) {
                $product->status = $request->status;
                
                // Update timestamps based on status
                if ($request->status === Product::STATUS_APPROVED) {
                    $product->approved_at = now();
                    $product->rejection_reason = null;
                    if (Schema::hasColumn('products', 'approved_by')) {
                        $product->approved_by = auth()->id();
                    }
                } elseif ($request->status === Product::STATUS_REJECTED && Schema::hasColumn('products', 'rejected_at')) {
                    $product->rejected_at = now();
                } elseif ($request->status === Product::STATUS_SUSPENDED && Schema::hasColumn('products', 'suspended_at')) {
                    $product->suspended_at = now();
                }
                
                // Handle archive status (soft delete)
                if ($request->status === Product::STATUS_ARCHIVED && !$product->trashed()) {
                    $product->delete();
                } elseif ($request->status !== Product::STATUS_ARCHIVED && $product->trashed()) {
                    $product->restore();
                }
            }
            
            $product->save();
            
            // Log the update
            ActivityLog::log('product_updated', $product, auth()->user(), [
                'old_status' => $oldStatus,
                'new_status' => $product->status
            ]);
        });

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    public function destroy($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        
        DB::transaction(function () use ($product) {
            $productData = $product->toArray();
            $product->forceDelete();
            
            // Log the permanent deletion
            ActivityLog::log('product_deleted', null, auth()->user(), [
                'product_id' => $id,
                'product_name' => $productData['name'],
                'seller_id' => $productData['seller_id']
            ]);
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product permanently deleted.');
    }

    public function approve(Request $request, $id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        
        // Prevent approving products from suspended sellers (use is_suspended flag)
        if ($product->seller && ($product->seller->is_suspended ?? false)) {
            return redirect()->back()
                ->with('error', 'Cannot approve product from a suspended seller.');
        }

        DB::transaction(function () use ($product) {
            $oldStatus = $product->status;
            
            $product->restore();
            $product->status = Product::STATUS_APPROVED;
            $product->rejection_reason = null;
            
            if (Schema::hasColumn('products', 'approved_by')) {
                $product->approved_by = auth()->id();
            }
            if (Schema::hasColumn('products', 'approved_at')) {
                $product->approved_at = now();
            }
            if (Schema::hasColumn('products', 'published_at')) {
                $product->published_at = now();
            }
            
            $product->save();

            // Log the approval
            ActivityLog::log('product_approved', $product, auth()->user(), [
                'old_status' => $oldStatus,
                'new_status' => $product->status
            ]);
        });

        return redirect()->back()
            ->with('success', 'Product approved successfully.')
            ->with('message_type', 'success');
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|min:10|max:2000',
        ]);

        $product = Product::withTrashed()->findOrFail($id);

        DB::transaction(function () use ($product, $request) {
            $oldStatus = $product->status;
            
            $product->restore();
            $product->status = Product::STATUS_REJECTED;
            $product->rejection_reason = $request->rejection_reason;
            
            if (Schema::hasColumn('products', 'rejected_by')) {
                $product->rejected_by = auth()->id();
            }
            if (Schema::hasColumn('products', 'rejected_at')) {
                $product->rejected_at = now();
            }
            
            $product->save();

            // Log the rejection
            ActivityLog::log('product_rejected', $product, auth()->user(), [
                'old_status' => $oldStatus,
                'new_status' => $product->status,
                'reason' => $request->rejection_reason
            ]);
        });

        return redirect()->back()
            ->with('success', 'Product rejected successfully.')
            ->with('message_type', 'success');
    }

    public function suspend(Request $request, $id)
    {
        $request->validate([
            'moderation_notes' => 'nullable|string|max:2000',
        ]);

        $product = Product::withTrashed()->findOrFail($id);

        DB::transaction(function () use ($product, $request) {
            $oldStatus = $product->status;
            
            $product->restore();
            $product->status = Product::STATUS_SUSPENDED;
            $product->moderation_notes = $request->moderation_notes;
            
            if (Schema::hasColumn('products', 'suspended_by')) {
                $product->suspended_by = auth()->id();
            }
            if (Schema::hasColumn('products', 'suspended_at')) {
                $product->suspended_at = now();
            }
            
            $product->save();

            // Log the suspension
            ActivityLog::log('product_suspended', $product, auth()->user(), [
                'old_status' => $oldStatus,
                'new_status' => $product->status,
                'notes' => $request->moderation_notes
            ]);
        });

        return redirect()->back()
            ->with('success', 'Product suspended successfully.')
            ->with('message_type', 'warning');
    }

    public function archive(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        DB::transaction(function () use ($product) {
            $oldStatus = $product->status;
            
            $product->status = Product::STATUS_ARCHIVED;
            $product->save();
            $product->delete(); // soft delete

            // Log the archiving
            ActivityLog::log('product_archived', $product, auth()->user(), [
                'old_status' => $oldStatus,
                'new_status' => $product->status
            ]);
        });

        return redirect()->back()
            ->with('success', 'Product archived successfully.')
            ->with('message_type', 'info');
    }

    public function restore($id)
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        
        DB::transaction(function () use ($product) {
            $product->restore();
            $product->status = Product::STATUS_PENDING;
            $product->save();
            
            // Log the restoration
            ActivityLog::log('product_restored', $product, auth()->user(), [
                'new_status' => $product->status
            ]);
        });

        return redirect()->back()
            ->with('success', 'Product restored successfully.')
            ->with('message_type', 'success');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => ['required', Rule::in(['approve', 'reject', 'suspend', 'archive', 'restore'])],
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
            'rejection_reason' => 'required_if:action,reject|nullable|string|max:2000',
        ]);

        $count = 0;
        $failed = 0;
        $errors = [];

        foreach ($request->product_ids as $productId) {
            try {
                $product = Product::withTrashed()->find($productId);
                
                if (!$product) {
                    $failed++;
                    continue; // This is OK - not in a switch
                }

                switch ($request->action) {
                    case 'approve':
                        if ($product->seller && ($product->seller->is_suspended ?? false)) {
                            $errors[] = "Product '{$product->name}' cannot be approved (seller suspended)";
                            $failed++;
                            continue 2;
                        }
                        $this->approveProduct($product);
                        $count++;
                        break;
                        
                    case 'reject':
                        $this->rejectProduct($product, $request->rejection_reason ?? 'Bulk rejection');
                        $count++;
                        break;
                        
                    case 'suspend':
                        $this->suspendProduct($product, $request->moderation_notes ?? null);
                        $count++;
                        break;
                        
                    case 'archive':
                        if (!$product->trashed()) {
                            $this->archiveProduct($product);
                            $count++;
                        }
                        break;
                        
                    case 'restore':
                        if ($product->trashed()) {
                            $this->restoreProduct($product);
                            $count++;
                        }
                        break;
                }
            } catch (\Exception $e) {
                \Log::error('Bulk action failed for product ' . $productId, [
                    'error' => $e->getMessage()
                ]);
                $failed++;
                $errors[] = "Product ID {$productId}: " . $e->getMessage();
            }
        }

        $message = "{$count} products updated successfully.";
        
        if ($failed > 0) {
            $message .= " {$failed} products failed to update.";
        }
        
        if (!empty($errors)) {
            $message .= " Errors: " . implode(', ', array_slice($errors, 0, 3));
            if (count($errors) > 3) {
                $message .= '...';
            }
        }

        $messageType = $failed > 0 ? 'warning' : 'success';
        
        return redirect()->back()
            ->with($messageType, $message)
            ->with('count', $count)
            ->with('failed', $failed);
    }

    public function stats()
    {
        $stats = [
            'total' => Product::withTrashed()->count(),
            'pending' => Product::where('status', Product::STATUS_PENDING)->count(),
            'approved' => Product::where('status', Product::STATUS_APPROVED)->count(),
            'rejected' => Product::where('status', Product::STATUS_REJECTED)->count(),
            'suspended' => Product::where('status', Product::STATUS_SUSPENDED)->count(),
            'archived' => Product::onlyTrashed()->count(),
            
            // Weekly stats
            'weekly_submissions' => Product::where('created_at', '>=', now()->subWeek())->count(),
            'weekly_approvals' => Product::where('status', Product::STATUS_APPROVED)
                ->where('approved_at', '>=', now()->subWeek())
                ->count(),
            'weekly_rejections' => Product::where('status', Product::STATUS_REJECTED)
                ->where('rejected_at', '>=', now()->subWeek())
                ->count(),
            
            // Category distribution
            'by_category' => Category::withCount(['products' => function ($query) {
                $query->where('status', Product::STATUS_APPROVED);
            }])->get()->map(function ($category) {
                return [
                    'name' => $category->name,
                    'count' => $category->products_count
                ];
            }),
            
            // Recent activity
            'recent_activity' => ActivityLog::where('subject_type', Product::class)
                ->with(['subject', 'causer'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($log) {
                    return [
                        'type' => $log->type,
                        'product_name' => $log->subject->name ?? 'Deleted Product',
                        'causer_name' => $log->causer->name ?? 'System',
                        'created_at' => $log->created_at->diffForHumans(),
                    ];
                }),
        ];

        return response()->json($stats);
    }

    public function activity(Request $request)
    {
        $activity = ActivityLog::where('subject_type', Product::class)
            ->with(['subject', 'causer'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Products/Activity', [
            'activity' => $activity,
        ]);
    }

    /**
     * Helper method to approve product
     */
    private function approveProduct(Product $product): void
    {
        DB::transaction(function () use ($product) {
            $oldStatus = $product->status;
            
            $product->restore();
            $product->status = Product::STATUS_APPROVED;
            $product->rejection_reason = null;
            
            if (Schema::hasColumn('products', 'approved_at')) {
                $product->approved_at = now();
            }
            
            $product->save();
            
            ActivityLog::log('product_approved', $product, auth()->user(), [
                'old_status' => $oldStatus,
                'new_status' => $product->status
            ]);
        });
    }

    /**
     * Helper method to reject product
     */
    private function rejectProduct(Product $product, string $reason): void
    {
        DB::transaction(function () use ($product, $reason) {
            $oldStatus = $product->status;
            
            $product->restore();
            $product->status = Product::STATUS_REJECTED;
            $product->rejection_reason = $reason;
            
            if (Schema::hasColumn('products', 'rejected_at')) {
                $product->rejected_at = now();
            }
            
            $product->save();
            
            ActivityLog::log('product_rejected', $product, auth()->user(), [
                'old_status' => $oldStatus,
                'new_status' => $product->status,
                'reason' => $reason
            ]);
        });
    }

    /**
     * Helper method to suspend product
     */
    private function suspendProduct(Product $product, ?string $notes = null): void
    {
        DB::transaction(function () use ($product, $notes) {
            $oldStatus = $product->status;
            
            $product->restore();
            $product->status = Product::STATUS_SUSPENDED;
            $product->moderation_notes = $notes;
            
            $product->save();
            
            ActivityLog::log('product_suspended', $product, auth()->user(), [
                'old_status' => $oldStatus,
                'new_status' => $product->status,
                'notes' => $notes
            ]);
        });
    }

    /**
     * Helper method to archive product
     */
    private function archiveProduct(Product $product): void
    {
        DB::transaction(function () use ($product) {
            $oldStatus = $product->status;
            
            $product->status = Product::STATUS_ARCHIVED;
            $product->save();
            $product->delete();
            
            ActivityLog::log('product_archived', $product, auth()->user(), [
                'old_status' => $oldStatus,
                'new_status' => $product->status
            ]);
        });
    }

    /**
     * Helper method to restore product
     */
    private function restoreProduct(Product $product): void
    {
        DB::transaction(function () use ($product) {
            $product->restore();
            $product->status = Product::STATUS_PENDING;
            $product->save();
            
            ActivityLog::log('product_restored', $product, auth()->user(), [
                'new_status' => $product->status
            ]);
        });
    }
}