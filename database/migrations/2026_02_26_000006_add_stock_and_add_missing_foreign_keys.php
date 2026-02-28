<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // add stock column to products if absent
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'stock')) {
                $table->unsignedInteger('stock')->default(0)->after('price');
            }
        });

        // ensure buyer_id fk exists on orders (column assumed to exist)
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'buyer_id')) {
                // Add foreign key; if already present, this may fail silently in sqlite
                try {
                    $table->foreign('buyer_id')->references('id')->on('users')->nullOnDelete();
                } catch (\Exception $e) {
                    // ignore -- may already exist or unsupported on sqlite
                }
            }
        });

        // ensure product_id fk exists on order_items
        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'product_id')) {
                try {
                    $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
                } catch (\Exception $e) {
                    // ignore
                }
            }
        });

        // ensure user_id fk exists on stores
        Schema::table('stores', function (Blueprint $table) {
            if (Schema::hasColumn('stores', 'user_id')) {
                try {
                    $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
                } catch (\Exception $e) {
                    // ignore
                }
            }
        });
    }

    public function down()
    {
        Schema::table('stores', function (Blueprint $table) {
            if (Schema::hasColumn('stores', 'user_id')) {
                $table->dropForeign(['user_id']);
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'product_id')) {
                $table->dropForeign(['product_id']);
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'buyer_id')) {
                $table->dropForeign(['buyer_id']);
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'stock')) {
                $table->dropColumn('stock');
            }
        });
    }
};
