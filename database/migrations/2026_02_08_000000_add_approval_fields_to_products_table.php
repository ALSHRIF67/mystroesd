<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('status');
            }
            if (!Schema::hasColumn('products', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('products', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('products', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('published_at');
            }
            if (!Schema::hasColumn('products', 'moderation_notes')) {
                $table->text('moderation_notes')->nullable()->after('rejection_reason');
            }

            // add index for queries
            $table->index('approved_at');
            $table->index('published_at');
            $table->index('approved_by');
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            foreach (['moderation_notes','rejection_reason','published_at','approved_at','approved_by'] as $col) {
                if (Schema::hasColumn('products', $col)) {
                    try { $table->dropColumn($col); } catch (\Throwable $e) { }
                }
            }
        });
    }
};
