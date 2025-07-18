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
        // Ajouter 'dating_contact' au type enum des payments
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('promotional', 'meeting', 'commission', 'premium_dating', 'dating_contact') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Retirer 'dating_contact' de l'enum
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('promotional', 'meeting', 'commission', 'premium_dating') NOT NULL");
    }
};