<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\WelcomeNotification;
use App\Notifications\AnnouncementNotification;
use App\Notifications\MessageNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Notification;

class NotificationController extends Controller
{
    /**
     * Envoyer une notification à tous les utilisateurs
     */
    public function broadcastNotification(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'message' => 'required|string|max:1000',
                'type' => 'required|string',
                'data' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données de notification invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Récupérer tous les utilisateurs actifs
            $users = User::where('is_active', true)->get();
            
            // Créer une notification personnalisée
            $notificationData = [
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'priority' => $request->get('priority', 'medium'),
                'icon' => $request->get('icon', 'fas fa-bell'),
                'color' => $request->get('color', 'primary'),
                'url' => $request->get('url', '/notifications'),
                'data' => $request->data ?? []
            ];

            // Envoyer la notification à tous les utilisateurs
            Notification::send($users, new \App\Notifications\CustomNotification($notificationData));

            return response()->json([
                'success' => true,
                'message' => 'Notifications envoyées avec succès',
                'data' => [
                    'notifications_sent' => $users->count(),
                    'total_users' => $users->count(),
                    'notification_details' => $notificationData
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi des notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Envoyer une notification à un utilisateur spécifique
     */
    public function sendNotificationToUser(Request $request, $userId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'message' => 'required|string|max:1000',
                'type' => 'required|string',
                'data' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données de notification invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            $notificationData = [
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'priority' => $request->get('priority', 'medium'),
                'icon' => $request->get('icon', 'fas fa-bell'),
                'color' => $request->get('color', 'primary'),
                'url' => $request->get('url', '/notifications'),
                'data' => $request->data ?? []
            ];

            $user->notify(new \App\Notifications\CustomNotification($notificationData));

            return response()->json([
                'success' => true,
                'message' => 'Notification envoyée avec succès',
                'data' => $notificationData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de la notification'
            ], 500);
        }
    }

    /**
     * Obtenir les notifications d'un utilisateur
     */
    public function getUserNotifications(Request $request, $userId = null)
    {
        try {
            $user = $userId ? User::find($userId) : Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Récupérer les notifications avec tri par priorité et date
            $notifications = $user->notifications()
                ->orderByRaw("
                    CASE 
                        WHEN JSON_EXTRACT(data, '$.priority') = 'high' THEN 3
                        WHEN JSON_EXTRACT(data, '$.priority') = 'medium' THEN 2
                        ELSE 1
                    END DESC
                ")
                ->orderByRaw("read_at IS NULL DESC")
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'title' => $notification->data['title'] ?? 'Notification',
                        'message' => $notification->data['message'] ?? '',
                        'type' => $notification->data['type'] ?? 'general',
                        'priority' => $notification->data['priority'] ?? 'medium',
                        'icon' => $notification->data['icon'] ?? 'fas fa-bell',
                        'color' => $notification->data['color'] ?? 'primary',
                        'url' => $notification->data['url'] ?? '/notifications',
                        'read' => !is_null($notification->read_at),
                        'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
                        'data' => $notification->data['data'] ?? []
                    ];
                });

            $unreadCount = $user->unreadNotifications()->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications,
                    'unread_count' => $unreadCount,
                    'total_count' => $notifications->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des notifications'
            ], 500);
        }
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead(Request $request, $notificationId)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $notification = $user->notifications()->find($notificationId);
            
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification non trouvée'
                ], 404);
            }

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marquée comme lue',
                'data' => [
                    'id' => $notification->id,
                    'read_at' => $notification->read_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la notification'
            ], 500);
        }
    }

    /**
     * Marquer toutes les notifications comme lues pour un utilisateur
     */
    public function markAllAsRead(Request $request, $userId = null)
    {
        try {
            $user = $userId ? User::find($userId) : Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $unreadNotifications = $user->unreadNotifications;
            $updatedCount = $unreadNotifications->count();
            
            $user->unreadNotifications->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications ont été marquées comme lues',
                'data' => [
                    'updated_count' => $updatedCount,
                    'updated_at' => now()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des notifications'
            ], 500);
        }
    }

    /**
     * Supprimer une notification
     */
    public function deleteNotification(Request $request, $notificationId)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $notification = $user->notifications()->find($notificationId);
            
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification non trouvée'
                ], 404);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la notification'
            ], 500);
        }
    }

    /**
     * Envoyer une notification de bienvenue
     */
    public function sendWelcomeNotification($user)
    {
        try {
            $user->notify(new WelcomeNotification($user));
            
            return response()->json([
                'success' => true,
                'message' => 'Notification de bienvenue envoyée'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de la notification de bienvenue'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des notifications
     */
    public function getNotificationStats(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $totalNotifications = $user->notifications()->count();
            $unreadNotifications = $user->unreadNotifications()->count();
            $readNotifications = $totalNotifications - $unreadNotifications;
            $readRate = $totalNotifications > 0 ? ($readNotifications / $totalNotifications) * 100 : 0;

            // Statistiques par type
            $notificationTypes = $user->notifications()
                ->get()
                ->groupBy(function ($notification) {
                    return $notification->data['type'] ?? 'general';
                })
                ->map(function ($group) {
                    return $group->count();
                });

            // Activité récente
            $recentActivity = [
                'last_24h' => $user->notifications()->where('created_at', '>=', now()->subDay())->count(),
                'last_week' => $user->notifications()->where('created_at', '>=', now()->subWeek())->count(),
                'last_month' => $user->notifications()->where('created_at', '>=', now()->subMonth())->count(),
            ];

            $stats = [
                'total_notifications' => $totalNotifications,
                'unread_notifications' => $unreadNotifications,
                'read_notifications' => $readNotifications,
                'read_rate' => round($readRate, 1),
                'notification_types' => $notificationTypes,
                'recent_activity' => $recentActivity
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
}