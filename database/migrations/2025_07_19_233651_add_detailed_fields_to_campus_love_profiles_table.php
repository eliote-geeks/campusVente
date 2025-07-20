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
        Schema::table('campus_love_profiles', function (Blueprint $table) {
            // Descriptions détaillées pour le swipe
            $table->string('tagline')->nullable()->after('bio'); // Phrase d'accroche courte
            $table->text('about_me')->nullable()->after('tagline'); // Description longue personnalisée
            $table->text('looking_for_description')->nullable()->after('about_me'); // Ce que je recherche
            $table->text('fun_facts')->nullable()->after('looking_for_description'); // Faits amusants
            
            // Informations lifestyle détaillées
            $table->string('occupation')->nullable()->after('field_of_study'); // Profession/job étudiant
            $table->json('hobbies')->nullable()->after('interests'); // Hobbies détaillés séparés des intérêts
            $table->json('music_preferences')->nullable()->after('hobbies'); // Goûts musicaux
            $table->json('movie_preferences')->nullable()->after('music_preferences'); // Goûts cinéma
            $table->json('sport_activities')->nullable()->after('movie_preferences'); // Sports pratiqués
            $table->json('travel_places')->nullable()->after('sport_activities'); // Lieux de voyage
            
            // Préférences sociales
            $table->enum('social_style', ['introvert', 'extrovert', 'ambivert'])->nullable()->after('relationship_type');
            $table->enum('party_style', ['homebody', 'occasional', 'party_lover'])->nullable()->after('social_style');
            $table->enum('communication_style', ['texter', 'caller', 'face_to_face'])->nullable()->after('party_style');
            
            // Questions de compatibilité
            $table->enum('pets', ['love_pets', 'no_pets', 'allergic', 'neutral'])->nullable()->after('religion');
            $table->enum('kids_future', ['want_kids', 'no_kids', 'maybe', 'have_kids'])->nullable()->after('pets');
            $table->enum('fitness_level', ['very_active', 'moderately_active', 'lightly_active', 'sedentary'])->nullable()->after('kids_future');
            $table->enum('diet_type', ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'other'])->nullable()->after('fitness_level');
            
            // Informations pour le matching avancé
            $table->text('ideal_date_description')->nullable()->after('diet_type'); // Description du rendez-vous idéal
            $table->json('weekend_activities')->nullable()->after('ideal_date_description'); // Activités weekend
            $table->string('favorite_quote')->nullable()->after('weekend_activities'); // Citation favorite
            $table->json('deal_breakers')->nullable()->after('favorite_quote'); // Deal breakers
            $table->json('relationship_goals')->nullable()->after('deal_breakers'); // Objectifs relationnels
            
            // Métadonnées photos pour améliorer l'expérience
            $table->json('photo_descriptions')->nullable()->after('photos'); // Descriptions des photos
            $table->json('photo_locations')->nullable()->after('photo_descriptions'); // Lieux des photos
            $table->json('photo_tags')->nullable()->after('photo_locations'); // Tags des photos (selfie, travel, friends, etc.)
            
            // Informations de verification et qualité
            $table->boolean('has_verified_photos')->default(false)->after('is_verified'); // Photos vérifiées
            $table->boolean('has_social_media_linked')->default(false)->after('has_verified_photos'); // Réseaux sociaux liés
            $table->integer('response_rate')->default(0)->after('has_social_media_linked'); // Taux de réponse aux messages
            $table->timestamp('last_photo_update')->nullable()->after('last_active'); // Dernière mise à jour photo
            
            // Préférences d'affichage pour le swipe
            $table->boolean('show_occupation')->default(true)->after('show_university');
            $table->boolean('show_hobbies')->default(true)->after('show_occupation');
            $table->boolean('show_music_taste')->default(true)->after('show_hobbies');
            $table->boolean('show_travel_history')->default(true)->after('show_music_taste');
            
            // Index pour les performances de recherche
            $table->index(['social_style']);
            $table->index(['fitness_level']);
            $table->index(['has_verified_photos']);
            $table->index(['last_photo_update']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campus_love_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'tagline',
                'about_me',
                'looking_for_description',
                'fun_facts',
                'occupation',
                'hobbies',
                'music_preferences',
                'movie_preferences',
                'sport_activities',
                'travel_places',
                'social_style',
                'party_style',
                'communication_style',
                'pets',
                'kids_future',
                'fitness_level',
                'diet_type',
                'ideal_date_description',
                'weekend_activities',
                'favorite_quote',
                'deal_breakers',
                'relationship_goals',
                'photo_descriptions',
                'photo_locations',
                'photo_tags',
                'has_verified_photos',
                'has_social_media_linked',
                'response_rate',
                'last_photo_update',
                'show_occupation',
                'show_hobbies',
                'show_music_taste',
                'show_travel_history'
            ]);
        });
    }
};