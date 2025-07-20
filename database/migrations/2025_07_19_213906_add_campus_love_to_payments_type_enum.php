<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modifier l'enum pour inclure 'campus_love'
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('promotional', 'meeting', 'commission', 'campus_love', 'other') DEFAULT 'promotional'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revenir à l'enum original
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('promotional', 'meeting', 'commission', 'other') DEFAULT 'promotional'");
    }
};