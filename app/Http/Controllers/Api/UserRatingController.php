<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRating;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserRatingController extends Controller
{
    public function rateUser(Request $request, $userId)
    {
        try {
            $raterId = Auth::id();
            
            if (!$raterId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être connecté pour noter un utilisateur'
                ], 401);
            }

            if ($raterId == $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas vous noter vous-même'
                ], 400);
            }

            $validator = Validator::make($request->all(), [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:500',
                'transaction_type' => 'required|in:announcement,service,general',
                'announcement_id' => 'nullable|exists:announcements,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Vérifier si l'utilisateur peut noter
            if (!UserRating::canRate($raterId, $userId, $request->announcement_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà noté cet utilisateur pour cette transaction'
                ], 400);
            }

            // Créer la note
            $rating = UserRating::create([
                'rater_id' => $raterId,
                'rated_user_id' => $userId,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'transaction_type' => $request->transaction_type,
                'announcement_id' => $request->announcement_id
            ]);

            // Recalculer la note moyenne de l'utilisateur
            $user = User::findOrFail($userId);
            $newAverage = UserRating::getAverageRating($userId);
            $user->update(['rating' => $newAverage]);

            return response()->json([
                'success' => true,
                'data' => [
                    'rating' => $rating,
                    'new_average' => round($newAverage, 2),
                    'total_ratings' => UserRating::getTotalRatings($userId)
                ],
                'message' => 'Note ajoutée avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout de la note'
            ], 500);
        }
    }

    public function getUserRatings(Request $request, $userId)
    {
        try {
            $user = User::findOrFail($userId);
            
            $ratings = UserRating::where('rated_user_id', $userId)
                ->with(['rater', 'announcement'])
                ->recentFirst()
                ->paginate($request->get('per_page', 10));

            $stats = [
                'average_rating' => round(UserRating::getAverageRating($userId), 2),
                'total_ratings' => UserRating::getTotalRatings($userId),
                'rating_distribution' => UserRating::getRatingDistribution($userId)
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'ratings' => $ratings->items(),
                    'stats' => $stats,
                    'pagination' => [
                        'current_page' => $ratings->currentPage(),
                        'last_page' => $ratings->lastPage(),
                        'per_page' => $ratings->perPage(),
                        'total' => $ratings->total()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des notes'
            ], 500);
        }
    }

    public function getTopRatedUsers(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $minRatings = $request->get('min_ratings', 3); // Minimum d'évaluations pour être classé
            
            $topUsers = User::where('is_student', true)
                ->withCount('receivedRatings as ratings_count')
                ->having('ratings_count', '>=', $minRatings)
                ->orderByDesc('rating')
                ->orderByDesc('ratings_count')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $topUsers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du classement'
            ], 500);
        }
    }

    public function getRecommendedUsers(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            
            // Algorithme de recommandation basé sur les notes et l'activité
            $recommendedUsers = User::where('is_student', true)
                ->with(['announcements' => function($query) {
                    $query->withCount(['likes', 'views'])
                        ->orderByRaw('(likes_count * 3 + views_count * 1) DESC')
                        ->limit(3);
                }])
                ->withCount('receivedRatings as ratings_count')
                ->get()
                ->map(function($user) {
                    $user->recommendation_score = $user->recommendation_score;
                    $user->featured_announcements = $user->featured_announcements;
                    return $user;
                })
                ->sortByDesc('recommendation_score')
                ->take($limit)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $recommendedUsers,
                'algorithm' => 'rating_and_activity_based'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération des recommandations'
            ], 500);
        }
    }

    public function canRateUser(Request $request, $userId)
    {
        try {
            $raterId = Auth::id();
            
            if (!$raterId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être connecté'
                ], 401);
            }

            if ($raterId == $userId) {
                return response()->json([
                    'success' => true,
                    'can_rate' => false,
                    'reason' => 'Vous ne pouvez pas vous noter vous-même'
                ]);
            }

            $announcementId = $request->get('announcement_id');
            $canRate = UserRating::canRate($raterId, $userId, $announcementId);

            return response()->json([
                'success' => true,
                'can_rate' => $canRate,
                'reason' => $canRate ? null : 'Vous avez déjà noté cet utilisateur pour cette transaction'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification'
            ], 500);
        }
    }

    public function updateRating(Request $request, $ratingId)
    {
        try {
            $raterId = Auth::id();
            
            if (!$raterId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être connecté'
                ], 401);
            }

            $rating = UserRating::where('id', $ratingId)
                ->where('rater_id', $raterId)
                ->first();

            if (!$rating) {
                return response()->json([
                    'success' => false,
                    'message' => 'Note non trouvée ou vous n\'êtes pas autorisé à la modifier'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $rating->update([
                'rating' => $request->rating,
                'comment' => $request->comment
            ]);

            // Recalculer la note moyenne
            $user = User::findOrFail($rating->rated_user_id);
            $newAverage = UserRating::getAverageRating($rating->rated_user_id);
            $user->update(['rating' => $newAverage]);

            return response()->json([
                'success' => true,
                'data' => [
                    'rating' => $rating->fresh(),
                    'new_average' => round($newAverage, 2)
                ],
                'message' => 'Note mise à jour avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la note'
            ], 500);
        }
    }
}