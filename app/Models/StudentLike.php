<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentLike extends Model
{
    use HasFactory;

    protected $fillable = [
        'liker_id',
        'liked_id',
        'is_super_like',
    ];

    protected $casts = [
        'is_super_like' => 'boolean',
    ];

    /**
     * Relation avec l'utilisateur qui like
     */
    public function liker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'liker_id');
    }

    /**
     * Relation avec l'utilisateur qui est liké
     */
    public function liked(): BelongsTo
    {
        return $this->belongsTo(User::class, 'liked_id');
    }

    /**
     * Créer un like et vérifier s'il y a match
     */
    public static function createLike(int $likerId, int $likedId, bool $isSuperLike = false): array
    {
        // Vérifier si le like existe déjà
        $existingLike = self::where('liker_id', $likerId)
            ->where('liked_id', $likedId)
            ->first();

        if ($existingLike) {
            return [
                'success' => false,
                'message' => 'Vous avez déjà liké cette personne',
                'is_match' => false
            ];
        }

        // Créer le like
        $like = self::create([
            'liker_id' => $likerId,
            'liked_id' => $likedId,
            'is_super_like' => $isSuperLike,
        ]);

        // Vérifier s'il y a un like reciproque pour créer un match
        $reciprocalLike = self::where('liker_id', $likedId)
            ->where('liked_id', $likerId)
            ->first();

        $isMatch = false;
        $match = null;

        if ($reciprocalLike) {
            // C'est un match ! Créer l'enregistrement de match
            $match = StudentMatch::createMatch($likerId, $likedId);
            $isMatch = true;
        }

        return [
            'success' => true,
            'message' => $isMatch ? 'C\'est un match ! 💕' : 'Like envoyé avec succès',
            'is_match' => $isMatch,
            'match' => $match,
            'like' => $like
        ];
    }

    /**
     * Vérifier si un utilisateur a liké un autre
     */
    public static function hasLiked(int $likerId, int $likedId): bool
    {
        return self::where('liker_id', $likerId)
            ->where('liked_id', $likedId)
            ->exists();
    }

    /**
     * Obtenir tous les likes reçus par un utilisateur
     */
    public static function getReceivedLikes(int $userId)
    {
        return self::where('liked_id', $userId)
            ->with('liker')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Obtenir tous les likes envoyés par un utilisateur
     */
    public static function getSentLikes(int $userId)
    {
        return self::where('liker_id', $userId)
            ->with('liked')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}