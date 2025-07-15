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
        'university',
        'study_level',
        'field',
        'bio',
        'location',
        'is_student',
        'avatar',
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
            'verified' => 'boolean',
            'rating' => 'decimal:2',
            'last_seen' => 'datetime',
        ];
    }

    /**
     * Check if user is online (last seen within 5 minutes)
     */
    public function isOnline(): bool
    {
        return $this->last_seen && $this->last_seen->diffInMinutes(now()) <= 5;
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
