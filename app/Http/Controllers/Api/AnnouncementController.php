<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementLike;
use App\Models\AnnouncementView;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\AnnouncementNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class AnnouncementController extends Controller
{
    public function __construct()
    {
        // Authentification requise pour créer/modifier des annonces
        $this->middleware('auth:sanctum', ['except' => ['index', 'show', 'updateWithFiles']]);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Announcement::with(['user', 'category']);
        
        // Inclure les compteurs de likes et vues si demandé
        if ($request->get('with_interactions')) {
            $query->withCount(['likes', 'views']);
            
            // Ajouter le statut de like pour l'utilisateur connecté
            if (Auth::check()) {
                $userId = Auth::id();
                $query->addSelect(['*'])
                    ->selectRaw("EXISTS(SELECT 1 FROM announcement_likes WHERE announcement_id = announcements.id AND user_id = ?) as is_liked", [$userId]);
            }
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->byCategory($request->category_id);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Order by latest
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $announcements = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $announcements->items(),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
                'from' => $announcements->firstItem(),
                'to' => $announcements->lastItem()
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Vérifier que l'utilisateur est authentifié
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|in:sell,buy,service,exchange',
            'location' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'is_urgent' => 'boolean',
            'is_promotional' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
            'media' => 'nullable|array',
            'media.*' => 'nullable|array',
            'media_files' => 'nullable|array',
            'media_files.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi|max:10240'
        ]);

        // Traitement des fichiers uploadés
        $images = $request->images ?? [];
        $media = $request->media ?? [];
        
        if ($request->hasFile('media_files')) {
            foreach ($request->file('media_files') as $file) {
                if ($file->isValid()) {
                    // Déterminer le type de fichier
                    $mimeType = $file->getMimeType();
                    $isVideo = str_starts_with($mimeType, 'video/');
                    $type = $isVideo ? 'video' : 'image';
                    
                    // Générer un nom unique
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    
                    // Stocker le fichier
                    $directory = $isVideo ? 'announcements/videos' : 'announcements/images';
                    $path = $file->storeAs($directory, $fileName, 'public');
                    
                    // Créer l'URL accessible
                    $url = asset('storage/' . $directory . '/' . $fileName);
                    
                    // Ajouter aux collections
                    $images[] = $url;
                    $media[] = [
                        'type' => $type,
                        'url' => $url,
                        'filename' => $fileName,
                        'original_name' => $file->getClientOriginalName(),
                        'size' => $file->getSize(),
                        'mime_type' => $mimeType
                    ];
                }
            }
        }

        $announcement = Announcement::create([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'type' => $request->type,
            'location' => $request->location,
            'category_id' => $request->category_id,
            'user_id' => auth()->id(),
            'is_urgent' => $request->is_urgent ?? false,
            'is_promotional' => $request->is_promotional ?? false,
            'promotional_fee' => $request->is_promotional ? 1 : null,
            'promoted_at' => $request->is_promotional ? now() : null,
            'images' => $images,
            'media' => $media,
            'status' => 'active'
        ]);

        $announcement->load(['user', 'category']);

        // Envoyer notification à tous les utilisateurs si annonce promotionnelle
        try {
            if ($announcement->is_promotional) {
                $users = User::where('verified', true)
                    ->where('id', '!=', $announcement->user_id)
                    ->get();
                    
                Notification::send($users, new AnnouncementNotification($announcement, 'created'));
            }
        } catch (\Exception $e) {
            \Log::warning('Erreur envoi notification annonce', [
                'announcement_id' => $announcement->id, 
                'error' => $e->getMessage()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Annonce créée avec succès',
            'data' => $announcement
        ], 201);
    }

    /**
     * Store a newly created resource with file uploads.
     */
    public function storeWithFiles(Request $request)
    {
        // Vérifier l'authentification manuellement
        if (!$request->bearerToken()) {
            return response()->json([
                'success' => false,
                'message' => 'Token d\'authentification requis'
            ], 401);
        }

        // Authentifier l'utilisateur avec le token
        $user = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken())?->tokenable;
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Token d\'authentification invalide'
            ], 401);
        }

        // Définir l'utilisateur authentifié
        Auth::setUser($user);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|in:sell,buy,service,exchange',
            'location' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'category_id' => 'required|exists:categories,id',
            'is_urgent' => 'boolean',
            'is_promotional' => 'boolean',
            'payment_id' => 'nullable|exists:payments,id',
            'payment_ref' => 'nullable|string',
            'media_files' => 'nullable|array',
            'media_files.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,mov,avi|max:10240'
        ]);

        // Traitement des fichiers uploadés
        $images = [];
        $media = [];
        
        if ($request->hasFile('media_files')) {
            foreach ($request->file('media_files') as $file) {
                if ($file->isValid()) {
                    // Déterminer le type de fichier
                    $mimeType = $file->getMimeType();
                    $isVideo = str_starts_with($mimeType, 'video/');
                    $type = $isVideo ? 'video' : 'image';
                    
                    // Générer un nom unique
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    
                    // Stocker le fichier
                    $directory = $isVideo ? 'announcements/videos' : 'announcements/images';
                    $path = $file->storeAs($directory, $fileName, 'public');
                    
                    // Créer l'URL accessible
                    $url = asset('storage/' . $directory . '/' . $fileName);
                    
                    // Ajouter aux collections
                    $images[] = $url;
                    $media[] = [
                        'type' => $type,
                        'url' => $url,
                        'filename' => $fileName,
                        'original_name' => $file->getClientOriginalName(),
                        'size' => $file->getSize(),
                        'mime_type' => $mimeType
                    ];
                }
            }
        }

        // Vérifier le paiement pour les annonces promotionnelles
        $isPromotional = $request->boolean('is_promotional');
        $promotionalFee = null;
        $promotedAt = null;
        
        if ($isPromotional) {
            // Vérifier si un paiement valide a été fourni
            if ($request->payment_id) {
                $payment = Payment::find($request->payment_id);
                
                if (!$payment) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Paiement introuvable pour cette annonce promotionnelle'
                    ], 400);
                }
                
                if ($payment->status !== 'completed') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Le paiement doit être complété avant de créer l\'annonce promotionnelle'
                    ], 400);
                }
                
                if ($payment->type !== 'promotional') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce paiement ne correspond pas à une promotion d\'annonce'
                    ], 400);
                }
                
                if ($payment->user_id !== auth()->id()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce paiement n\'appartient pas à l\'utilisateur courant'
                    ], 400);
                }
                
                // Paiement valide, activer la promotion
                $promotionalFee = $payment->amount;
                $promotedAt = now();
                
                Log::info('Annonce promotionnelle créée avec paiement valide', [
                    'payment_id' => $payment->id,
                    'payment_ref' => $payment->payment_ref,
                    'amount' => $payment->amount
                ]);
                
            } else {
                // Pas de paiement fourni, rejeter la promotion
                return response()->json([
                    'success' => false,
                    'message' => 'Un paiement valide est requis pour créer une annonce promotionnelle'
                ], 400);
            }
        }

        $announcement = Announcement::create([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'type' => $request->type,
            'location' => $request->location,
            'phone' => $request->phone,
            'category_id' => $request->category_id,
            'user_id' => auth()->id(),
            'is_urgent' => $request->is_urgent ?? false,
            'is_promotional' => $isPromotional,
            'promotional_fee' => $promotionalFee,
            'promoted_at' => $promotedAt,
            'images' => $images,
            'media' => $media,
            'status' => 'active'
        ]);
        
        // Associer l'annonce au paiement si applicable
        if ($isPromotional && $request->payment_id) {
            $payment = Payment::find($request->payment_id);
            $payment->update(['announcement_id' => $announcement->id]);
        }

        $announcement->load(['user', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Annonce créée avec succès avec fichiers uploadés',
            'data' => $announcement
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Announcement $announcement)
    {
        // Increment views
        $announcement->increment('views');
        
        $announcement->load(['user', 'category']);

        return response()->json([
            'success' => true,
            'data' => $announcement
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Announcement $announcement)
    {
        // Vérification de la propriété (temporaire sans auth) 
        $userId = $request->user_id ?? auth()->id() ?? 1;
        if ($announcement->user_id !== $userId && !$request->has('admin_override')) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à modifier cette annonce'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|in:sell,buy,service,exchange',
            'location' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'is_urgent' => 'boolean',
            'is_promotional' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
            'media' => 'nullable|array',
            'media.*' => 'nullable|array',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $updateData = [
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'type' => $request->type,
            'location' => $request->location,
            'category_id' => $request->category_id,
            'is_urgent' => $request->is_urgent ?? false,
            'images' => $request->images ?? [],
            'media' => $request->media ?? []
        ];

        // Si l'annonce devient promotionnelle
        if ($request->is_promotional && !$announcement->is_promotional) {
            $updateData['is_promotional'] = true;
            $updateData['promotional_fee'] = 1;
            $updateData['promoted_at'] = now();
        }

        $announcement->update($updateData);

        $announcement->load(['user', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Annonce mise à jour avec succès',
            'data' => $announcement
        ]);
    }

    /**
     * Update the specified resource with file uploads.
     */
    public function updateWithFiles(Request $request, Announcement $announcement)
    {
        // Vérification de la propriété (temporaire sans auth) 
        $userId = (int)($request->user_id ?? auth()->id() ?? 1);
        if ((int)$announcement->user_id !== $userId && !$request->has('admin_override')) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à modifier cette annonce'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|in:sell,buy,service,exchange',
            'location' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'is_urgent' => 'boolean',
            'is_promotional' => 'boolean',
            'user_id' => 'nullable|exists:users,id',
            'media_files' => 'nullable|array',
            'media_files.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,mov,avi|max:10240',
            'keep_existing_media' => 'boolean'
        ]);

        // Traitement des fichiers uploadés
        $images = $request->get('keep_existing_media', false) ? $announcement->images : [];
        $media = $request->get('keep_existing_media', false) ? $announcement->media : [];
        
        if ($request->hasFile('media_files')) {
            foreach ($request->file('media_files') as $file) {
                if ($file->isValid()) {
                    // Déterminer le type de fichier
                    $mimeType = $file->getMimeType();
                    $isVideo = str_starts_with($mimeType, 'video/');
                    $type = $isVideo ? 'video' : 'image';
                    
                    // Générer un nom unique
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    
                    // Stocker le fichier
                    $directory = $isVideo ? 'announcements/videos' : 'announcements/images';
                    $path = $file->storeAs($directory, $fileName, 'public');
                    
                    // Créer l'URL accessible
                    $url = asset('storage/' . $directory . '/' . $fileName);
                    
                    // Ajouter aux collections
                    $images[] = $url;
                    $media[] = [
                        'type' => $type,
                        'url' => $url,
                        'filename' => $fileName,
                        'original_name' => $file->getClientOriginalName(),
                        'size' => $file->getSize(),
                        'mime_type' => $mimeType
                    ];
                }
            }
        }

        $updateData = [
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'type' => $request->type,
            'location' => $request->location,
            'category_id' => $request->category_id,
            'is_urgent' => $request->is_urgent ?? false,
            'images' => $images,
            'media' => $media
        ];

        // Si l'annonce devient promotionnelle
        if ($request->is_promotional && !$announcement->is_promotional) {
            $updateData['is_promotional'] = true;
            $updateData['promotional_fee'] = 1;
            $updateData['promoted_at'] = now();
        }

        $announcement->update($updateData);

        $announcement->load(['user', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Annonce mise à jour avec succès avec nouveaux médias',
            'data' => $announcement
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Annonce supprimée avec succès'
        ]);
    }

    /**
     * Update announcement status
     */
    public function updateStatus(Request $request, Announcement $announcement)
    {
        // Vérification de la propriété (temporaire sans auth) 
        $userId = $request->user_id ?? auth()->id() ?? 1;
        if ($announcement->user_id !== $userId && !$request->has('admin_override')) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à modifier le statut de cette annonce'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:active,pending,sold,paused,expired,inactive',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $announcement->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $announcement
        ]);
    }

    /**
     * Get user's own announcements
     */
    public function getUserAnnouncements(Request $request, $userId = null)
    {
        try {
            // Si aucun userId fourni, utiliser l'utilisateur connecté
            $targetUserId = $userId ?? Auth::id() ?? 1; // Fallback to user 1 for testing
            
            if (!$targetUserId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $query = Announcement::where('user_id', $targetUserId)
                ->with(['user', 'category'])
                ->withCount(['likes', 'views']);

            // Filtrer par statut si demandé
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Trier par date de création (plus récent en premier)
            $query->orderBy('created_at', 'desc');

            // Pagination
            $perPage = $request->get('per_page', 15);
            $announcements = $query->paginate($perPage);

            // Transformer les données pour le frontend
            $announcements->getCollection()->transform(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'description' => $announcement->description,
                    'price' => $announcement->price,
                    'type' => $announcement->type,
                    'category' => $announcement->category,
                    'location' => $announcement->location,
                    'status' => $announcement->status,
                    'is_urgent' => $announcement->is_urgent,
                    'images' => is_string($announcement->images) ? json_decode($announcement->images, true) : ($announcement->images ?: []),
                    'media' => is_string($announcement->media) ? json_decode($announcement->media, true) : ($announcement->media ?: []),
                    'views' => $announcement->views_count ?? $announcement->views ?? 0,
                    'likes' => $announcement->likes_count ?? $announcement->likes ?? 0,
                    'created_at' => $announcement->created_at,
                    'updated_at' => $announcement->updated_at,
                    'user' => $announcement->user
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $announcements->items(),
                'meta' => [
                    'current_page' => $announcements->currentPage(),
                    'last_page' => $announcements->lastPage(),
                    'per_page' => $announcements->perPage(),
                    'total' => $announcements->total(),
                    'from' => $announcements->firstItem(),
                    'to' => $announcements->lastItem()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des annonces',
                'error' => $e->getMessage()
            ], 1);
        }
    }
}