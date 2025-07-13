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
        Schema::create('announcement_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('announcement_id')->constrained()->onDelete('cascade');
            $table->string('ip_address', 45)->nullable(); // Pour les utilisateurs non connectés
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            // Index pour les performances et analytics
            $table->index(['announcement_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['ip_address', 'announcement_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcement_views');
    }
};
