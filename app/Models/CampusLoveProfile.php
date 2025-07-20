<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class CampusLoveProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'display_name',
        'bio',
        'tagline',
        'about_me',
        'looking_for_description',
        'fun_facts',
        'birth_date',
        'gender',
        'looking_for',
        'city',
        'region',
        'latitude',
        'longitude',
        'university',
        'study_level',
        'field_of_study',
        'occupation',
        'graduation_year',
        'min_age',
        'max_age',
        'interests',
        'hobbies',
        'music_preferences',
        'movie_preferences',
        'sport_activities',
        'travel_places',
        'languages',
        'photos',
        'profile_photo',
        'photo_descriptions',
        'photo_locations',
        'photo_tags',
        'is_active',
        'is_verified',
        'has_verified_photos',
        'has_social_media_linked',
        'response_rate',
        'show_age',
        'show_distance',
        'show_university',
        'show_occupation',
        'show_hobbies',
        'show_music_taste',
        'show_travel_history',
        'relationship_type',
        'social_style',
        'party_style',
        'communication_style',
        'height',
        'smoking',
        'drinking',
        'religion',
        'pets',
        'kids_future',
        'fitness_level',
        'diet_type',
        'ideal_date_description',
        'weekend_activities',
        'favorite_quote',
        'deal_breakers',
        'relationship_goals',
        'last_active',
        'last_photo_update',
        'profile_completed_at',
        'profile_completion_percentage'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'interests' => 'array',
        'hobbies' => 'array',
        'music_preferences' => 'array',
        'movie_preferences' => 'array',
        'sport_activities' => 'array',
        'travel_places' => 'array',
        'languages' => 'array',
        'photos' => 'array',
        'photo_descriptions' => 'array',
        'photo_locations' => 'array',
        'photo_tags' => 'array',
        'weekend_activities' => 'array',
        'deal_breakers' => 'array',
        'relationship_goals' => 'array',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'has_verified_photos' => 'boolean',
        'has_social_media_linked' => 'boolean',
        'show_age' => 'boolean',
        'show_distance' => 'boolean',
        'show_university' => 'boolean',
        'show_occupation' => 'boolean',
        'show_hobbies' => 'boolean',
        'show_music_taste' => 'boolean',
        'show_travel_history' => 'boolean',
        'last_active' => 'datetime',
        'last_photo_update' => 'datetime',
        'profile_completed_at' => 'datetime',
        'latitude' => 'float',
        'longitude' => 'float',
        'min_age' => 'integer',
        'max_age' => 'integer',
        'response_rate' => 'integer',
        'profile_completion_percentage' => 'integer',
        'graduation_year' => 'integer'
    ];

    protected $hidden = [
        'latitude',
        'longitude'
    ];

    protected $appends = [
        'age',
        'photos_urls',
        'profile_photo_url',
        'is_online',
        'swipe_info',
        'lifestyle_summary'
    ];

    // Relations
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accesseurs
    public function getAgeAttribute(): ?int
    {
        if (!$this->birth_date) {
            return null;
        }
        return $this->birth_date->age;
    }

    public function getPhotosUrlsAttribute(): array
    {
        if (!$this->photos) {
            return [];
        }

        return array_map(function ($photo) {
            if (str_starts_with($photo, 'http')) {
                return $photo;
            }
            return Storage::url($photo);
        }, $this->photos);
    }

    public function getProfilePhotoUrlAttribute(): ?string
    {
        if (!$this->profile_photo) {
            return null;
        }

        if (str_starts_with($this->profile_photo, 'http')) {
            return $this->profile_photo;
        }

        return Storage::url($this->profile_photo);
    }

    public function getIsOnlineAttribute(): bool
    {
        if (!$this->last_active) {
            return false;
        }
        return $this->last_active->diffInMinutes(now()) <= 15;
    }

    public function getSwipeInfoAttribute(): array
    {
        $info = [];
        
        // Informations principales pour le swipe
        if ($this->tagline) {
            $info['tagline'] = $this->tagline;
        }
        
        if ($this->occupation && $this->show_occupation) {
            $info['occupation'] = $this->occupation;
        }
        
        if ($this->university && $this->show_university) {
            $info['education'] = $this->study_level . ' en ' . $this->field_of_study . ' à ' . $this->university;
        }
        
        if ($this->hobbies && $this->show_hobbies && count($this->hobbies) > 0) {
            $info['top_hobbies'] = array_slice($this->hobbies, 0, 3);
        }
        
        if ($this->music_preferences && $this->show_music_taste && count($this->music_preferences) > 0) {
            $info['music_taste'] = array_slice($this->music_preferences, 0, 2);
        }
        
        if ($this->travel_places && $this->show_travel_history && count($this->travel_places) > 0) {
            $info['travel_highlights'] = array_slice($this->travel_places, 0, 2);
        }
        
        if ($this->fun_facts) {
            $info['fun_fact'] = $this->fun_facts;
        }
        
        return $info;
    }

    public function getLifestyleSummaryAttribute(): array
    {
        $summary = [];
        
        if ($this->social_style) {
            $summary['social_style'] = $this->social_style;
        }
        
        if ($this->fitness_level) {
            $summary['fitness'] = $this->fitness_level;
        }
        
        if ($this->pets) {
            $summary['pets'] = $this->pets;
        }
        
        if ($this->diet_type) {
            $summary['diet'] = $this->diet_type;
        }
        
        if ($this->smoking) {
            $summary['smoking'] = $this->smoking;
        }
        
        if ($this->drinking) {
            $summary['drinking'] = $this->drinking;
        }
        
        return $summary;
    }

    // Mutateurs
    public function setPhotosAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['photos'] = json_encode($value);
        } else {
            $this->attributes['photos'] = $value;
        }
    }

    public function setInterestsAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['interests'] = json_encode($value);
        } else {
            $this->attributes['interests'] = $value;
        }
    }

    public function setLanguagesAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['languages'] = json_encode($value);
        } else {
            $this->attributes['languages'] = $value;
        }
    }

    // Méthodes
    public function updateLastActive(): void
    {
        $this->update(['last_active' => now()]);
    }

    public function calculateCompletionPercentage(): int
    {
        $requiredFields = [
            'display_name',
            'bio',
            'birth_date',
            'gender',
            'looking_for',
            'city',
            'university',
            'study_level',
            'field_of_study',
            'profile_photo'
        ];

        $optionalFields = [
            'interests',
            'languages',
            'height',
            'relationship_type'
        ];

        $completed = 0;
        $total = count($requiredFields) + count($optionalFields);

        // Champs requis (poids 1)
        foreach ($requiredFields as $field) {
            if (!empty($this->$field)) {
                $completed++;
            }
        }

        // Champs optionnels (poids 1)
        foreach ($optionalFields as $field) {
            if (!empty($this->$field)) {
                $completed++;
            }
        }

        // Bonus pour les photos (poids 0.5 par photo, max 2)
        $photosCount = is_array($this->photos) ? count($this->photos) : 0;
        $photosBonus = min($photosCount * 0.5, 2);
        $completed += $photosBonus;
        $total += 2; // max bonus photos

        $percentage = round(($completed / $total) * 100);
        
        // Mettre à jour le pourcentage
        $this->update(['profile_completion_percentage' => $percentage]);

        // Marquer comme complété si >= 80%
        if ($percentage >= 80 && !$this->profile_completed_at) {
            $this->update(['profile_completed_at' => now()]);
        }

        return $percentage;
    }

    public function addPhoto(string $photoPath): void
    {
        $photos = $this->photos ?? [];
        $photos[] = $photoPath;
        
        // Limiter à 6 photos maximum
        if (count($photos) > 6) {
            // Supprimer la plus ancienne photo du stockage
            $oldestPhoto = array_shift($photos);
            if (!str_starts_with($oldestPhoto, 'http')) {
                Storage::delete($oldestPhoto);
            }
        }
        
        $this->update(['photos' => $photos]);
        
        // Si c'est la première photo, en faire la photo de profil
        if (!$this->profile_photo) {
            $this->update(['profile_photo' => $photoPath]);
        }
    }

    public function removePhoto(string $photoPath): void
    {
        $photos = $this->photos ?? [];
        $photos = array_filter($photos, fn($photo) => $photo !== $photoPath);
        
        // Supprimer du stockage si ce n'est pas une URL externe
        if (!str_starts_with($photoPath, 'http')) {
            Storage::delete($photoPath);
        }
        
        $this->update(['photos' => array_values($photos)]);
        
        // Si c'était la photo de profil, prendre la première disponible
        if ($this->profile_photo === $photoPath) {
            $newProfilePhoto = !empty($photos) ? $photos[0] : null;
            $this->update(['profile_photo' => $newProfilePhoto]);
        }
    }

    public function setProfilePhoto(string $photoPath): void
    {
        $this->update(['profile_photo' => $photoPath]);
        
        // S'assurer que la photo est dans la liste des photos
        $photos = $this->photos ?? [];
        if (!in_array($photoPath, $photos)) {
            $this->addPhoto($photoPath);
        }
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCompleted($query)
    {
        return $query->whereNotNull('profile_completed_at');
    }

    public function scopeInCity($query, string $city)
    {
        return $query->where('city', $city);
    }

    public function scopeInRegion($query, string $region)
    {
        return $query->where('region', $region);
    }

    public function scopeByGender($query, string $gender)
    {
        return $query->where('gender', $gender);
    }

    public function scopeLookingFor($query, string $lookingFor)
    {
        return $query->where('looking_for', $lookingFor)
                     ->orWhere('looking_for', 'both');
    }

    public function scopeInAgeRange($query, int $minAge, int $maxAge)
    {
        $minBirthDate = now()->subYears($maxAge)->format('Y-m-d');
        $maxBirthDate = now()->subYears($minAge)->format('Y-m-d');
        
        return $query->whereBetween('birth_date', [$minBirthDate, $maxBirthDate]);
    }

    public function scopeOnline($query)
    {
        return $query->where('last_active', '>=', now()->subMinutes(15));
    }

    public function scopeRecentlyActive($query)
    {
        return $query->where('last_active', '>=', now()->subHours(24));
    }
}