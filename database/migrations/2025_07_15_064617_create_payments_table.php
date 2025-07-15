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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('announcement_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('meeting_id')->nullable()->constrained()->onDelete('set null');
            
            // Informations du paiement
            $table->string('payment_ref')->unique();
            $table->string('transaction_id')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('XAF');
            $table->enum('type', ['promotional', 'meeting', 'commission', 'other'])->default('promotional');
            
            // Statut du paiement
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            
            // Données Monetbil
            $table->json('monetbil_data')->nullable();
            $table->string('monetbil_payment_url')->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            // Notes et commentaires
            $table->text('notes')->nullable();
            $table->text('failure_reason')->nullable();
            
            $table->timestamps();
            
            // Index pour les recherches fréquentes
            $table->index(['user_id', 'status']);
            $table->index(['payment_ref']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
