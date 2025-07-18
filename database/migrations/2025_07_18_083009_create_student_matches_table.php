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
        Schema::create('student_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user1_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user2_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('matched_at');
            $table->boolean('conversation_started')->default(false);
            $table->timestamp('conversation_started_at')->nullable();
            $table->string('whatsapp_url_user1')->nullable();
            $table->string('whatsapp_url_user2')->nullable();
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['user1_id', 'user2_id']);
            $table->index(['matched_at']);
            
            // Contrainte pour éviter les doublons
            $table->unique(['user1_id', 'user2_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_matches');
    }
};