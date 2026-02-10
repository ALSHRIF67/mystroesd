<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'status')) {
                $table->string('status')->default('pending')->after('images')->index();
            }

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
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $cols = [];
            foreach (['status','approved_by','approved_at','published_at','rejection_reason','moderation_notes'] as $c) {
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
