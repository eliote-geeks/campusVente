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
            
            // Index pour optimiser les requêtes
            $table->index(['user1_id', 'user2_id']);
            $table->index(['is_match', 'conversation_unlocked']);
            
            // Contrainte pour éviter les doublons
            $table->unique(['user1_id', 'user2_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dating_matches');
    }
};