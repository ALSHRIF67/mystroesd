<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Shared fields
            $table->string('title')->nullable();
            $table->text('description')->nullable();

            // Product-only fields
            $table->decimal('price', 10, 2)->nullable();
            $table->boolean('negotiable')->default(false);

            // Self reference (category / subcategory)
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('products')
                  ->nullOnDelete();

            // Row type
            $table->enum('type', ['category', 'subcategory', 'product']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
