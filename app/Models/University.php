<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class University extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'acronym',
        'city',
        'region',
        'type',
        'founded',
        'description',
        'website',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'founded' => 'integer',
    ];

    /**
     * Get users from this university
     */
    public function users()
    {
        return $this->hasMany(User::class, 'university', 'name');
    }

    /**
     * Scope to get only active universities
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope to get universities by region
     */
    public function scopeByRegion($query, $region)
    {
        return $query->where('region', $region);
    }

    /**
     * Scope to get universities by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}