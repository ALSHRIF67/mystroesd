<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->unsignedBigInteger('plan_id')->nullable()->index();
            $table->enum('selling_mode', ['whatsapp','system'])->default('whatsapp')->index();
            $table->string('name')->nullable();
            $table->text('whatsapp')->nullable();
            $table->timestamps();

            $table->foreign('plan_id')->references('id')->on('plans')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('stores');
    }
};
