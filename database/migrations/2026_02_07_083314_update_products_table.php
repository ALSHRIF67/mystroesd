<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Add missing fields safely (do not depend on column order or other tables)
            if (!Schema::hasColumn('products', 'subcategory_id')) {
                $table->unsignedBigInteger('subcategory_id')->nullable();
                // Do NOT add foreign key here because the `subcategories` table
                // may not exist yet (migration ordering varies). Add FK in a
                // separate migration after subcategories table exists if needed.
            }

            if (!Schema::hasColumn('products', 'tags')) {
                $table->string('tags')->nullable();
            }

            if (!Schema::hasColumn('products', 'email')) {
                $table->string('email')->nullable();
            }

            if (!Schema::hasColumn('products', 'phone')) {
                $table->string('phone')->nullable();
            }

            if (!Schema::hasColumn('products', 'country_code')) {
                $table->string('country_code')->default('+249');
            }

            if (!Schema::hasColumn('products', 'images')) {
                $table->json('images')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $cols = [];
            foreach (['subcategory_id','tags','email','phone','country_code','images'] as $c) {
                if (Schema::hasColumn('products', $c)) {
                    $cols[] = $c;
                }
            }

            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
