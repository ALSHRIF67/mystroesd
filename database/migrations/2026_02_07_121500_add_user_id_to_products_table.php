<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'user_id')) {
                // Add nullable user_id; do not assume FK exists to avoid errors
                $table->unsignedBigInteger('user_id')->nullable()->after('images');
            }
        });

        // Add foreign key only if users table exists and column was added
        if (Schema::hasTable('users') && Schema::hasColumn('products', 'user_id')) {
            // Check if the foreign key already exists is DB-specific; attempt to add safely
            Schema::table('products', function (Blueprint $table) {
                // Use constrained if possible (Laravel will create FK)
                try {
                    $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
                } catch (\Throwable $e) {
                    // ignore FK errors (some DBs may not allow adding FK here)
                }
            });
        }
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'user_id')) {
                // drop foreign if exists; some DB drivers will ignore if not present
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Throwable $e) {
                    // ignore
                }
                $table->dropColumn('user_id');
            }
        });
    }
};
