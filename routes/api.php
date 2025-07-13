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
    Route::post('/login', [AuthController::class, 'login']);

    // Annonces
    Route::get('/announcements', function () {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'title' => 'iPhone 13 Pro Max',
                    'description' => 'iPhone 13 Pro Max 128GB, couleur bleu sierra, excellent état.',
                    'price' => 850,
                    'category' => 'electronics',
                    'images' => ['https://via.placeholder.com/300x200'],
                    'author' => [
                        'name' => 'Marie Laurent',
                        'avatar' => 'https://via.placeholder.com/50',
                        'isStudent' => true,
                        'university' => 'Université de Yaoundé I',
                        'rating' => 4.8
                    ],
                    'location' => 'Yaoundé',
                    'createdAt' => '2024-01-15T10:00:00Z',
                    'views' => 124,
                    'likes' => 28,
                    'urgent' => true
                ],
                [
                    'id' => 2,
                    'title' => 'Cours particuliers d\'anglais',
                    'description' => 'Professeur d\'anglais natif propose cours particuliers tous niveaux.',
                    'price' => 30,
                    'category' => 'services',
                    'author' => [
                        'name' => 'James Wilson',
                        'avatar' => 'https://via.placeholder.com/50',
                        'isStudent' => false,
                        'rating' => 4.9
                    ],
                    'location' => 'Douala',
                    'createdAt' => '2024-01-14T15:30:00Z',
                    'views' => 67,
                    'likes' => 15
                ]
            ]
        ]);
    });


    // Universités
    Route::get('/universities', function () {
        $universities = \App\Models\University::active()->get();
        return response()->json([
            'success' => true,
            'data' => $universities
        ]);
    });

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
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    Route::post('/announcements/{announcement}/status', [AnnouncementController::class, 'updateStatus']);

    // Users management - temporarily public for testing
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::get('/users-stats', [UserController::class, 'getStats']);

    // Dashboard statistics
    Route::get('/dashboard/overview', [DashboardController::class, 'getOverview']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'getRecentActivity']);
    Route::get('/dashboard/announcements-by-category', [DashboardController::class, 'getAnnouncementsByCategory']);
    Route::get('/dashboard/announcements-by-type', [DashboardController::class, 'getAnnouncementsByType']);
    Route::get('/dashboard/monthly-growth', [DashboardController::class, 'getMonthlyGrowth']);
    Route::get('/dashboard/top-universities', [DashboardController::class, 'getTopUniversities']);
    Route::get('/dashboard/meetings-by-type', [DashboardController::class, 'getMeetingsByType']);
    Route::get('/dashboard/meetings-by-status', [DashboardController::class, 'getMeetingsByStatus']);

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
    Route::get('/users/top-rated', [UserRatingController::class, 'getTopRatedUsers']);
    Route::get('/users/recommended', [UserRatingController::class, 'getRecommendedUsers']);
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

    Route::post('/announcements', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Annonce créée avec succès',
            'data' => [
                'id' => rand(100, 999),
                'title' => $request->title,
                'description' => $request->description,
                'price' => $request->price,
                'category' => $request->category,
                'createdAt' => now()->toISOString()
            ]
        ]);
    });

    // Likes (nécessite authentification)
    Route::post('/announcements/{announcement}/like', [AnnouncementInteractionController::class, 'toggleLike']);
    
    // Recommandations personnalisées (nécessite authentification)
    Route::get('/recommendations/personal', [RecommendationController::class, 'getRecommendations']);
    Route::get('/recommendations/stats', [RecommendationController::class, 'getUserRecommendationStats']);
    
    // Notation des utilisateurs (nécessite authentification)
    Route::post('/users/{user}/rate', [UserRatingController::class, 'rateUser']);
    Route::get('/users/{user}/can-rate', [UserRatingController::class, 'canRateUser']);
    Route::put('/ratings/{rating}', [UserRatingController::class, 'updateRating']);
});