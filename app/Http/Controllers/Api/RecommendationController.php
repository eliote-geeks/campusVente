<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementLike;
use App\Models\AnnouncementView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
    public function getRecommendations(Request $request)
    {
        try {
            $userId = Auth::id();
            $limit = $request->get('limit', 10);
            
            if (!$userId) {
                // Pour les utilisateurs non connectés, retourner les plus populaires
                return $this->getPopularRecommendations($limit);
            }

            // Algorithme de recommandation personnalisé
            $recommendations = $this->getPersonalizedRecommendations($userId, $limit);

            return response()->json([
                'success' => true,
                'data' => $recommendations,
                'algorithm' => 'personalized'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération des recommandations'
            ], 500);
        }
    }

    private function getPersonalizedRecommendations($userId, $limit)
    {
        // 1. Analyser les préférences de l'utilisateur basées sur ses interactions
        $userPreferences = $this->analyzeUserPreferences($userId);
        
        // 2. Trouver des utilisateurs similaires (collaborative filtering)
        $similarUsers = $this->findSimilarUsers($userId);
        
        // 3. Recommandations basées sur le contenu et les interactions
        $recommendations = Announcement::with(['user', 'category'])
            ->withCount(['likes', 'views'])
            ->active()
            ->where('user_id', '!=', $userId) // Exclure ses propres annonces
            ->where(function($query) use ($userPreferences, $similarUsers) {
                // Favoriser les catégories préférées de l'utilisateur
                if (!empty($userPreferences['preferred_categories'])) {
                    $query->whereIn('category_id', $userPreferences['preferred_categories'])
                          ->orWhere(function($subQuery) use ($userPreferences) {
                              // Ou favoriser les types d'annonces préférés
                              if (!empty($userPreferences['preferred_types'])) {
                                  $subQuery->whereIn('type', $userPreferences['preferred_types']);
                              }
                          });
                }
                
                // Inclure les annonces des utilisateurs similaires
                if (!empty($similarUsers)) {
                    $query->orWhereIn('user_id', $similarUsers);
                }
            })
            ->orderByRaw($this->getRecommendationOrderClause($userPreferences))
            ->limit($limit)
            ->get();

        // 4. Si pas assez de recommandations, compléter avec les plus populaires
        if ($recommendations->count() < $limit) {
            $remaining = $limit - $recommendations->count();
            $popular = $this->getPopularRecommendations($remaining, $recommendations->pluck('id')->toArray());
            $recommendations = $recommendations->merge($popular);
        }

        return $recommendations;
    }

    private function analyzeUserPreferences($userId)
    {
        // Analyser les likes de l'utilisateur
        $likedAnnouncements = AnnouncementLike::where('user_id', $userId)
            ->with('announcement.category')
            ->get();

        // Analyser les vues de l'utilisateur
        $viewedAnnouncements = AnnouncementView::where('user_id', $userId)
            ->with('announcement.category')
            ->where('created_at', '>', now()->subDays(30)) // Derniers 30 jours
            ->get();

        $preferences = [
            'preferred_categories' => [],
            'preferred_types' => [],
            'price_range' => [
                'min' => 0,
                'max' => PHP_INT_MAX
            ]
        ];

        // Extraire les catégories préférées basées sur les likes (poids plus élevé)
        $categoryLikes = $likedAnnouncements->groupBy('announcement.category_id')
            ->map(function($group) {
                return count($group) * 3; // Poids des likes
            });

        // Extraire les catégories vues (poids plus faible)
        $categoryViews = $viewedAnnouncements->groupBy('announcement.category_id')
            ->map(function($group) {
                return count($group) * 1; // Poids des vues
            });

        // Combiner et trier les préférences de catégorie
        $allCategoryPreferences = $categoryLikes->mergeRecursive($categoryViews)
            ->map(function($scores) {
                return is_array($scores) ? array_sum($scores) : $scores;
            })
            ->sortDesc()
            ->take(5); // Top 5 catégories

        $preferences['preferred_categories'] = $allCategoryPreferences->keys()->toArray();

        // Analyser les types préférés
        $typePreferences = $likedAnnouncements->merge($viewedAnnouncements)
            ->groupBy('announcement.type')
            ->map(function($group) {
                return count($group);
            })
            ->sortDesc()
            ->take(3);

        $preferences['preferred_types'] = $typePreferences->keys()->toArray();

        // Analyser la gamme de prix préférée
        $prices = $likedAnnouncements->merge($viewedAnnouncements)
            ->pluck('announcement.price')
            ->filter()
            ->sort();

        if ($prices->count() > 0) {
            $preferences['price_range'] = [
                'min' => $prices->quantile(0.25), // 25e percentile
                'max' => $prices->quantile(0.75)  // 75e percentile
            ];
        }

        return $preferences;
    }

    private function findSimilarUsers($userId, $limit = 10)
    {
        // Trouver des utilisateurs avec des goûts similaires basés sur les likes communs
        $similarUsers = DB::table('announcement_likes as ul1')
            ->join('announcement_likes as ul2', 'ul1.announcement_id', '=', 'ul2.announcement_id')
            ->where('ul1.user_id', $userId)
            ->where('ul2.user_id', '!=', $userId)
            ->select('ul2.user_id', DB::raw('COUNT(*) as common_likes'))
            ->groupBy('ul2.user_id')
            ->orderBy('common_likes', 'desc')
            ->limit($limit)
            ->pluck('user_id')
            ->toArray();

        return $similarUsers;
    }

    private function getRecommendationOrderClause($preferences)
    {
        $clause = "(likes_count * 2 + views_count * 1)";
        
        // Bonus pour les annonces récentes
        $clause .= " + (CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 10 ELSE 0 END)";
        
        // Bonus pour les annonces dans la gamme de prix préférée
        if (isset($preferences['price_range'])) {
            $min = $preferences['price_range']['min'];
            $max = $preferences['price_range']['max'];
            $clause .= " + (CASE WHEN price BETWEEN {$min} AND {$max} THEN 5 ELSE 0 END)";
        }
        
        $clause .= " DESC";
        
        return $clause;
    }

    private function getPopularRecommendations($limit, $excludeIds = [])
    {
        $query = Announcement::with(['user', 'category'])
            ->withCount(['likes', 'views'])
            ->active()
            ->orderByRaw('(likes_count * 3 + views_count * 1 + (CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 20 ELSE 0 END)) DESC');

        if (!empty($excludeIds)) {
            $query->whereNotIn('id', $excludeIds);
        }

        return $query->limit($limit)->get();
    }

    public function getTrendingAnnouncements(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $timeframe = $request->get('timeframe', 'week'); // day, week, month
            
            $timeframeMap = [
                'day' => 1,
                'week' => 7,
                'month' => 30
            ];
            
            $days = $timeframeMap[$timeframe] ?? 7;
            
            // Annonces tendances basées sur l'activité récente
            $trending = Announcement::with(['user', 'category'])
                ->withCount([
                    'likes as recent_likes' => function($query) use ($days) {
                        $query->where('created_at', '>', now()->subDays($days));
                    },
                    'views as recent_views' => function($query) use ($days) {
                        $query->where('created_at', '>', now()->subDays($days));
                    }
                ])
                ->active()
                ->having('recent_likes', '>', 0)
                ->orHaving('recent_views', '>', 2)
                ->orderByRaw('(recent_likes * 5 + recent_views * 1) DESC')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $trending,
                'timeframe' => $timeframe
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des tendances'
            ], 500);
        }
    }

    public function getUserRecommendationStats(Request $request)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non connecté'
                ], 401);
            }

            $stats = [
                'total_likes_given' => AnnouncementLike::where('user_id', $userId)->count(),
                'total_views' => AnnouncementView::where('user_id', $userId)->count(),
                'preferences' => $this->analyzeUserPreferences($userId),
                'recommendation_accuracy' => $this->calculateRecommendationAccuracy($userId)
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }

    private function calculateRecommendationAccuracy($userId)
    {
        // Calculer la précision des recommandations basée sur les interactions passées
        // (Ceci est une métrique simplifiée - en production, on utiliserait des méthodes plus sophistiquées)
        
        $totalRecommendations = 100; // Supposons qu'on ait fait 100 recommandations
        $interactedRecommendations = AnnouncementLike::where('user_id', $userId)
            ->where('created_at', '>', now()->subDays(30))
            ->count();
            
        return $totalRecommendations > 0 ? ($interactedRecommendations / $totalRecommendations) * 100 : 0;
    }
}