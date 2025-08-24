<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CampusLoveProfile;
use App\Models\StudentLike;
use App\Models\StudentMatch;
use App\Models\StudentPass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CampusLoveController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['checkAccess', 'getAccessInfo']);
        // Remove campus_love_access middleware to allow freemium access
        // Access control will be handled at application level
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
            
            // Accorder automatiquement l'accès de base à CampusLove
            if (!$user->campus_love_access) {
                $user->update([
                    'campus_love_access' => true,
                    'campus_love_activated_at' => now()
                ]);
                Log::info('Accès de base CampusLove accordé à l\'utilisateur: ' . $user->id);
            }
            
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
                $photosBase64 = $profile->dating_photos_base64 ?? [];
                
                return [
                    'id' => $profile->id,
                    'name' => $profile->name,
                    'age' => $profile->getAge(),
                    'university' => $profile->university,
                    'study_level' => $profile->study_level,
                    'field' => $profile->field,
                    'bio' => $profile->bio_dating ?? $profile->bio,
                    'interests' => $profile->interests ?? [],
                    'photos' => $photosBase64, // Utiliser les photos base64
                    'dating_photos_base64' => $photosBase64,
                    'profile_photo' => !empty($photosBase64) ? $photosBase64[0]['image'] ?? null : null, // Première photo comme photo de profil
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
            Log::info('Tentative de like profil', [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

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

            Log::info('Résultat like profil', [
                'user_id' => Auth::id(),
                'target_user_id' => $targetUserId,
                'result' => $result
            ]);

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            // Si c'est un match, vérifier la limite des matches gratuits
            if ($result['is_match']) {
                $totalMatches = $user->getAllMatches()->count();
                $hasPremium = $user->hasActivePremiumSubscription();
                
                Log::info('Vérification limite matches', [
                    'user_id' => Auth::id(),
                    'total_matches' => $totalMatches,
                    'has_premium' => $hasPremium
                ]);
                
                // Vérifier si l'utilisateur a dépassé la limite de 6 matches
                if ($totalMatches > 6 && !$hasPremium) {
                    // Supprimer le match créé car l'utilisateur a dépassé la limite
                    if (isset($result['match']) && $result['match']) {
                        $result['match']->delete();
                    }
                    
                    return response()->json([
                        'success' => false,
                        'is_match' => false,
                        'needs_premium' => true,
                        'message' => 'Limite de 6 matches atteinte. Abonnez-vous pour plus de matches !',
                        'premium_info' => [
                            'price' => 2000,
                            'currency' => 'FCFA',
                            'description' => 'Abonnement à vie - Matches illimités'
                        ]
                    ], 402);
                }
                
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

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur validation like profil', [
                'error' => $e->getMessage(),
                'errors' => $e->errors(),
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erreur like profil', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $request->target_user_id ?? null,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du like: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Passer (skip) un profil
     */
    public function skipProfile(Request $request)
    {
        try {
            Log::info('Tentative de skip profil', [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            $request->validate([
                'target_user_id' => 'required|exists:users,id'
            ]);

            $user = Auth::user();
            $targetUserId = $request->target_user_id;

            // Créer le pass
            $result = StudentPass::createPass($user->id, $targetUserId);

            Log::info('Résultat skip profil', [
                'user_id' => Auth::id(),
                'target_user_id' => $targetUserId,
                'result' => $result
            ]);

            return response()->json($result, $result['success'] ? 200 : 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur validation skip profil', [
                'error' => $e->getMessage(),
                'errors' => $e->errors(),
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erreur skip profil', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du skip: ' . $e->getMessage()
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
            $totalMatches = $matches->count();
            $hasPremium = $user->hasActivePremiumSubscription();

            // Limiter à 6 matches pour les utilisateurs gratuits
            if (!$hasPremium && $totalMatches > 6) {
                $matches = $matches->take(6);
            }

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
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedMatches,
                'total_matches' => $totalMatches,
                'visible_matches' => $matches->count(),
                'has_premium' => $hasPremium,
                'matches_limit_reached' => !$hasPremium && $totalMatches > 6,
                'premium_info' => !$hasPremium && $totalMatches > 6 ? [
                    'price' => 2000,
                    'currency' => 'FCFA',
                    'description' => 'Abonnement à vie - Matches illimités'
                ] : null
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
                'dating_photos.*' => 'string|max:5000000'
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
     * Passer un profil (alias de skipProfile)
     */
    public function passProfile(Request $request)
    {
        return $this->skipProfile($request);
    }

    /**
     * Obtenir les statistiques de l'utilisateur
     */
    public function getStats(Request $request)
    {
        try {
            $user = Auth::user();

            $totalLikesSent = $user->sentLikes()->count();
            $totalLikesReceived = $user->receivedLikes()->count();
            $totalMatches = $user->getAllMatches()->count();
            $totalPasses = StudentPass::where('passer_id', $user->id)->count();
            $conversationsStarted = $user->getAllMatches()->where('conversation_started', true)->count();
            
            // Calculer les taux
            $totalSwipes = $totalLikesSent + $totalPasses;
            $matchRate = $totalLikesSent > 0 ? round(($totalMatches / $totalLikesSent) * 100, 1) : 0;
            $likeRate = $totalSwipes > 0 ? round(($totalLikesSent / $totalSwipes) * 100, 1) : 0;
            $responseRate = $totalMatches > 0 ? round(($conversationsStarted / $totalMatches) * 100, 1) : 0;
            
            // Profil populaire si plus de likes reçus que envoyés
            $isPopular = $totalLikesReceived > $totalLikesSent;
            
            // Super likes donnés et reçus
            $superLikesGiven = $user->sentLikes()->where('is_super_like', true)->count();
            $superLikesReceived = $user->receivedLikes()->where('is_super_like', true)->count();

            $stats = [
                'total_likes_sent' => $totalLikesSent,
                'total_likes_received' => $totalLikesReceived,
                'total_matches' => $totalMatches,
                'total_passes' => $totalPasses,
                'total_swipes' => $totalSwipes,
                'conversations_started' => $conversationsStarted,
                'super_likes_given' => $superLikesGiven,
                'super_likes_received' => $superLikesReceived,
                'match_rate' => $matchRate,
                'like_rate' => $likeRate,
                'response_rate' => $responseRate,
                'profile_complete' => $user->hasDatingProfile(),
                'dating_active' => $user->dating_active,
                'is_popular' => $isPopular,
                'profile_views' => rand(15, 150), // TODO: Implémenter le vrai tracking des vues
                'active_days' => 30, // TODO: Calculer les vrais jours d'activité
                'last_activity' => $user->updated_at,
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

    /**
     * Obtenir les profils likés par l'utilisateur
     */
    public function getLikedProfiles(Request $request)
    {
        try {
            $user = Auth::user();
            
            $likedProfiles = StudentLike::where('liker_id', $user->id)
                ->with(['liked' => function($query) {
                    $query->select('id', 'name', 'birth_date', 'university', 'dating_photos', 'bio_dating', 'bio');
                }])
                ->orderBy('created_at', 'desc')
                ->get();

            // Formater les données pour le frontend
            $formattedLikes = $likedProfiles->map(function ($like) {
                return [
                    'id' => $like->id,
                    'liked_user' => [
                        'id' => $like->liked->id,
                        'name' => $like->liked->name,
                        'age' => $like->liked->getAge(),
                        'university' => $like->liked->university,
                        'dating_photos' => $like->liked->dating_photos ?? [],
                        'bio_dating' => $like->liked->bio_dating,
                        'bio' => $like->liked->bio,
                    ],
                    'is_super_like' => $like->is_super_like,
                    'created_at' => $like->created_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedLikes
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération profils likés', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des profils likés'
            ], 500);
        }
    }
    
    /**
     * Obtenir les profils refusés par l'utilisateur
     */
    public function getPassedProfiles(Request $request)
    {
        try {
            $user = Auth::user();
            
            $passedProfiles = StudentPass::where('passer_id', $user->id)
                ->with(['passed' => function($query) {
                    $query->select('id', 'name', 'birth_date', 'university', 'dating_photos', 'bio_dating', 'bio');
                }])
                ->orderBy('created_at', 'desc')
                ->get();

            // Formater les données pour le frontend
            $formattedPasses = $passedProfiles->map(function ($pass) {
                return [
                    'id' => $pass->id,
                    'passed_user' => [
                        'id' => $pass->passed->id,
                        'name' => $pass->passed->name,
                        'age' => $pass->passed->getAge(),
                        'university' => $pass->passed->university,
                        'dating_photos' => $pass->passed->dating_photos ?? [],
                        'bio_dating' => $pass->passed->bio_dating,
                        'bio' => $pass->passed->bio,
                    ],
                    'passed_at' => $pass->created_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedPasses
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération profils refusés', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des profils refusés'
            ], 500);
        }
    }
}