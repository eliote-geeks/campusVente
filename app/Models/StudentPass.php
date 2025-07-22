<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentPass extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'passer_id',
        'passed_id',
    ];
    
    /**
     * Relation avec l'utilisateur qui a passé
     */
    public function passer()
    {
        return $this->belongsTo(User::class, 'passer_id');
    }
    
    /**
     * Relation avec l'utilisateur qui a été passé
     */
    public function passed()
    {
        return $this->belongsTo(User::class, 'passed_id');
    }
    
    /**
     * Créer un nouveau pass
     */
    public static function createPass($passerId, $passedId)
    {
        try {
            // Vérifier qu'on ne se passe pas soi-même
            if ($passerId === $passedId) {
                return [
                    'success' => false,
                    'message' => 'Vous ne pouvez pas vous passer vous-même'
                ];
            }
            
            // Vérifier si ce pass existe déjà
            $existingPass = self::where('passer_id', $passerId)
                              ->where('passed_id', $passedId)
                              ->first();
            
            if ($existingPass) {
                return [
                    'success' => false,
                    'message' => 'Vous avez déjà passé ce profil'
                ];
            }
            
            // Créer le pass
            $pass = self::create([
                'passer_id' => $passerId,
                'passed_id' => $passedId,
            ]);
            
            return [
                'success' => true,
                'message' => 'Profil passé',
                'pass' => $pass
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors du pass: ' . $e->getMessage()
            ];
        }
    }
}
