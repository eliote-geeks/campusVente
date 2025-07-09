<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function __construct()
    {
        // Désactiver l'authentification pour les tests
        // $this->middleware('auth:sanctum');
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Announcement::with(['user', 'category']);

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

        // Get results
        $announcements = $query->get();

        return response()->json([
            'success' => true,
            'data' => $announcements,
            'total' => $announcements->count()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|in:sell,buy,service,exchange',
            'location' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'is_urgent' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string'
        ]);

        $announcement = Announcement::create([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'type' => $request->type,
            'location' => $request->location,
            'category_id' => $request->category_id,
            'user_id' => auth()->id() ?? 1, // Default to user 1 for testing
            'is_urgent' => $request->is_urgent ?? false,
            'images' => $request->images ?? [],
            'status' => 'pending'
        ]);

        $announcement->load(['user', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Annonce créée avec succès',
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
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|in:sell,buy,service,exchange',
            'location' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'is_urgent' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string'
        ]);

        $announcement->update([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'type' => $request->type,
            'location' => $request->location,
            'category_id' => $request->category_id,
            'is_urgent' => $request->is_urgent ?? false,
            'images' => $request->images ?? []
        ]);

        $announcement->load(['user', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Annonce mise à jour avec succès',
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
        $request->validate([
            'status' => 'required|in:active,pending,sold,inactive'
        ]);

        $announcement->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $announcement
        ]);
    }
}