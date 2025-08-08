<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UniversityController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\AnnouncementInteractionController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\UserRatingController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\CampusLoveController;
use App\Http\Controllers\Api\CampusLoveProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes publiques (sans authentification)
Route::prefix('v1')->group(function () {
    // Authentification
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->name('login');


    // Villes du Cameroun
    Route::get('/cities', function () {
        $cities = \DB::table('cameroon_cities')->get();
        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    });

    // Régions du Cameroun
    Route::get('/regions', function () {
        $regions = \DB::table('cameroon_cities')
            ->select('region')
            ->distinct()
            ->orderBy('region')
            ->pluck('region');
        return response()->json([
            'success' => true,
            'data' => $regions
        ]);
    });

    // Categories (public access)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    
    // Category management (admin routes) - temporarily public for testing
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::post('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus']);
    
    // Universities (public access)
    Route::get('/universities', [UniversityController::class, 'index']);
    Route::get('/universities/{university}', [UniversityController::class, 'show']);
    
    // University management (admin routes) - temporarily public for testing
    Route::apiResource('universities', UniversityController::class)->except(['index', 'show']);
    Route::post('/universities/{university}/toggle-status', [UniversityController::class, 'toggleStatus']);
    
    // Announcements (public access)
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show']);
    
    // Announcement management - temporarily public for testing (route alternative)
    Route::post('/announcements-create', [AnnouncementController::class, 'store']);
    Route::post('/announcements-create-with-files', [AnnouncementController::class, 'storeWithFiles']);
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
    Route::post('/announcements/{announcement}/update-with-files', [AnnouncementController::class, 'updateWithFiles']);
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    Route::post('/announcements/{announcement}/status', [AnnouncementController::class, 'updateStatus']);
    
    // Dashboard statistics (admin only)
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('/dashboard/overview', [DashboardController::class, 'getOverview']);
        Route::get('/dashboard/recent-activity', [DashboardController::class, 'getRecentActivity']);
        Route::get('/dashboard/announcements-by-category', [DashboardController::class, 'getAnnouncementsByCategory']);
        Route::get('/dashboard/announcements-by-type', [DashboardController::class, 'getAnnouncementsByType']);
        Route::get('/dashboard/monthly-growth', [DashboardController::class, 'getMonthlyGrowth']);
        Route::get('/dashboard/top-universities', [DashboardController::class, 'getTopUniversities']);
        Route::get('/dashboard/meetings-by-type', [DashboardController::class, 'getMeetingsByType']);
        Route::get('/dashboard/meetings-by-status', [DashboardController::class, 'getMeetingsByStatus']);
    });

    // Users management - temporarily public for testing
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users-stats', [UserController::class, 'getStats']);
    
    // User rating routes (must come before /users/{user})
    Route::get('/users/top-rated', [UserRatingController::class, 'getTopRatedUsers']);
    Route::get('/users/recommended', [UserRatingController::class, 'getRecommendedUsers']);
    
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);


    // Meetings management - temporarily public for testing
    Route::get('/meetings', [MeetingController::class, 'index']);
    Route::get('/meetings/{meeting}', [MeetingController::class, 'show']);
    Route::post('/meetings', [MeetingController::class, 'store']);
    Route::put('/meetings/{meeting}', [MeetingController::class, 'update']);
    Route::delete('/meetings/{meeting}', [MeetingController::class, 'destroy']);
    Route::post('/meetings/{meeting}/status', [MeetingController::class, 'updateStatus']);
    Route::post('/meetings/{meeting}/join', [MeetingController::class, 'join']);
    Route::post('/meetings/{meeting}/leave', [MeetingController::class, 'leave']);
    Route::get('/meetings/{meeting}/participants', [MeetingController::class, 'participants']);
    Route::put('/meetings/{meeting}/participants/{user}', [MeetingController::class, 'updateParticipantStatus']);
    
    // Likes et vues - accessible publiquement pour les vues, likes nécessitent auth
    Route::post('/announcements/{announcement}/view', [AnnouncementInteractionController::class, 'recordView']);
    Route::get('/announcements/{announcement}/interactions', [AnnouncementInteractionController::class, 'getInteractionStatus']);
    Route::get('/announcements/popular', [AnnouncementInteractionController::class, 'getPopularAnnouncements']);
    
    // Recommandations - accessible publiquement
    Route::get('/recommendations', [RecommendationController::class, 'getRecommendations']);
    Route::get('/recommendations/trending', [RecommendationController::class, 'getTrendingAnnouncements']);
    
    // Système de notation - accessible publiquement
    Route::get('/users/{user}/ratings', [UserRatingController::class, 'getUserRatings']);
    
    // Test endpoints - temporairement publics
    Route::get('/my-announcements', [AnnouncementController::class, 'getUserAnnouncements']);
    Route::get('/my-given-ratings', [UserRatingController::class, 'getGivenRatings']);
    
    // Paiements - temporairement publics pour les tests
    Route::post('/payments/promotional', [PaymentController::class, 'processPromotionalPayment']);
    Route::post('/payments/initiate', [PaymentController::class, 'initiatePayment']);
    Route::post('/payment/notify', [PaymentController::class, 'handleNotification']); // Webhook Monetbil
    Route::put('/payments/{paymentId}/validate', [PaymentController::class, 'validatePayment']);
    
    // Routes callbacks Monetbil
    Route::post('/monetbil/notify', [PaymentController::class, 'handleMonetbilNotification']);
    Route::get('/monetbil/success', [PaymentController::class, 'handleMonetbilSuccess']);
    Route::get('/monetbil/failed', [PaymentController::class, 'handleMonetbilFailed']);
    // Routes pour le dashboard des paiements (temporairement publiques)
    Route::get('/payments/user/{userId?}', [PaymentController::class, 'getUserPayments']);
    Route::get('/payments/stats', [PaymentController::class, 'getPaymentStats']);
    
    // Test d'authentification
    Route::get('/auth/test', function() {
        $user = Auth::user();
        if ($user) {
            return response()->json([
                'success' => true,
                'user' => $user,
                'message' => 'Utilisateur authentifié'
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    })->middleware('auth:sanctum');
    
    // Notifications publiques (broadcast admin)
    Route::post('/notifications/broadcast', [NotificationController::class, 'broadcastNotification']);
    
    // Test endpoint pour vérifier les notifications
    Route::get('/test-notifications/{userId}', function($userId) {
        try {
            $user = \App\Models\User::find($userId);
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Utilisateur non trouvé']);
            }
            
            $notifications = $user->notifications()
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
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    });

    // Routes CampusLove publiques (vérification d'accès sans authentification)
    Route::get('/campus-love/check-access', [CampusLoveController::class, 'checkAccess']);
    Route::get('/campus-love/access-info', [CampusLoveController::class, 'getAccessInfo']);
});

// Routes protégées (avec authentification)
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    // Authentification
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Route pour obtenir les informations de l'utilisateur connecté (legacy)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/announcements', [AnnouncementController::class, 'storeWithFiles']);

    // Likes (nécessite authentification)
    Route::post('/announcements/{announcement}/like', [AnnouncementInteractionController::class, 'toggleLike']);
    
    // Recommandations personnalisées (nécessite authentification)
    Route::get('/recommendations/personal', [RecommendationController::class, 'getRecommendations']);
    Route::get('/recommendations/stats', [RecommendationController::class, 'getUserRecommendationStats']);
    
    // Notation des utilisateurs (nécessite authentification)
    Route::post('/users/{user}/rate', [UserRatingController::class, 'rateUser']);
    Route::get('/users/{user}/can-rate', [UserRatingController::class, 'canRateUser']);
    Route::put('/ratings/{rating}', [UserRatingController::class, 'updateRating']);
    
    // Gestion des avatars (nécessite authentification)
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
    Route::get('/profile/avatar/{userId?}', [ProfileController::class, 'getAvatar']);
    
    // Notifications utilisateur (protégées)
    Route::post('/notifications/user/{userId}', [NotificationController::class, 'sendNotificationToUser']);
    
    // Routes CampusLove protégées (système de dating)
    Route::prefix('campus-love')->group(function () {
        // Gestion des profils CampusLove
        Route::get('/my-profile', [CampusLoveProfileController::class, 'getMyProfile']);
        Route::put('/my-profile', [CampusLoveProfileController::class, 'updateProfile']);
        Route::get('/my-profile/stats', [CampusLoveProfileController::class, 'getProfileStats']);
        
        // Gestion des photos de profil
        Route::post('/photos/upload', [CampusLoveProfileController::class, 'uploadPhoto']);
        Route::post('/photos/upload-multiple', [CampusLoveProfileController::class, 'uploadMultiplePhotos']);
        Route::delete('/photos', [CampusLoveProfileController::class, 'deletePhoto']);
        Route::put('/photos/profile', [CampusLoveProfileController::class, 'setProfilePhoto']);
        Route::put('/photos/metadata', [CampusLoveProfileController::class, 'updatePhotoMetadata']);
        
        // Découverte et matching
        Route::get('/discover', [CampusLoveProfileController::class, 'getRecommendedProfiles']);
        
        // Routes existantes (à adapter plus tard)
        Route::get('/profiles', [CampusLoveController::class, 'getProfiles']);
        Route::post('/like', [CampusLoveController::class, 'likeProfile']);
        Route::post('/pass', [CampusLoveController::class, 'passProfile']);
        Route::post('/skip', [CampusLoveController::class, 'skipProfile']);
        Route::get('/matches', [CampusLoveController::class, 'getMatches']);
        Route::post('/start-conversation', [CampusLoveController::class, 'startConversation']);
        Route::put('/profile', [CampusLoveController::class, 'updateDatingProfile']);
        Route::get('/profile', [CampusLoveController::class, 'getDatingProfile']);
        Route::get('/stats', [CampusLoveController::class, 'getStats']);
        Route::get('/liked-profiles', [CampusLoveController::class, 'getLikedProfiles']);
        Route::get('/passed-profiles', [CampusLoveController::class, 'getPassedProfiles']);
    });
    
    // Routes pour paiement CampusLove
    Route::post('/payment/campus-love', [PaymentController::class, 'initiateCampusLovePayment']);
    Route::post('/payment/campus-love-github', [PaymentController::class, 'initiateCampusLovePaymentGitHub']);
    Route::get('/payment/{paymentId}/status', [PaymentController::class, 'checkPaymentStatus']);
    Route::get('/notifications', [NotificationController::class, 'getUserNotifications']);
    Route::get('/notifications/user/{userId?}', [NotificationController::class, 'getUserNotifications']);
    Route::put('/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/user/{userId?}/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notificationId}', [NotificationController::class, 'deleteNotification']);
    Route::get('/notifications/stats', [NotificationController::class, 'getNotificationStats']);
    
    // Autres endpoints protégés
    Route::get('/users/{userId}/announcements', [AnnouncementController::class, 'getUserAnnouncements']);
    
    // Route pour l'upload des photos de dating
    Route::post('/upload-dating-photo', [UserController::class, 'uploadDatingPhoto']);
    
    // Gestion des annonces utilisateur
    Route::get('/my-announcements', [AnnouncementController::class, 'getUserAnnouncements']);
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    Route::post('/announcements/{announcement}/status', [AnnouncementController::class, 'updateStatus']);
});