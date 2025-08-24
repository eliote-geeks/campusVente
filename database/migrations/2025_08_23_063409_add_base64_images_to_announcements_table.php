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
        Schema::table('announcements', function (Blueprint $table) {
            // Ajouter une colonne JSON pour stocker les images en base64
            $table->json('images_base64')->nullable()->after('images');
            
            // Ajouter une colonne pour la date d'expiration (7 jours après création)
            $table->timestamp('expires_at')->nullable()->after('created_at');
            
            // Index sur la date d'expiration pour optimiser la suppression automatique
            $table->index('expires_at');
        });
        
        // Mettre à jour les annonces existantes avec une date d'expiration
        DB::table('announcements')
            ->whereNull('expires_at')
            ->update(['expires_at' => DB::raw('DATE_ADD(created_at, INTERVAL 7 DAY)')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn(['images_base64', 'expires_at']);
            $table->dropIndex(['expires_at']);
        });
    }
};
