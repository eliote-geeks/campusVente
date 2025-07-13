<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'type',
        'status',
        'meeting_date',
        'location',
        'address',
        'max_participants',
        'price',
        'is_free',
        'is_online',
        'online_link',
        'images',
        'requirements',
        'contact_info',
        'is_featured',
        'views',
        'participants_count',
        'user_id',
        'category_id'
    ];

    protected $casts = [
        'meeting_date' => 'datetime',
        'price' => 'decimal:2',
        'is_free' => 'boolean',
        'is_online' => 'boolean',
        'is_featured' => 'boolean',
        'views' => 'integer',
        'participants_count' => 'integer',
        'max_participants' => 'integer',
        'images' => 'array'
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'meeting_participants')
                    ->withPivot(['status', 'message', 'is_organizer'])
                    ->withTimestamps();
    }

    public function confirmedParticipants()
    {
        return $this->participants()->wherePivot('status', 'confirmed');
    }

    public function organizers()
    {
        return $this->participants()->wherePivot('is_organizer', true);
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('meeting_date', '>', now())
                    ->where('status', 'upcoming');
    }

    public function scopeOngoing($query)
    {
        return $query->where('status', 'ongoing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByLocation($query, $location)
    {
        return $query->where('location', 'like', '%' . $location . '%');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    public function scopeOnline($query)
    {
        return $query->where('is_online', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', '%' . $search . '%')
              ->orWhere('description', 'like', '%' . $search . '%')
              ->orWhere('location', 'like', '%' . $search . '%');
        });
    }

    // Accessors & Mutators
    public function getFormattedDateAttribute()
    {
        return $this->meeting_date->format('d/m/Y à H:i');
    }

    public function getFormattedPriceAttribute()
    {
        return $this->is_free ? 'Gratuit' : number_format($this->price, 0, ',', ' ') . ' FCFA';
    }

    public function getTimeUntilMeetingAttribute()
    {
        return $this->meeting_date->diffForHumans();
    }

    public function getAvailableSpotsAttribute()
    {
        if (!$this->max_participants) {
            return null;
        }
        return max(0, $this->max_participants - $this->participants_count);
    }

    public function getIsFullAttribute()
    {
        if (!$this->max_participants) {
            return false;
        }
        return $this->participants_count >= $this->max_participants;
    }

    public function getCanJoinAttribute()
    {
        return $this->status === 'upcoming' && 
               $this->meeting_date > now() && 
               !$this->is_full;
    }

    public function getTypeIconAttribute()
    {
        $icons = [
            'study_group' => '📚',
            'networking' => '🤝',
            'party' => '🎉',
            'sport' => '⚽',
            'cultural' => '🎭',
            'conference' => '🎤',
            'workshop' => '🔧',
            'other' => '📅'
        ];

        return $icons[$this->type] ?? '📅';
    }

    public function getTypeLabelAttribute()
    {
        $labels = [
            'study_group' => 'Groupe d\'étude',
            'networking' => 'Networking',
            'party' => 'Soirée/Fête',
            'sport' => 'Sport',
            'cultural' => 'Culturel',
            'conference' => 'Conférence',
            'workshop' => 'Atelier',
            'other' => 'Autre'
        ];

        return $labels[$this->type] ?? 'Autre';
    }

    public function getStatusColorAttribute()
    {
        $colors = [
            'upcoming' => 'primary',
            'ongoing' => 'success',
            'completed' => 'secondary',
            'cancelled' => 'danger'
        ];

        return $colors[$this->status] ?? 'secondary';
    }

    public function getStatusLabelAttribute()
    {
        $labels = [
            'upcoming' => 'À venir',
            'ongoing' => 'En cours',
            'completed' => 'Terminé',
            'cancelled' => 'Annulé'
        ];

        return $labels[$this->status] ?? 'Inconnu';
    }

    // Methods
    public function updateParticipantsCount()
    {
        $this->participants_count = $this->participants()->count();
        $this->save();
    }

    public function isParticipant($userId)
    {
        return $this->participants()->where('user_id', $userId)->exists();
    }

    public function isOrganizer($userId)
    {
        return $this->participants()
                    ->where('user_id', $userId)
                    ->wherePivot('is_organizer', true)
                    ->exists();
    }

    public function addParticipant($userId, $message = null, $isOrganizer = false)
    {
        if ($this->isParticipant($userId)) {
            return false;
        }

        $this->participants()->attach($userId, [
            'status' => 'registered',
            'message' => $message,
            'is_organizer' => $isOrganizer
        ]);

        $this->updateParticipantsCount();
        return true;
    }

    public function removeParticipant($userId)
    {
        $removed = $this->participants()->detach($userId);
        if ($removed) {
            $this->updateParticipantsCount();
        }
        return $removed > 0;
    }

    public function updateParticipantStatus($userId, $status)
    {
        return $this->participants()->updateExistingPivot($userId, ['status' => $status]);
    }
}