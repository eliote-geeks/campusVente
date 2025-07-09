<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // Filter by active status
        if ($request->has('active_only') && $request->active_only) {
            $query->active();
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Sort
        $query->ordered();

        $categories = $query->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
            'total' => $categories->count()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'icon' => 'nullable|string|max:10',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'icon' => $request->icon,
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
            'sort_order' => $request->sort_order ?? 0
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Catégorie créée avec succès',
            'data' => $category
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        // Load count will be added when Announcement model is created

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'icon' => 'nullable|string|max:10',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'icon' => $request->icon,
            'description' => $request->description,
            'is_active' => $request->is_active ?? $category->is_active,
            'sort_order' => $request->sort_order ?? $category->sort_order
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Catégorie mise à jour avec succès',
            'data' => $category
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category has active announcements (will be added when Announcement model is created)
        // For now, allow deletion

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catégorie supprimée avec succès'
        ]);
    }

    /**
     * Toggle category status
     */
    public function toggleStatus(Category $category)
    {
        $category->update([
            'is_active' => !$category->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => $category->is_active ? 'Catégorie activée' : 'Catégorie désactivée',
            'data' => $category
        ]);
    }
}
