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
        Schema::create('announcement_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('announcement_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Éviter les doublons - un utilisateur ne peut liker qu'une fois
            $table->unique(['user_id', 'announcement_id']);
            
            // Index pour les performances
            $table->index(['announcement_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcement_likes');
    }
};
