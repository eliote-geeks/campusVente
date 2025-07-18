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
            $table->date('birth_date')->nullable()->after('email');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('birth_date');
            $table->enum('looking_for', ['male', 'female', 'both'])->nullable()->after('gender');
            $table->text('bio_dating')->nullable()->after('bio');
            $table->json('interests')->nullable()->after('bio_dating');
            $table->json('dating_photos')->nullable()->after('interests');
            $table->string('whatsapp_number', 20)->nullable()->after('phone');
            $table->boolean('dating_active')->default(true)->after('whatsapp_number');
            $table->integer('max_distance')->default(50)->after('dating_active'); // en km
            $table->json('dating_preferences')->nullable()->after('max_distance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'birth_date',
                'gender',
                'looking_for',
                'bio_dating',
                'interests',
                'dating_photos',
                'whatsapp_number',
                'dating_active',
                'max_distance',
                'dating_preferences'
            ]);
        });
    }
};