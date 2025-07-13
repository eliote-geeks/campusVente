<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRating extends Model
{
    protected $fillable = [
        'rater_id',
        'rated_user_id', 
        'rating',
        'comment',
        'transaction_type',
        'announcement_id'
    ];

    protected $casts = [
        'rating' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function rater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rater_id');
    }

    public function ratedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rated_user_id');
    }

    public function announcement(): BelongsTo
    {
        return $this->belongsTo(Announcement::class);
    }

    // Scopes pour faciliter les requêtes
    public function scopeForUser($query, $userId)
    {
        return $query->where('rated_user_id', $userId);
    }

    public function scopeByRater($query, $raterId)
    {
        return $query->where('rater_id', $raterId);
    }

    public function scopeWithRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeRecentFirst($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // Méthodes utilitaires statiques
    public static function getAverageRating($userId)
    {
        return static::where('rated_user_id', $userId)->avg('rating') ?: 0;
    }

    public static function getTotalRatings($userId)
    {
        return static::where('rated_user_id', $userId)->count();
    }

    public static function getRatingDistribution($userId)
    {
        return static::where('rated_user_id', $userId)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->pluck('count', 'rating')
            ->toArray();
    }

    public static function canRate($raterId, $ratedUserId, $announcementId = null)
    {
        $query = static::where('rater_id', $raterId)
            ->where('rated_user_id', $ratedUserId);
            
        if ($announcementId) {
            $query->where('announcement_id', $announcementId);
        } else {
            $query->whereNull('announcement_id');
        }
        
        return !$query->exists();
    }
}