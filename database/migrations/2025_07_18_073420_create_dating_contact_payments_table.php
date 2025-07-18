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
        Schema::create('dating_contact_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('dating_matches')->onDelete('cascade');
            $table->foreignId('payer_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('target_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade');
            $table->string('payment_ref');
            $table->decimal('amount', 10, 2); // 220 FCFA
            $table->string('currency', 3)->default('XAF');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['match_id', 'payer_user_id']);
            $table->index(['status', 'paid_at']);
            
            // Contrainte pour éviter les doublons
            $table->unique(['match_id', 'payer_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dating_contact_payments');
    }
};