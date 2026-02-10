<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'is_suspended')) {
                    $table->boolean('is_suspended')->default(false)->after('role');
                }
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'is_suspended')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_suspended');
            });
        }
    }
};
