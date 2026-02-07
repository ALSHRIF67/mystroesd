<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->decimal('price', 10, 2)->default(0);
                // Negotiable flag
                $table->boolean('negotiable')->default(false);
                $table->foreignId('category_id')->constrained()->onDelete('cascade');
                // Optional subcategory
                $table->unsignedBigInteger('subcategory_id')->nullable();
                $table->string('image')->nullable();
                // Store multiple images as JSON
                $table->json('images')->nullable();
                // Optional contact & tags fields
                $table->string('tags')->nullable();
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('country_code')->default('+249');
                $table->timestamps();
                $table->softDeletes();

                // Indexes for performance
                $table->index('title');
                $table->index('price');
                $table->index('category_id');
                $table->index('deleted_at');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
};
