<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UniversityController;
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

    // Rencontres
    Route::get('/meetings', function () {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'title' => 'Soirée étudiante - Rentrée 2024',
                    'description' => 'Grande soirée pour célébrer la rentrée universitaire !',
                    'date' => '2024-02-15T20:00:00Z',
                    'location' => 'Bar Le Central, Yaoundé',
                    'organizer' => [
                        'name' => 'Marie Dubois',
                        'avatar' => 'https://via.placeholder.com/50',
                        'isStudent' => true,
                        'university' => 'Université de Yaoundé I'
                    ],
                    'participants' => 28,
                    'maxParticipants' => 50,
                    'category' => 'party',
                    'price' => 15
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

    Route::post('/meetings', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Rencontre créée avec succès',
            'data' => [
                'id' => rand(100, 999),
                'title' => $request->title,
                'description' => $request->description,
                'date' => $request->date,
                'location' => $request->location,
                'createdAt' => now()->toISOString()
            ]
        ]);
    });

});