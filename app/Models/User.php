<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'prenom', 
        'nom',
        'email',
        'password',
        'phone',
        'birth_date',
        'gender',
        'looking_for',
        'bio_dating',
        'interests',
        'dating_photos',
        'dating_photos_base64',
        'whatsapp_number',
        'dating_active',
        'max_distance',
        'dating_preferences',
        'university',
        'study_level',
        'field',
        'bio',
        'location',
        'is_student',
        'is_admin',
        'avatar',
        'avatar_base64',
        'campus_love_premium',
        'campus_love_premium_activated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_student' => 'boolean',
            'is_admin' => 'boolean',
            'verified' => 'boolean',
            'rating' => 'decimal:2',
            'last_seen' => 'datetime',
            'birth_date' => 'date',
            'dating_active' => 'boolean',
            'interests' => 'array',
            'dating_photos' => 'array',
            'dating_photos_base64' => 'array',
            'dating_preferences' => 'array',
            'campus_love_premium' => 'boolean',
            'campus_love_premium_activated_at' => 'datetime',
        ];
    }

    /**
     * Check if user is online (last seen within 5 minutes)
     */
    public function isOnline(): bool
    {
        return $this->last_seen && $this->last_seen->diffInMinutes(now()) <= 5;
    }

    /**
     * Relation avec les likes envoyés
     */
    public function sentLikes()
    {
        return $this->hasMany(StudentLike::class, 'liker_id');
    }

    /**
     * Relation avec les likes reçus
     */
    public function receivedLikes()
    {
        return $this->hasMany(StudentLike::class, 'liked_id');
    }

    /**
     * Relation avec les matchs (en tant que user1)
     */
    public function matchesAsUser1()
    {
        return $this->hasMany(StudentMatch::class, 'user1_id');
    }

    /**
     * Relation avec les matchs (en tant que user2)
     */
    public function matchesAsUser2()
    {
        return $this->hasMany(StudentMatch::class, 'user2_id');
    }

    /**
     * Obtenir tous les matchs de l'utilisateur
     */
    public function getAllMatches()
    {
        $matchesAsUser1 = $this->matchesAsUser1()->with(['user2'])->get();
        $matchesAsUser2 = $this->matchesAsUser2()->with(['user1'])->get();
        
        return $matchesAsUser1->merge($matchesAsUser2);
    }

    /**
     * Calculer l'âge à partir de la date de naissance
     */
    public function getAge(): ?int
    {
        return $this->birth_date ? $this->birth_date->diffInYears(now()) : null;
    }

    /**
     * Vérifier si l'utilisateur a un profil dating complet
     */
    public function hasDatingProfile(): bool
    {
        return !empty($this->birth_date) && 
               !empty($this->gender) && 
               !empty($this->looking_for) && 
               !empty($this->whatsapp_number) &&
               $this->dating_active;
    }

    /**
     * Obtenir les utilisateurs potentiels pour le dating
     */
    public static function getPotentialMatches(int $userId, int $limit = 10)
    {
        $user = self::find($userId);
        if (!$user || !$user->hasDatingProfile()) {
            return collect();
        }

        // Récupérer les IDs des utilisateurs déjà likés
        $likedUserIds = StudentLike::where('liker_id', $userId)->pluck('liked_id');
        
        // Récupérer les IDs des utilisateurs avec qui il y a déjà un match
        $matchedUserIds = StudentMatch::where('user1_id', $userId)
            ->orWhere('user2_id', $userId)
            ->get()
            ->map(function ($match) use ($userId) {
                return $match->user1_id === $userId ? $match->user2_id : $match->user1_id;
            });

        // Exclure l'utilisateur actuel, les utilisateurs déjà likés et les matchs existants
        $excludedIds = $likedUserIds->merge($matchedUserIds)->push($userId)->unique();

        $query = self::where('dating_active', true)
            ->whereNotIn('id', $excludedIds)
            ->whereNotNull('birth_date')
            ->whereNotNull('gender')
            ->whereNotNull('looking_for')
            ->whereNotNull('whatsapp_number');

        // Filtrer par préférences de genre
        if ($user->looking_for !== 'both') {
            $query->where('gender', $user->looking_for);
        }

        // Filtrer par qui recherche le genre de l'utilisateur
        $query->where(function ($q) use ($user) {
            $q->where('looking_for', $user->gender)
              ->orWhere('looking_for', 'both');
        });

        return $query->inRandomOrder()->limit($limit)->get();
    }

    // Relations pour le système de notation
    public function givenRatings()
    {
        return $this->hasMany(UserRating::class, 'rater_id');
    }

    public function receivedRatings()
    {
        return $this->hasMany(UserRating::class, 'rated_user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function completedPayments()
    {
        return $this->hasMany(Payment::class)->where('status', 'completed');
    }

    // Méthodes pour gérer les notes
    public function getAverageRatingAttribute()
    {
        return UserRating::getAverageRating($this->id);
    }

    public function getTotalRatingsAttribute()
    {
        return UserRating::getTotalRatings($this->id);
    }

    public function getRatingDistributionAttribute()
    {
        return UserRating::getRatingDistribution($this->id);
    }

    // Accessor pour avatar avec valeur par défaut
    public function getAvatarAttribute($value)
    {
        // Priorité à l'avatar base64
        if (!empty($this->attributes['avatar_base64'])) {
            return $this->attributes['avatar_base64'];
        }
        
        // Sinon, utiliser l'ancien système uniquement si pas de base64
        if ($value) {
            return $value;
        }
        
        // Avatar par défaut basé sur le nom
        $name = $this->name ?? 'U';
        $initials = strtoupper(substr($name, 0, 1));
        return "https://ui-avatars.com/api/?name={$initials}&background=6366f1&color=fff&size=128";
    }

    // Accessors pour les noms
    public function getPrenomAttribute()
    {
        // Si prenom existe, le retourner, sinon extraire du nom complet
        if (!empty($this->attributes['prenom'])) {
            return $this->attributes['prenom'];
        }
        
        $names = explode(' ', $this->name ?? '');
        return $names[0] ?? '';
    }

    public function getNomAttribute()
    {
        // Si nom existe, le retourner, sinon extraire du nom complet
        if (!empty($this->attributes['nom'])) {
            return $this->attributes['nom'];
        }
        
        $names = explode(' ', $this->name ?? '');
        return isset($names[1]) ? implode(' ', array_slice($names, 1)) : '';
    }

    // Articles phares (annonces les plus populaires) - TEMPORAIREMENT DÉSACTIVÉ
    // public function getFeaturedAnnouncementsAttribute()
    // {
    //     return $this->announcements()
    //         ->withCount(['likes', 'views'])
    //         ->orderByRaw('(likes_count * 3 + views_count * 1) DESC')
    //         ->limit(3)
    //         ->get();
    // }

    // Score de recommandation basé sur les notes et l'activité - TEMPORAIREMENT DÉSACTIVÉ
    // public function getRecommendationScoreAttribute()
    // {
    //     $avgRating = $this->average_rating;
    //     $totalRatings = $this->total_ratings;
    //     $totalAnnouncements = $this->announcements()->count();
    //     $totalLikes = $this->announcements()->withCount('likes')->sum('likes_count');
    //     
    //     // Formule de score : note moyenne * nombre d'évaluations + activité
    //     $ratingScore = $avgRating * min($totalRatings, 10); // Cap à 10 évaluations pour éviter l'inflation
    //     $activityScore = ($totalAnnouncements * 2) + ($totalLikes * 0.5);
    //     
    //     return round($ratingScore + $activityScore, 2);
    // }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    /**
     * Vérifier si l'utilisateur a un abonnement premium actif
     */
    public function hasActivePremiumSubscription(): bool
    {
        return $this->campus_love_premium && $this->campus_love_premium_activated_at;
    }

    /**
     * Update user's last seen timestamp
     */
    public function updateLastSeen(): void
    {
        $this->update(['last_seen' => now()]);
    }

    /**
     * Relations
     */
    public function meetings()
    {
        return $this->hasMany(Meeting::class);
    }

    public function participatingMeetings()
    {
        return $this->belongsToMany(Meeting::class, 'meeting_participants')
                    ->withPivot(['status', 'message', 'is_organizer'])
                    ->withTimestamps();
    }

    public function organizingMeetings()
    {
        return $this->participatingMeetings()->wherePivot('is_organizer', true);
    }
}
