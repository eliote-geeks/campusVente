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
        Schema::create('student_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('liker_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('liked_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_super_like')->default(false);
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['liker_id', 'liked_id']);
            $table->index(['liked_id']);
            $table->index(['created_at']);
            
            // Contrainte pour éviter les doublons
            $table->unique(['liker_id', 'liked_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_likes');
    }
};