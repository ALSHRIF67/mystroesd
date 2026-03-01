<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
// database/migrations/xxxx_xx_xx_create_notification_channels_table.php
Schema::create('notification_channels', function (Blueprint $table) {
    $table->id();
    $table->string('name');        // email, sms, whatsapp
    $table->boolean('enabled')->default(true);
    $table->json('settings')->nullable(); // for future use (credentials)
    $table->timestamps();
});
    }

// Seed with default channels
public function run()
{
    DB::table('notification_channels')->insert([
        ['name' => 'email', 'enabled' => true],
        ['name' => 'sms', 'enabled' => false],
        ['name' => 'whatsapp', 'enabled' => false],
    ]);
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_channels');
    }
};
        