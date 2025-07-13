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
        Schema::create('meeting_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['registered', 'confirmed', 'attended', 'absent', 'cancelled'])->default('registered');
            $table->text('message')->nullable(); // Message du participant lors de l'inscription
            $table->boolean('is_organizer')->default(false);
            $table->timestamps();
            
            // Contrainte unique pour éviter les doublons
            $table->unique(['meeting_id', 'user_id']);
            
            // Index
            $table->index(['meeting_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting_participants');
    }
};