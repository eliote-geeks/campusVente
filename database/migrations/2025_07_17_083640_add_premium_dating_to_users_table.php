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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_premium_dating')->default(false)->after('email_verified_at');
            $table->timestamp('premium_dating_expires_at')->nullable()->after('is_premium_dating');
            $table->json('dating_profile')->nullable()->after('premium_dating_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_premium_dating', 'premium_dating_expires_at', 'dating_profile']);
        });
    }
};
