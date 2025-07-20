<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentLike;
use App\Models\StudentMatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CampusLoveController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['checkAccess', 'getAccessInfo']);
        $this->middleware('campus_love_access')->except(['checkAccess', 'getAccessInfo']);
    }

    /**
     * Vérifier l'accès à CampusLove
     */
    public function checkAccess(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Si l'utilisateur n'est pas connecté, pas d'accès
            if (!$user) {
                return response()->json([
                    'success' => true,
                    'has_access' => false,
                    'activated_at' => null,
                    'access_fee' => 1000,
                    'currency' => 'FCFA'
                ]);
            }
            
            return response()->json([
                'success' => true,
                'has_access' => $user->campus_love_access ?? false,
                'activated_at' => $user->campus_love_activated_at,
                'access_fee' => 1000,
                'currency' => 'FCFA'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur vérification accès CampusLove', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification de l\'accès'
            ], 500);
        }
    }

    /**
     * Obtenir les informations d'accès à CampusLove
     */
    public function getAccessInfo(Request $request)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'access_fee' => 1000,
                    'currency' => 'FCFA',
                    'description' => 'Accès à vie à CampusLove',
                    'features' => [
                        'Découvrir des profils étudiants',
                        'System de match intelligent',
                        'Chat via WhatsApp',
                        'Profil personnalisé',
                        'Photos multiples',
                        'Statistiques détaillées'
                    ],
                    'payment_methods' => [
                        'MTN Mobile Money',
                        'Orange Money',
                        'Express Union Mobile',
                        'Cartes bancaires'
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des informations'
            ], 500);
        }
    }

    /**
     * Obtenir les profils potentiels pour le swipe
     */
    public function getProfiles(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Vérifier si l'utilisateur a un profil dating complet
            if (!$user->hasDatingProfile()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil dating incomplet. Veuillez compléter votre profil.',
                    'needs_profile_completion' => true
                ]);
            }

            // Récupérer les profils potentiels
            $profiles = User::getPotentialMatches($user->id, 10);

            // Formater les données pour le frontend
            $formattedProfiles = $profiles->map(function ($profile) {
                return [
                    'id' => $profile->id,
                    'name' => $profile->name,
                    'age' => $profile->getAge(),
                    'university' => $profile->university,
                    'study_level' => $profile->study_level,
                    'field' => $profile->field,
                    'bio' => $profile->bio_dating ?? $profile->bio,
                    'interests' => $profile->interests ?? [],
                    'photos' => $profile->dating_photos ?? [],
                    'location' => $profile->location,
                    'distance' => rand(1, 50), // TODO: Calculer la vraie distance
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedProfiles
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération profils CampusLove', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des profils'
            ], 500);
        }
    }

    /**
     * Liker un profil
     */
    public function likeProfile(Request $request)
    {
        try {
            $request->validate([
                'target_user_id' => 'required|exists:users,id',
                'is_super_like' => 'boolean'
            ]);

            $user = Auth::user();
            $targetUserId = $request->target_user_id;
            $isSuperLike = $request->boolean('is_super_like');

            // Vérifier qu'on ne se like pas soi-même
            if ($user->id === $targetUserId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas vous liker vous-même'
                ], 400);
            }

            // Créer le like et vérifier s'il y a match
            $result = StudentLike::createLike($user->id, $targetUserId, $isSuperLike);

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            // Si c'est un match, retourner les informations supplémentaires
            if ($result['is_match']) {
                $match = $result['match'];
                $otherUser = $match->getOtherUser($user->id);
                
                return response()->json([
                    'success' => true,
                    'is_match' => true,
                    'message' => $result['message'],
                    'match' => [
                        'id' => $match->id,
                        'other_user' => [
                            'id' => $otherUser->id,
                            'name' => $otherUser->name,
                            'photo' => $otherUser->dating_photos[0] ?? $otherUser->avatar,
                        ],
                        'whatsapp_url' => $match->getWhatsAppUrlForUser($user->id),
                        'matched_at' => $match->matched_at
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'is_match' => false,
                'message' => $result['message']
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur like profil', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $request->target_user_id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du like'
            ], 500);
        }
    }

    /**
     * Passer (skip) un profil
     */
    public function skipProfile(Request $request)
    {
        try {
            $request->validate([
                'target_user_id' => 'required|exists:users,id'
            ]);

            // Pour l'instant, on ne fait rien de spécial pour les skip
            // On pourrait ajouter une table pour tracker les skips si nécessaire

            return response()->json([
                'success' => true,
                'message' => 'Profil passé'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur skip profil', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du skip'
            ], 500);
        }
    }

    /**
     * Obtenir les matchs de l'utilisateur
     */
    public function getMatches(Request $request)
    {
        try {
            $user = Auth::user();
            $matches = $user->getAllMatches();

            // Formater les données pour le frontend
            $formattedMatches = $matches->map(function ($match) use ($user) {
                $otherUser = $match->getOtherUser($user->id);
                
                return [
                    'id' => $match->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'age' => $otherUser->getAge(),
                        'photo' => $otherUser->dating_photos[0] ?? $otherUser->avatar,
                        'university' => $otherUser->university,
                    ],
                    'matched_at' => $match->matched_at,
                    'conversation_started' => $match->conversation_started,
                    'conversation_started_at' => $match->conversation_started_at,
                    'whatsapp_url' => $match->getWhatsAppUrlForUser($user->id),
                    'last_message' => null, // TODO: Implémenter si nécessaire
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedMatches
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération matchs', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des matchs'
            ], 500);
        }
    }

    /**
     * Démarrer une conversation (rediriger vers WhatsApp)
     */
    public function startConversation(Request $request)
    {
        try {
            $request->validate([
                'match_id' => 'required|exists:student_matches,id'
            ]);

            $user = Auth::user();
            $match = StudentMatch::with(['user1', 'user2'])->findOrFail($request->match_id);

            // Vérifier que l'utilisateur fait partie du match
            if (!in_array($user->id, [$match->user1_id, $match->user2_id])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à accéder à ce match'
                ], 403);
            }

            // Marquer la conversation comme démarrée
            $match->markConversationStarted();

            // Retourner l'URL WhatsApp
            $whatsappUrl = $match->getWhatsAppUrlForUser($user->id);

            return response()->json([
                'success' => true,
                'whatsapp_url' => $whatsappUrl,
                'message' => 'Conversation démarrée ! Vous allez être redirigé vers WhatsApp.'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur démarrage conversation', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'match_id' => $request->match_id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du démarrage de la conversation'
            ], 500);
        }
    }

    /**
     * Mettre à jour le profil dating
     */
    public function updateDatingProfile(Request $request)
    {
        try {
            $request->validate([
                'birth_date' => 'required|date|before:today',
                'gender' => 'required|in:male,female,other',
                'looking_for' => 'required|in:male,female,both',
                'bio_dating' => 'nullable|string|max:500',
                'interests' => 'nullable|array',
                'interests.*' => 'string|max:50',
                'whatsapp_number' => 'required|string|max:20',
                'dating_active' => 'boolean',
                'max_distance' => 'integer|min:1|max:100',
                'dating_photos' => 'nullable|array|max:6',
                'dating_photos.*' => 'string|max:255'
            ]);

            $user = Auth::user();

            $user->update([
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
                'looking_for' => $request->looking_for,
                'bio_dating' => $request->bio_dating,
                'interests' => $request->interests ?? [],
                'whatsapp_number' => $request->whatsapp_number,
                'dating_active' => $request->boolean('dating_active', true),
                'max_distance' => $request->max_distance ?? 50,
                'dating_photos' => $request->dating_photos ?? [],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profil dating mis à jour avec succès',
                'profile_complete' => $user->hasDatingProfile()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour profil dating', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil'
            ], 500);
        }
    }

    /**
     * Obtenir le profil dating de l'utilisateur
     */
    public function getDatingProfile(Request $request)
    {
        try {
            $user = Auth::user();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'birth_date' => $user->birth_date,
                    'age' => $user->getAge(),
                    'gender' => $user->gender,
                    'looking_for' => $user->looking_for,
                    'bio_dating' => $user->bio_dating,
                    'interests' => $user->interests ?? [],
                    'dating_photos' => $user->dating_photos ?? [],
                    'whatsapp_number' => $user->whatsapp_number,
                    'dating_active' => $user->dating_active,
                    'max_distance' => $user->max_distance,
                    'university' => $user->university,
                    'study_level' => $user->study_level,
                    'field' => $user->field,
                    'location' => $user->location,
                    'profile_complete' => $user->hasDatingProfile()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération profil dating', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques de l'utilisateur
     */
    public function getStats(Request $request)
    {
        try {
            $user = Auth::user();

            $stats = [
                'total_likes_sent' => $user->sentLikes()->count(),
                'total_likes_received' => $user->receivedLikes()->count(),
                'total_matches' => $user->getAllMatches()->count(),
                'conversations_started' => $user->getAllMatches()->where('conversation_started', true)->count(),
                'profile_complete' => $user->hasDatingProfile(),
                'dating_active' => $user->dating_active,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération stats', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }
}