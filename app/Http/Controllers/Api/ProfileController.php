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
    /**
     * Traite et optimise une image base64
     */
    private function processBase64Image($base64Data, $maxWidth = 300, $maxHeight = 300, $quality = 85)
    {
        // Vérifier le format base64
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64Data, $matches)) {
            throw new \InvalidArgumentException('Format base64 invalide');
        }

        $extension = $matches[1];
        $data = substr($base64Data, strpos($base64Data, ',') + 1);
        $decodedData = base64_decode($data);

        if ($decodedData === false) {
            throw new \InvalidArgumentException('Impossible de décoder l\'image base64');
        }

        // Vérifier la taille (max 5MB)
        if (strlen($decodedData) > 5 * 1024 * 1024) {
            throw new \InvalidArgumentException('Image trop volumineuse (max 5MB)');
        }

        // Créer l'image à partir des données
        $image = imagecreatefromstring($decodedData);
        if ($image === false) {
            throw new \InvalidArgumentException('Format d\'image invalide');
        }

        // Obtenir les dimensions
        $width = imagesx($image);
        $height = imagesy($image);

        // Redimensionner si nécessaire
        if ($width > $maxWidth || $height > $maxHeight) {
            $ratio = min($maxWidth / $width, $maxHeight / $height);
            $newWidth = (int)($width * $ratio);
            $newHeight = (int)($height * $ratio);

            $resized = imagecreatetruecolor($newWidth, $newHeight);
            
            // Préserver la transparence pour PNG
            if ($extension === 'png') {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
                $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
                imagefill($resized, 0, 0, $transparent);
            }

            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            
            ob_start();
            imagejpeg($resized, null, $quality);
            $optimizedData = ob_get_contents();
            ob_end_clean();
            
            imagedestroy($resized);
        } else {
            ob_start();
            imagejpeg($image, null, $quality);
            $optimizedData = ob_get_contents();
            ob_end_clean();
        }

        imagedestroy($image);
        
        return 'data:image/jpeg;base64,' . base64_encode($optimizedData);
    }

    /**
     * Upload avatar en base64
     */
    public function uploadAvatarBase64(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Vérifier que la colonne avatar_base64 existe
            if (!\Schema::hasColumn('users', 'avatar_base64')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Base de données non mise à jour. Contactez l\'administrateur.',
                    'debug' => 'Colonne avatar_base64 manquante'
                ], 500);
            }

            $validator = Validator::make($request->all(), [
                'avatar_base64' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Si avatar_base64 est null, supprimer l'avatar
            if ($request->avatar_base64 === null || empty($request->avatar_base64)) {
                $user->update(['avatar_base64' => null, 'avatar' => null]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Avatar supprimé avec succès',
                    'data' => ['avatar_base64' => null]
                ]);
            }

            // Vérifier que l'extension GD est disponible
            if (!function_exists('imagecreatefromstring')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Extension GD PHP non disponible sur le serveur'
                ], 500);
            }

            // Traiter et optimiser l'image base64
            $optimizedImage = $this->processBase64Image($request->avatar_base64);

            // Mettre à jour l'avatar dans la base de données
            $user->update(['avatar_base64' => $optimizedImage]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar mis à jour avec succès',
                'data' => [
                    'avatar_base64' => $optimizedImage
                ]
            ]);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de l\'avatar',
                'error' => $e->getMessage(),
                'debug' => [
                    'line' => $e->getLine(),
                    'file' => basename($e->getFile())
                ]
            ], 500);
        }
    }

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

            // Supprimer l'avatar base64 et l'ancien système
            $user->update([
                'avatar_base64' => null,
                'avatar' => null
            ]);

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