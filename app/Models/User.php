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

    /**
     * Update user's last seen timestamp
     */
    public function updateLastSeen(): void
    {
        $this->update(['last_seen' => now()]);
    }
}
