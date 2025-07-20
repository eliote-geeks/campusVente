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
            // Vérifier et ajouter seulement les champs qui n'existent pas
            if (!Schema::hasColumn('users', 'campus_love_access')) {
                $table->boolean('campus_love_access')->default(false)->after('dating_preferences');
            }
            if (!Schema::hasColumn('users', 'campus_love_activated_at')) {
                $table->timestamp('campus_love_activated_at')->nullable()->after('campus_love_access');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->string('address')->nullable()->after('location');
            }
            if (!Schema::hasColumn('users', 'total_likes_sent')) {
                $table->integer('total_likes_sent')->default(0)->after('address');
            }
            if (!Schema::hasColumn('users', 'total_likes_received')) {
                $table->integer('total_likes_received')->default(0)->after('total_likes_sent');
            }
            if (!Schema::hasColumn('users', 'total_matches')) {
                $table->integer('total_matches')->default(0)->after('total_likes_received');
            }
            if (!Schema::hasColumn('users', 'conversations_started')) {
                $table->integer('conversations_started')->default(0)->after('total_matches');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'campus_love_access',
                'campus_love_activated_at', 
                'address',
                'total_likes_sent',
                'total_likes_received',
                'total_matches',
                'conversations_started'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
