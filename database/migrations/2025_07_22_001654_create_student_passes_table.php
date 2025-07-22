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
        Schema::create('student_passes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('passer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('passed_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Un utilisateur ne peut passer le même profil qu'une seule fois
            $table->unique(['passer_id', 'passed_id']);
            
            // Index pour optimiser les requêtes
            $table->index(['passer_id', 'created_at']);
            $table->index(['passed_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_passes');
    }
};
