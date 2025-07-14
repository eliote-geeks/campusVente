<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
// use Intervention\Image\Facades\Image; // Commenté si le package n'est pas installé

class ProfileController extends Controller
{
    public function uploadAvatar(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'avatar' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:5120' // 5MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fichier invalide',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('avatar');
            
            // Générer un nom unique pour le fichier
            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = 'avatars/' . $filename;

            // Créer le dossier s'il n'existe pas
            if (!Storage::disk('public')->exists('avatars')) {
                Storage::disk('public')->makeDirectory('avatars');
            }

            // Sauvegarder l'image (sans redimensionnement pour l'instant)
            // Si Intervention Image est installé, on peut redimensionner :
            /*
            $image = Image::make($file);
            $image->fit(300, 300, function ($constraint) {
                $constraint->upsize();
            });
            Storage::disk('public')->put($path, $image->encode());
            */
            
            // Fallback: sauvegarder l'image telle quelle
            Storage::disk('public')->putFileAs('avatars', $file, $filename);

            // Supprimer l'ancienne photo de profil si elle existe
            if ($user->avatar && $user->avatar !== '' && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Mettre à jour le chemin de l'avatar dans la base de données
            $user->update(['avatar' => $path]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar mis à jour avec succès',
                'data' => [
                    'avatar_url' => Storage::disk('public')->url($path),
                    'avatar_path' => $path
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de l\'avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteAvatar()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Supprimer l'image du stockage si elle existe
            if ($user->avatar && $user->avatar !== '' && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Supprimer le chemin de l'avatar de la base de données
            $user->update(['avatar' => null]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAvatar($userId = null)
    {
        try {
            $user = $userId ? \App\Models\User::find($userId) : Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            $avatarUrl = null;
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                $avatarUrl = Storage::disk('public')->url($user->avatar);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'avatar_url' => $avatarUrl,
                    'avatar_path' => $user->avatar,
                    'has_avatar' => !is_null($user->avatar)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}