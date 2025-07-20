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
        Schema::create('campus_love_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Informations de base
            $table->string('display_name')->nullable();
            $table->text('bio')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('looking_for', ['male', 'female', 'both'])->nullable();
            
            // Localisation
            $table->string('city')->nullable();
            $table->string('region')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Éducation
            $table->string('university')->nullable();
            $table->string('study_level')->nullable(); // Licence 1, Master 2, etc.
            $table->string('field_of_study')->nullable(); // Informatique, Médecine, etc.
            $table->year('graduation_year')->nullable();
            
            // Préférences de matching
            $table->integer('min_age')->default(18);
            $table->integer('max_age')->default(30);
            $table->integer('max_distance')->default(50); // en km
            
            // Intérêts et hobbies
            $table->json('interests')->nullable(); // Array d'intérêts
            $table->json('languages')->nullable(); // Langues parlées
            
            // Photos
            $table->json('photos')->nullable(); // Array des URLs des photos
            $table->string('profile_photo')->nullable(); // Photo principale
            
            // Statut et visibilité
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->boolean('show_age')->default(true);
            $table->boolean('show_distance')->default(true);
            $table->boolean('show_university')->default(true);
            
            // Informations lifestyle
            $table->enum('relationship_type', ['serious', 'casual', 'friendship', 'both'])->default('both');
            $table->string('height')->nullable(); // ex: "170 cm"
            $table->enum('smoking', ['never', 'socially', 'regularly'])->nullable();
            $table->enum('drinking', ['never', 'socially', 'regularly'])->nullable();
            $table->string('religion')->nullable();
            
            // Métadonnées
            $table->timestamp('last_active')->nullable();
            $table->timestamp('profile_completed_at')->nullable();
            $table->integer('profile_completion_percentage')->default(0);
            
            $table->timestamps();
            
            // Index pour les performances
            $table->index(['user_id']);
            $table->index(['is_active']);
            $table->index(['city', 'region']);
            $table->index(['gender', 'looking_for']);
            $table->index(['last_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campus_love_profiles');
    }
};