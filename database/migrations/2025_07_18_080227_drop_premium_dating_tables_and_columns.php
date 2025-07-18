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
        // Supprimer les tables liées au dating
        Schema::dropIfExists('dating_contact_payments');
        Schema::dropIfExists('dating_matches');
        
        // Supprimer les types premium_dating et dating_contact de l'enum payments
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('promotional', 'meeting', 'commission') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recréer les types dans l'enum payments
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('promotional', 'meeting', 'commission', 'premium_dating', 'dating_contact') NOT NULL");
        
        // Recréer les tables (structure de base)
        Schema::create('dating_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user1_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user2_id')->constrained('users')->onDelete('cascade');
            $table->boolean('user1_liked')->default(false);
            $table->boolean('user2_liked')->default(false);
            $table->boolean('is_match')->default(false);
            $table->timestamp('matched_at')->nullable();
            $table->boolean('user1_paid_contact')->default(false);
            $table->boolean('user2_paid_contact')->default(false);
            $table->boolean('conversation_unlocked')->default(false);
            $table->timestamp('conversation_unlocked_at')->nullable();
            $table->string('whatsapp_redirect_url')->nullable();
            $table->timestamps();
            
            $table->index(['user1_id', 'user2_id']);
            $table->index(['is_match', 'conversation_unlocked']);
            $table->unique(['user1_id', 'user2_id']);
        });
        
        Schema::create('dating_contact_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('dating_matches')->onDelete('cascade');
            $table->foreignId('payer_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('target_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade');
            $table->string('payment_ref');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('XAF');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            $table->index(['match_id', 'payer_user_id']);
            $table->index(['status', 'paid_at']);
            $table->unique(['match_id', 'payer_user_id']);
        });
    }
};