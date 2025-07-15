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
        Schema::table('payments', function (Blueprint $table) {
            // Modifier la colonne monetbil_payment_url pour être de type TEXT et nullable
            $table->text('monetbil_payment_url')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Revenir à STRING(255) si besoin
            $table->string('monetbil_payment_url', 255)->change();
        });
    }
};
