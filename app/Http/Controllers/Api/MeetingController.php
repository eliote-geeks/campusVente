<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\Request;

class MeetingController extends Controller
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
        $query = Meeting::with(['user', 'category', 'participants']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filter by location
        if ($request->has('location')) {
            $query->byLocation($request->location);
        }

        // Filter featured
        if ($request->has('featured') && $request->featured) {
            $query->featured();
        }

        // Filter free
        if ($request->has('free') && $request->free) {
            $query->free();
        }

        // Filter online
        if ($request->has('online') && $request->online) {
            $query->online();
        }

        // Filter upcoming
        if ($request->has('upcoming') && $request->upcoming) {
            $query->upcoming();
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Date range filter
        if ($request->has('date_from')) {
            $query->where('meeting_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('meeting_date', '<=', $request->date_to);
        }

        // Order by meeting date
        $query->orderBy('meeting_date', 'asc');

        // Get results
        $meetings = $query->get();

        return response()->json([
            'success' => true,
            'data' => $meetings,
            'total' => $meetings->count()
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
            'type' => 'required|in:study_group,networking,party,sport,cultural,conference,workshop,other',
            'meeting_date' => 'required|date|after:now',
            'location' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'max_participants' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'is_online' => 'boolean',
            'online_link' => 'nullable|url',
            'requirements' => 'nullable|string',
            'contact_info' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string'
        ]);

        $meeting = Meeting::create([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'meeting_date' => $request->meeting_date,
            'location' => $request->location,
            'address' => $request->address,
            'max_participants' => $request->max_participants,
            'price' => $request->price ?? 0,
            'is_free' => $request->is_free ?? true,
            'is_online' => $request->is_online ?? false,
            'online_link' => $request->online_link,
            'requirements' => $request->requirements,
            'contact_info' => $request->contact_info,
            'category_id' => $request->category_id,
            'images' => $request->images ?? [],
            'user_id' => 1, // Default to user 1 for testing (without auth)
            'status' => 'upcoming'
        ]);

        // Add creator as organizer
        $meeting->addParticipant($meeting->user_id, null, true);

        $meeting->load(['user', 'category', 'participants']);

        return response()->json([
            'success' => true,
            'message' => 'Rencontre créée avec succès',
            'data' => $meeting
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Meeting $meeting)
    {
        // Increment views
        $meeting->increment('views');
        
        $meeting->load(['user', 'category', 'participants']);

        return response()->json([
            'success' => true,
            'data' => $meeting
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Meeting $meeting)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:study_group,networking,party,sport,cultural,conference,workshop,other',
            'meeting_date' => 'required|date|after:now',
            'location' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'max_participants' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'is_online' => 'boolean',
            'online_link' => 'nullable|url',
            'requirements' => 'nullable|string',
            'contact_info' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string'
        ]);

        $meeting->update([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'meeting_date' => $request->meeting_date,
            'location' => $request->location,
            'address' => $request->address,
            'max_participants' => $request->max_participants,
            'price' => $request->price ?? 0,
            'is_free' => $request->is_free ?? true,
            'is_online' => $request->is_online ?? false,
            'online_link' => $request->online_link,
            'requirements' => $request->requirements,
            'contact_info' => $request->contact_info,
            'category_id' => $request->category_id,
            'images' => $request->images ?? []
        ]);

        $meeting->load(['user', 'category', 'participants']);

        return response()->json([
            'success' => true,
            'message' => 'Rencontre mise à jour avec succès',
            'data' => $meeting
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Meeting $meeting)
    {
        $meeting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rencontre supprimée avec succès'
        ]);
    }

    /**
     * Update meeting status
     */
    public function updateStatus(Request $request, Meeting $meeting)
    {
        $request->validate([
            'status' => 'required|in:upcoming,ongoing,completed,cancelled'
        ]);

        $meeting->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $meeting
        ]);
    }

    /**
     * Join a meeting
     */
    public function join(Request $request, Meeting $meeting)
    {
        $request->validate([
            'message' => 'nullable|string|max:500'
        ]);

        $userId = 1; // Default to user 1 for testing (without auth)

        if (!$meeting->can_join) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de rejoindre cette rencontre'
            ], 400);
        }

        if ($meeting->addParticipant($userId, $request->message)) {
            return response()->json([
                'success' => true,
                'message' => 'Vous avez rejoint la rencontre avec succès',
                'data' => $meeting->fresh(['participants'])
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Vous participez déjà à cette rencontre'
        ], 400);
    }

    /**
     * Leave a meeting
     */
    public function leave(Meeting $meeting)
    {
        $userId = 1; // Default to user 1 for testing (without auth)

        if ($meeting->removeParticipant($userId)) {
            return response()->json([
                'success' => true,
                'message' => 'Vous avez quitté la rencontre',
                'data' => $meeting->fresh(['participants'])
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Vous ne participez pas à cette rencontre'
        ], 400);
    }

    /**
     * Get meeting participants
     */
    public function participants(Meeting $meeting)
    {
        $participants = $meeting->participants()
            ->withPivot(['status', 'message', 'is_organizer'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $participants
        ]);
    }

    /**
     * Update participant status
     */
    public function updateParticipantStatus(Request $request, Meeting $meeting, $userId)
    {
        $request->validate([
            'status' => 'required|in:registered,confirmed,attended,absent,cancelled'
        ]);

        $updated = $meeting->updateParticipantStatus($userId, $request->status);

        if ($updated) {
            return response()->json([
                'success' => true,
                'message' => 'Statut du participant mis à jour'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Participant non trouvé'
        ], 404);
    }
}