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
        Schema::table('announcements', function (Blueprint $table) {
            $table->boolean('is_promotional')->default(false)->after('is_urgent');
            $table->decimal('promotional_fee', 10, 2)->nullable()->after('is_promotional');
            $table->timestamp('promoted_at')->nullable()->after('promotional_fee');
            $table->integer('promotional_views')->default(0)->after('promoted_at');
            $table->timestamp('promotion_expires_at')->nullable()->after('promotional_views');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn([
                'is_promotional',
                'promotional_fee',
                'promoted_at',
                'promotional_views',
                'promotion_expires_at'
            ]);
        });
    }
};
