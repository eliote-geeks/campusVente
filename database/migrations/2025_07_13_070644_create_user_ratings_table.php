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
        Schema::create('user_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rater_id')->constrained('users')->onDelete('cascade'); // Celui qui note
            $table->foreignId('rated_user_id')->constrained('users')->onDelete('cascade'); // Celui qui est noté
            $table->tinyInteger('rating')->unsigned(); // Note de 1 à 5
            $table->text('comment')->nullable(); // Commentaire optionnel
            $table->enum('transaction_type', ['announcement', 'service', 'general'])->default('general');
            $table->foreignId('announcement_id')->nullable()->constrained()->onDelete('set null'); // Lié à une annonce si applicable
            $table->timestamps();
            
            // Contraintes
            $table->unique(['rater_id', 'rated_user_id', 'announcement_id']); // Un utilisateur ne peut noter qu'une fois par transaction
            
            // Index pour les performances
            $table->index(['rated_user_id', 'rating']);
            $table->index(['announcement_id']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_ratings');
    }
};
