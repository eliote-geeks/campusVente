<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user1_id',
        'user2_id',
        'matched_at',
        'conversation_started',
        'conversation_started_at',
        'whatsapp_url_user1',
        'whatsapp_url_user2',
    ];

    protected $casts = [
        'matched_at' => 'datetime',
        'conversation_started' => 'boolean',
        'conversation_started_at' => 'datetime',
    ];

    /**
     * Relation avec le premier utilisateur
     */
    public function user1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    /**
     * Relation avec le second utilisateur
     */
    public function user2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user2_id');
    }

    /**
     * Obtenir l'autre utilisateur du match
     */
    public function getOtherUser(int $userId): ?User
    {
        if ($this->user1_id === $userId) {
            return $this->user2;
        } elseif ($this->user2_id === $userId) {
            return $this->user1;
        }
        return null;
    }

    /**
     * Obtenir l'URL WhatsApp pour un utilisateur spécifique
     */
    public function getWhatsAppUrlForUser(int $userId): ?string
    {
        $otherUser = $this->getOtherUser($userId);
        if (!$otherUser) {
            return null;
        }

        $phone = $otherUser->whatsapp_number ?? $otherUser->phone;
        if (!$phone) {
            return null;
        }

        // Nettoyer le numéro
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // Créer un message d'introduction
        $message = "Salut ! Nous avons matché sur CampusLove 💕 Comment ça va ?";
        
        return "https://wa.me/{$phone}?text=" . urlencode($message);
    }

    /**
     * Marquer la conversation comme démarrée
     */
    public function markConversationStarted(): void
    {
        $this->conversation_started = true;
        $this->conversation_started_at = now();
        $this->save();
    }

    /**
     * Créer un match entre deux utilisateurs
     */
    public static function createMatch(int $user1Id, int $user2Id): self
    {
        // S'assurer que user1_id < user2_id pour éviter les doublons
        if ($user1Id > $user2Id) {
            [$user1Id, $user2Id] = [$user2Id, $user1Id];
        }

        return self::create([
            'user1_id' => $user1Id,
            'user2_id' => $user2Id,
            'matched_at' => now(),
        ]);
    }

    /**
     * Vérifier si deux utilisateurs ont déjà matché
     */
    public static function hasMatch(int $user1Id, int $user2Id): bool
    {
        // S'assurer que user1_id < user2_id pour la recherche
        if ($user1Id > $user2Id) {
            [$user1Id, $user2Id] = [$user2Id, $user1Id];
        }

        return self::where('user1_id', $user1Id)
            ->where('user2_id', $user2Id)
            ->exists();
    }
}