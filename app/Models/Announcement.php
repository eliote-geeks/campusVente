<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'price',
        'type',
        'status',
        'location',
        'images',
        'user_id',
        'category_id',
        'is_urgent',
        'views'
    ];

    protected $casts = [
        'images' => 'array',
        'is_urgent' => 'boolean',
        'price' => 'decimal:2'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function likes()
    {
        return $this->hasMany(AnnouncementLike::class);
    }

    public function views()
    {
        return $this->hasMany(AnnouncementView::class);
    }

    public function isLikedBy($userId)
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }

    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    public function getViewsCountAttribute()
    {
        return $this->views()->count();
    }

    public function getPopularityScoreAttribute()
    {
        $likesWeight = 3;
        $viewsWeight = 1;
        $recencyWeight = 2;
        
        $likes = $this->likes_count ?? 0;
        $views = $this->views_count ?? 0;
        $daysSinceCreated = now()->diffInDays($this->created_at);
        $recencyScore = max(0, 30 - $daysSinceCreated); // Score décroissant avec le temps
        
        return ($likes * $likesWeight) + ($views * $viewsWeight) + ($recencyScore * $recencyWeight);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }
}