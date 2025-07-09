<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        // Validate both frontend and backend field names
        $request->validate([
            // Accept either 'name' or firstName/lastName from frontend
            'firstName' => 'required_without:name|string|max:255',
            'lastName' => 'required_without:name|string|max:255',
            'name' => 'required_without_all:firstName,lastName|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            // Accept both confirmPassword (frontend) and password_confirmation (Laravel standard)
            'confirmPassword' => 'required_with:password|same:password',
            'password_confirmation' => 'sometimes|same:password',
            'phone' => 'nullable|string|max:20',
            'university' => 'nullable|string|max:255',
            // Accept both study_level and studyLevel
            'study_level' => 'nullable|string|max:100',
            'studyLevel' => 'nullable|string|max:100',
            // Accept both field and fieldOfStudy
            'field' => 'nullable|string|max:100',
            'fieldOfStudy' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            // Accept both is_student and isStudent
            'is_student' => 'boolean',
            'isStudent' => 'boolean',
        ], [
            'firstName.required_without' => 'Le prénom est requis.',
            'lastName.required_without' => 'Le nom est requis.',
            'name.required_without_all' => 'Le nom complet est requis.',
            'email.required' => 'L\'adresse email est requise.',
            'email.email' => 'L\'adresse email doit être valide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'password.required' => 'Le mot de passe est requis.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'confirmPassword.required_with' => 'La confirmation du mot de passe est requise.',
            'confirmPassword.same' => 'Les mots de passe ne correspondent pas.',
            'phone.max' => 'Le numéro de téléphone ne peut pas dépasser 20 caractères.',
            'university.max' => 'Le nom de l\'université ne peut pas dépasser 255 caractères.',
            'study_level.max' => 'Le niveau d\'études ne peut pas dépasser 100 caractères.',
            'studyLevel.max' => 'Le niveau d\'études ne peut pas dépasser 100 caractères.',
            'field.max' => 'Le domaine d\'études ne peut pas dépasser 100 caractères.',
            'fieldOfStudy.max' => 'Le domaine d\'études ne peut pas dépasser 100 caractères.',
            'bio.max' => 'La biographie ne peut pas dépasser 1000 caractères.',
            'location.max' => 'La localisation ne peut pas dépasser 255 caractères.',
        ]);

        // Build the name field from firstName/lastName if needed
        $name = $request->name;
        if (!$name && ($request->firstName || $request->lastName)) {
            $name = trim(($request->firstName ?? '') . ' ' . ($request->lastName ?? ''));
        }

        $user = User::create([
            'name' => $name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'university' => $request->university,
            'study_level' => $request->study_level ?? $request->studyLevel,
            'field' => $request->field ?? $request->fieldOfStudy,
            'bio' => $request->bio,
            'location' => $request->location,
            'is_student' => $request->boolean('is_student') || $request->boolean('isStudent', true),
            'last_seen' => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie!',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'email.required' => 'L\'adresse email est requise.',
            'email.email' => 'L\'adresse email doit être valide.',
            'password.required' => 'Le mot de passe est requis.',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Email ou mot de passe incorrect.'],
            ]);
        }

        $user = Auth::user();
        $user->updateLastSeen();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie!',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie!'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->updateLastSeen();

        return response()->json([
            'success' => true,
            'user' => $user,
            'is_online' => $user->isOnline(),
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'string|max:255',
            'phone' => 'nullable|string|max:20',
            'university' => 'nullable|string|max:255',
            'study_level' => 'nullable|string|max:100',
            'field' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            'is_student' => 'boolean',
        ], [
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'phone.max' => 'Le numéro de téléphone ne peut pas dépasser 20 caractères.',
            'university.max' => 'Le nom de l\'université ne peut pas dépasser 255 caractères.',
            'study_level.max' => 'Le niveau d\'études ne peut pas dépasser 100 caractères.',
            'field.max' => 'Le domaine d\'études ne peut pas dépasser 100 caractères.',
            'bio.max' => 'La biographie ne peut pas dépasser 1000 caractères.',
            'location.max' => 'La localisation ne peut pas dépasser 255 caractères.',
        ]);

        $user->update($request->only([
            'name',
            'phone',
            'university',
            'study_level',
            'field',
            'bio',
            'location',
            'is_student',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès!',
            'user' => $user->fresh(),
        ]);
    }
}