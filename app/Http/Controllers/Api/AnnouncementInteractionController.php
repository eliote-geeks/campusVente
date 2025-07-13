<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementLike;
use App\Models\AnnouncementView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementInteractionController extends Controller
{
    public function toggleLike(Request $request, $announcementId)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être connecté pour liker une annonce'
                ], 401);
            }

            $announcement = Announcement::findOrFail($announcementId);
            
            $existingLike = AnnouncementLike::where('user_id', $userId)
                ->where('announcement_id', $announcementId)
                ->first();

            if ($existingLike) {
                // Unlike
                $existingLike->delete();
                $isLiked = false;
            } else {
                // Like
                AnnouncementLike::create([
                    'user_id' => $userId,
                    'announcement_id' => $announcementId
                ]);
                $isLiked = true;
            }

            $likesCount = AnnouncementLike::where('announcement_id', $announcementId)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'is_liked' => $isLiked,
                    'likes_count' => $likesCount
                ],
                'message' => $isLiked ? 'Annonce likée' : 'Like retiré'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la gestion du like'
            ], 500);
        }
    }

    public function recordView(Request $request, $announcementId)
    {
        try {
            $announcement = Announcement::findOrFail($announcementId);
            
            $userId = Auth::id();
            $ipAddress = $request->ip();
            $userAgent = $request->header('User-Agent');

            // Enregistrer la vue (avec déduplication intégrée)
            $view = AnnouncementView::recordView($announcementId, $userId, $ipAddress, $userAgent);
            
            $viewsCount = AnnouncementView::where('announcement_id', $announcementId)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'views_count' => $viewsCount,
                    'view_recorded' => $view !== null
                ],
                'message' => 'Vue enregistrée'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement de la vue'
            ], 500);
        }
    }

    public function getInteractionStatus(Request $request, $announcementId)
    {
        try {
            $userId = Auth::id();
            
            $isLiked = false;
            if ($userId) {
                $isLiked = AnnouncementLike::where('user_id', $userId)
                    ->where('announcement_id', $announcementId)
                    ->exists();
            }

            $likesCount = AnnouncementLike::where('announcement_id', $announcementId)->count();
            $viewsCount = AnnouncementView::where('announcement_id', $announcementId)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'is_liked' => $isLiked,
                    'likes_count' => $likesCount,
                    'views_count' => $viewsCount
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du statut d\'interaction'
            ], 500);
        }
    }

    public function getPopularAnnouncements(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            
            // Récupérer les annonces avec les comptes de likes et vues
            $announcements = Announcement::with(['user', 'category'])
                ->withCount(['likes', 'views'])
                ->active()
                ->orderByRaw('(likes_count * 3 + views_count * 1) DESC')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $announcements
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des annonces populaires'
            ], 500);
        }
    }
}