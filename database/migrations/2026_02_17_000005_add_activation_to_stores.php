<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('stores', function (Blueprint $table) {
            if (!Schema::hasColumn('stores', 'system_enabled')) {
                $table->boolean('system_enabled')->default(false)->after('selling_mode');
            }
            if (!Schema::hasColumn('stores', 'activated_at')) {
                $table->timestamp('activated_at')->nullable()->after('system_enabled');
            }
        });
    }

    public function down()
    {
        Schema::table('stores', function (Blueprint $table) {
            if (Schema::hasColumn('stores', 'activated_at')) {
                $table->dropColumn('activated_at');
            }
            if (Schema::hasColumn('stores', 'system_enabled')) {
                $table->dropColumn('system_enabled');
            }
        });
    }
};
