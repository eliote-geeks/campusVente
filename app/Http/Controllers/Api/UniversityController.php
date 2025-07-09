<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UniversityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = University::query();

        // Filter by active status
        if ($request->has('active_only') && $request->active_only) {
            $query->where('active', true);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('city', 'LIKE', "%{$search}%")
                  ->orWhere('region', 'LIKE', "%{$search}%");
            });
        }

        // Sort by name
        $query->orderBy('name');

        $universities = $query->withCount('users as students_count')->get();

        return response()->json([
            'success' => true,
            'data' => $universities,
            'total' => $universities->count()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:universities,name',
            'acronym' => 'nullable|string|max:10',
            'city' => 'required|string|max:255',
            'region' => 'required|string|max:255',
            'type' => 'required|in:public,private',
            'founded' => 'nullable|integer|min:1800|max:' . date('Y'),
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:1000',
            'active' => 'boolean'
        ]);

        $university = University::create([
            'name' => $request->name,
            'acronym' => $request->acronym,
            'city' => $request->city,
            'region' => $request->region,
            'type' => $request->type,
            'founded' => $request->founded,
            'website' => $request->website,
            'description' => $request->description,
            'active' => $request->active ?? true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Université créée avec succès',
            'data' => $university
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(University $university)
    {
        $university->loadCount('users as students_count');

        return response()->json([
            'success' => true,
            'data' => $university
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, University $university)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('universities')->ignore($university->id)],
            'acronym' => 'nullable|string|max:10',
            'city' => 'required|string|max:255',
            'region' => 'required|string|max:255',
            'type' => 'required|in:public,private',
            'founded' => 'nullable|integer|min:1800|max:' . date('Y'),
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:1000',
            'active' => 'boolean'
        ]);

        $university->update([
            'name' => $request->name,
            'acronym' => $request->acronym,
            'city' => $request->city,
            'region' => $request->region,
            'type' => $request->type,
            'founded' => $request->founded,
            'website' => $request->website,
            'description' => $request->description,
            'active' => $request->active ?? $university->active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Université mise à jour avec succès',
            'data' => $university
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(University $university)
    {
        // Check if university has users
        $usersCount = $university->users()->count();
        
        if ($usersCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Impossible de supprimer cette université car elle contient {$usersCount} utilisateur(s)"
            ], 422);
        }

        $university->delete();

        return response()->json([
            'success' => true,
            'message' => 'Université supprimée avec succès'
        ]);
    }

    /**
     * Toggle university status
     */
    public function toggleStatus(University $university)
    {
        $university->update([
            'active' => !$university->active
        ]);

        return response()->json([
            'success' => true,
            'message' => $university->active ? 'Université activée' : 'Université désactivée',
            'data' => $university
        ]);
    }
}