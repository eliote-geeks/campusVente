<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnnouncementView extends Model
{
    protected $table = 'announcement_views';
    
    protected $fillable = [
        'user_id',
        'announcement_id',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function announcement(): BelongsTo
    {
        return $this->belongsTo(Announcement::class);
    }

    public static function recordView($announcementId, $userId = null, $ipAddress = null, $userAgent = null)
    {
        // Éviter de compter plusieurs vues de la même IP/utilisateur dans la même heure
        $query = static::where('announcement_id', $announcementId)
            ->where('created_at', '>', now()->subHour());

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('ip_address', $ipAddress);
        }

        if (!$query->exists()) {
            return static::create([
                'announcement_id' => $announcementId,
                'user_id' => $userId,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent
            ]);
        }

        return null;
    }
}
