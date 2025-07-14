<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
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
        $query = User::query();

        // Filter by status
        if ($request->has('active')) {
            $query->where('verified', $request->active);
        }

        // Filter by type
        if ($request->has('is_student')) {
            $query->where('is_student', $request->is_student);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('university', 'like', '%' . $request->search . '%');
            });
        }

        // Order by latest
        $query->orderBy('created_at', 'desc');

        // Get results
        $users = $query->get();

        return response()->json([
            'success' => true,
            'data' => $users,
            'total' => $users->count()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'university' => 'nullable|string|max:255',
            'study_level' => 'nullable|string|max:100',
            'field' => 'nullable|string|max:100',
            'bio' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'is_student' => 'boolean'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'university' => $request->university,
            'study_level' => $request->study_level,
            'field' => $request->field,
            'bio' => $request->bio,
            'location' => $request->location,
            'is_student' => $request->is_student ?? true,
            'verified' => true // Auto-verify for admin creation
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'data' => $user
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($userId)
    {
        try {
            $user = User::findOrFail($userId);
            
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé',
                'error' => 'User not found'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $userId)
    {
        try {
            $user = User::findOrFail($userId);
            
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'university' => 'nullable|string|max:255',
            'study_level' => 'nullable|string|max:100',
            'field' => 'nullable|string|max:100',
            'bio' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'is_student' => 'boolean',
            'verified' => 'boolean'
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'university' => $request->university,
            'study_level' => $request->study_level,
            'field' => $request->field,
            'bio' => $request->bio,
            'location' => $request->location,
            'is_student' => $request->is_student ?? true,
            'verified' => $request->verified ?? $user->verified
        ];

        // Update password if provided
        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $user
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé',
                'error' => 'User not found'
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    /**
     * Toggle user verification status
     */
    public function toggleStatus(Request $request, User $user)
    {
        $user->update(['verified' => !$user->verified]);

        return response()->json([
            'success' => true,
            'message' => 'Statut utilisateur mis à jour avec succès',
            'data' => $user
        ]);
    }

    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        $stats = [
            'totalUsers' => User::count(),
            'activeUsers' => User::where('verified', true)->count(),
            'studentsCount' => User::where('is_student', true)->count(),
            'professionalsCount' => User::where('is_student', false)->count(),
            'todaySignups' => User::whereDate('created_at', today())->count(),
            'thisWeekSignups' => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'onlineUsers' => User::where('last_seen', '>=', now()->subMinutes(5))->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}