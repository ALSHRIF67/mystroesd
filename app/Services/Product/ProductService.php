<?php

namespace App\Services\Product;

use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ProductService
{
    /**
     * Create a new product given validated data from a request.
     * Handles file uploads, default values and schema guards.
     */
    public function create(array $data, array $files = []): Product
    {
        $this->ensureCategoryExists();

        // if no category_id supplied, assign the "Uncategorized" fallback
        if (empty($data['category_id'])) {
            $cat = Category::firstOrCreate(
                ['name' => 'Uncategorized'],
                // set optional columns to satisfy schema
                array_filter([
                    'slug' => Schema::hasColumn('categories', 'slug') ? 'uncategorized' : null,
                    'status' => Schema::hasColumn('categories', 'status') ? 1 : null,
                    'is_active' => Schema::hasColumn('categories', 'is_active') ? true : null,
                ])
            );
            $data['category_id'] = $cat->id;
        }

        $this->validateSubcategory($data);

        // log for debugging similar to previous controller
        \Illuminate\Support\Facades\Log::info('ProductService::create payload', $data);
        if (! empty($files)) {
            \Illuminate\Support\Facades\Log::info('ProductService::create files', array_keys($files));
        }

        // normalize boolean/nullable fields
        $data['negotiable'] = isset($data['negotiable']) ? (bool)$data['negotiable'] : false;
        $data['tags'] = $data['tags'] ?? '';
        $data['email'] = $data['email'] ?? '';
        $data['phone'] = $data['phone'] ?? '';
        $data['country_code'] = $data['country_code'] ?? '+249';
        $data['subcategory_id'] = $data['subcategory_id'] ?? null;

        if (auth()->check() && empty($data['user_id'])) {
            $data['user_id'] = auth()->id();
        }

        // status defaults
        if (isset($data['status']) && $data['status'] === Product::STATUS_DRAFT) {
            $data['status'] = Product::STATUS_DRAFT;
        } else {
            $data['status'] = Product::STATUS_PENDING;
        }

        // process image files if provided
        $this->processFiles($data, $files);

        $product = Product::create($data);

        // auto‑approve for merchants whose store order system is enabled
        $user = auth()->user();
        if ($user && $user->store && $user->store->system_enabled) {
            $product->status = Product::STATUS_APPROVED;
            if (Schema::hasColumn('products', 'approved_at')) {
                $product->approved_at = now();
            }
            if (Schema::hasColumn('products', 'published_at')) {
                $product->published_at = now();
            }
            $product->save();
        }

        return $product;
    }

    /**
     * Update an existing product using validated data and possible files.
     */
    public function update(Product $product, array $data, array $files = []): Product
    {
        // preserve subcategory check is assumed to have been validated earlier
        $existingImages = $product->images ?: [];
        if (! is_array($existingImages)) {
            $existingImages = json_decode($existingImages, true) ?: [];
        }

        // handle removals
        if (! empty($data['remove_images'])) {
            foreach ((array)$data['remove_images'] as $rm) {
                if (in_array($rm, $existingImages)) {
                    Storage::disk('public')->delete('products/' . $rm);
                    $existingImages = array_values(array_diff($existingImages, [$rm]));
                }
            }
        }

        // attach new images
        if (! empty($files['images'])) {
            foreach ($files['images'] as $index => $image) {
                if ($image instanceof UploadedFile) {
                    $filename = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $path = $image->storeAs('products', $filename, 'public');
                    $existingImages[] = $filename;
                }
            }
        }

        if (count($existingImages) > 10) {
            $existingImages = array_slice($existingImages, 0, 10);
        }

        $data['images'] = ! empty($existingImages) ? $existingImages : null;

        // single image replacement
        if (! empty($files['image']) && $files['image'] instanceof UploadedFile) {
            if ($product->image) {
                Storage::disk('public')->delete('products/' . $product->image);
            }
            $image = $files['image'];
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('products', $filename, 'public');
            $data['image'] = $filename;
        } else {
            unset($data['image']);
        }

        $data['negotiable'] = isset($data['negotiable']) ? (bool)$data['negotiable'] : false;

        // sanitize status changes: only admin may set
        if (isset($data['status'])) {
            $user = auth()->user();
            if (! $user || $user->role !== 'admin') {
                unset($data['status']);
            }
        }

        $product->update($data);
        return $product;
    }

    /**
     * Ensure at least one category exists so validation rules pass in tests
     */
    protected function ensureCategoryExists(): void
    {
        if (Category::count() === 0) {
            $cat = new Category();
            $cat->name = 'Uncategorized';
            if (Schema::hasColumn('categories', 'slug')) {
                $cat->slug = 'uncategorized';
            }
            if (Schema::hasColumn('categories', 'status')) {
                $cat->status = 1;
            }
            if (Schema::hasColumn('categories', 'is_active')) {
                $cat->is_active = true;
            }
            $cat->save();
        }
    }

    /**
     * Make sure the supplied subcategory, if any, belongs to the
     * requested parent category. Throws \InvalidArgumentException on
     * mismatch.
     */
    protected function validateSubcategory(array $data): void
    {
        if (! empty($data['subcategory_id'])) {
            $belongs = Subcategory::where('id', $data['subcategory_id'])
                ->where('category_id', $data['category_id'] ?? null)
                ->exists();

            if (! $belongs) {
                throw new \InvalidArgumentException('Subcategory not linked to category');
            }
        }
    }

    /**
     * Shared logic for processing uploaded files into the data array.
     */
    protected function processFiles(array &$data, array $files): void
    {
        $imagePaths = [];
        if (! empty($files['images'])) {
            foreach ($files['images'] as $index => $image) {
                if ($image instanceof UploadedFile) {
                    $filename = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $image->storeAs('products', $filename, 'public');
                    $imagePaths[] = $filename;
                }
            }
        }

        if (! empty($files['image']) && $files['image'] instanceof UploadedFile) {
            $image = $files['image'];
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('products', $filename, 'public');
            $data['image'] = $filename;
        }

        if (! empty($imagePaths)) {
            $data['images'] = $imagePaths;
        }
    }

    /**
     * Perform an administrator update on a product.
     * Accepts the same attributes validated by controller.
     * Returns the updated model.
     */
    public function adminUpdate(Product $product, array $attributes): Product
    {
        DB::transaction(function () use ($product, $attributes) {
            $oldStatus = $product->status;

            // apply fillable attributes except status
            $toFill = array_diff_key($attributes, ['status' => 1]);
            if (! empty($toFill)) {
                $product->fill($toFill);
            }

            if (isset($attributes['status']) && $attributes['status'] !== $oldStatus) {
                $product->status = $attributes['status'];
                switch ($attributes['status']) {
                    case Product::STATUS_APPROVED:
                        $product->approved_at = now();
                        $product->rejection_reason = null;
                        if (Schema::hasColumn('products', 'approved_by')) {
                            $product->approved_by = auth()->id();
                        }
                        if (Schema::hasColumn('products', 'published_at')) {
                            $product->published_at = now();
                        }
                        break;
                    case Product::STATUS_REJECTED:
                        $product->rejected_at = now();
                        if (isset($attributes['rejection_reason'])) {
                            $product->rejection_reason = $attributes['rejection_reason'];
                        }
                        if (Schema::hasColumn('products', 'rejected_by')) {
                            $product->rejected_by = auth()->id();
                        }
                        break;
                    case Product::STATUS_SUSPENDED:
                        $product->suspended_at = now();
                        if (isset($attributes['moderation_notes'])) {
                            $product->moderation_notes = $attributes['moderation_notes'];
                        }
                        if (Schema::hasColumn('products', 'suspended_by')) {
                            $product->suspended_by = auth()->id();
                        }
                        break;
                    case Product::STATUS_ARCHIVED:
                        // caller may soft delete after
                        break;
                }
            }

            $product->save();
        });

        return $product;
    }

    /**
     * Shortcut for updating only the status (and optional metadata) of a product.
     * Automatically records an ActivityLog entry.
     */
    public function changeStatus(Product $product, string $status, array $options = []): Product
    {
        $oldStatus = $product->status;
        $this->adminUpdate($product, array_merge(['status' => $status], $options));

        // log the change
        \App\Models\ActivityLog::log('product_status_changed', $product, auth()->user(), array_merge(
            ['old_status' => $oldStatus, 'new_status' => $product->status],
            $options
        ));

        return $product;
    }
}
