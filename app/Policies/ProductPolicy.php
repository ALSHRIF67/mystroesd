<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine whether the user can view the product.
     */
    public function view(?User $user, Product $product)
    {
        if ($product->status === Product::STATUS_APPROVED) {
            return true; // public
        }

        if (!$user) return false;

        return $user->isAdmin() || $user->id === $product->user_id;
    }

    /**
     * Determine whether the user can create products.
     */
    public function create(User $user)
    {
        // Only authenticated sellers who have a store can create products
        if (!$user) return false;
        if (method_exists($user, 'isAdmin') && $user->isAdmin()) return true;
        if (isset($user->role) && $user->role !== 'seller') return false;
        // must have a store record (store owner) - check via relation existence to avoid stale model state
        try {
            return $user->store()->exists();
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Determine whether the user can update the product.
     */
    public function update(User $user, Product $product)
    {
        if ($user->isAdmin()) return true;

        // Owner can update only if not yet approved
        if ($user->id === $product->user_id) {
            return $product->status !== Product::STATUS_APPROVED;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the product (soft-delete).
     */
    public function delete(User $user, Product $product)
    {
        // Admins can delete any product. Owners can delete only when product is pending.
        if ($user->isAdmin()) return true;

        if ($user->id === $product->user_id) {
            return $product->status === Product::STATUS_PENDING;
        }

        return false;
    }

    /**
     * Determine whether the user can approve the product.
     */
    public function approve(User $user, Product $product)
    {
        return $user->isAdmin();
    }
}
