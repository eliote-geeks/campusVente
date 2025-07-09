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
            $table->string('phone')->nullable();
            $table->string('university')->nullable();
            $table->string('study_level')->nullable();
            $table->string('field')->nullable();
            $table->text('bio')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_student')->default(true);
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->string('avatar')->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamp('last_seen')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'university',
                'study_level',
                'field',
                'bio',
                'location',
                'is_student',
                'rating',
                'avatar',
                'verified',
                'last_seen'
            ]);
        });
    }
};