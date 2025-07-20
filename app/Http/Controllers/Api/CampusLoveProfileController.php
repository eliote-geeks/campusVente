<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampusLoveProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class CampusLoveProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Obtenir le profil CampusLove de l'utilisateur connecté
     */
    public function getMyProfile(Request $request)
    {
        try {
            $user = Auth::user();
            $profile = CampusLoveProfile::where('user_id', $user->id)->first();

            if (!$profile) {
                // Créer un profil vide si il n'existe pas
                $profile = CampusLoveProfile::create([
                    'user_id' => $user->id,
                    'display_name' => $user->name,
                    'is_active' => true,
                ]);
            }

            // Mettre à jour la dernière activité
            $profile->updateLastActive();

            // Calculer le pourcentage de completion
            $profile->calculateCompletionPercentage();

            return response()->json([
                'success' => true,
                'data' => $profile->load('user')
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération profil CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil'
            ], 500);
        }
    }

    /**
     * Mettre à jour le profil CampusLove
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                // Informations de base
                'display_name' => 'sometimes|string|max:100',
                'bio' => 'sometimes|string|max:500',
                'tagline' => 'sometimes|string|max:100',
                'about_me' => 'sometimes|string|max:1000',
                'looking_for_description' => 'sometimes|string|max:500',
                'fun_facts' => 'sometimes|string|max:300',
                'birth_date' => 'sometimes|date|before:today',
                'gender' => 'sometimes|in:male,female,other',
                'looking_for' => 'sometimes|in:male,female,both',
                
                // Localisation
                'city' => 'sometimes|string|max:100',
                'region' => 'sometimes|string|max:100',
                'latitude' => 'sometimes|numeric|between:-90,90',
                'longitude' => 'sometimes|numeric|between:-180,180',
                
                // Éducation et profession
                'university' => 'sometimes|string|max:200',
                'study_level' => 'sometimes|string|max:100',
                'field_of_study' => 'sometimes|string|max:100',
                'occupation' => 'sometimes|string|max:150',
                'graduation_year' => 'sometimes|integer|min:2020|max:2040',
                
                // Préférences de matching
                'min_age' => 'sometimes|integer|min:18|max:100',
                'max_age' => 'sometimes|integer|min:18|max:100',
                
                // Intérêts et lifestyle
                'interests' => 'sometimes|array|max:10',
                'interests.*' => 'string|max:50',
                'hobbies' => 'sometimes|array|max:15',
                'hobbies.*' => 'string|max:50',
                'music_preferences' => 'sometimes|array|max:10',
                'music_preferences.*' => 'string|max:50',
                'movie_preferences' => 'sometimes|array|max:10',
                'movie_preferences.*' => 'string|max:50',
                'sport_activities' => 'sometimes|array|max:10',
                'sport_activities.*' => 'string|max:50',
                'travel_places' => 'sometimes|array|max:15',
                'travel_places.*' => 'string|max:50',
                'languages' => 'sometimes|array|max:10',
                'languages.*' => 'string|max:50',
                
                // Style social et préférences
                'social_style' => 'sometimes|in:introvert,extrovert,ambivert',
                'party_style' => 'sometimes|in:homebody,occasional,party_lover',
                'communication_style' => 'sometimes|in:texter,caller,face_to_face',
                
                // Questions de compatibilité
                'pets' => 'sometimes|in:love_pets,no_pets,allergic,neutral',
                'kids_future' => 'sometimes|in:want_kids,no_kids,maybe,have_kids',
                'fitness_level' => 'sometimes|in:very_active,moderately_active,lightly_active,sedentary',
                'diet_type' => 'sometimes|in:omnivore,vegetarian,vegan,pescatarian,other',
                
                // Descriptions avancées
                'ideal_date_description' => 'sometimes|string|max:500',
                'weekend_activities' => 'sometimes|array|max:10',
                'weekend_activities.*' => 'string|max:50',
                'favorite_quote' => 'sometimes|string|max:200',
                'deal_breakers' => 'sometimes|array|max:5',
                'deal_breakers.*' => 'string|max:100',
                'relationship_goals' => 'sometimes|array|max:5',
                'relationship_goals.*' => 'string|max:100',
                
                // Préférences d'affichage
                'show_age' => 'sometimes|boolean',
                'show_distance' => 'sometimes|boolean',
                'show_university' => 'sometimes|boolean',
                'show_occupation' => 'sometimes|boolean',
                'show_hobbies' => 'sometimes|boolean',
                'show_music_taste' => 'sometimes|boolean',
                'show_travel_history' => 'sometimes|boolean',
                
                // Informations lifestyle
                'relationship_type' => 'sometimes|in:serious,casual,friendship,both',
                'height' => 'sometimes|string|max:20',
                'smoking' => 'sometimes|in:never,socially,regularly',
                'drinking' => 'sometimes|in:never,socially,regularly',
                'religion' => 'sometimes|string|max:100',
                'is_active' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validation des âges
            if ($request->has(['min_age', 'max_age'])) {
                if ($request->min_age >= $request->max_age) {
                    return response()->json([
                        'success' => false,
                        'message' => 'L\'âge minimum doit être inférieur à l\'âge maximum'
                    ], 422);
                }
            }

            $profile = CampusLoveProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'display_name' => $user->name,
                    'is_active' => true,
                ]
            );

            // Mettre à jour les champs
            $profile->fill($request->only([
                // Informations de base
                'display_name',
                'bio',
                'tagline',
                'about_me',
                'looking_for_description',
                'fun_facts',
                'birth_date',
                'gender',
                'looking_for',
                
                // Localisation
                'city',
                'region',
                'latitude',
                'longitude',
                
                // Éducation et profession
                'university',
                'study_level',
                'field_of_study',
                'occupation',
                'graduation_year',
                
                // Préférences de matching
                'min_age',
                'max_age',
                
                // Intérêts et lifestyle
                'interests',
                'hobbies',
                'music_preferences',
                'movie_preferences',
                'sport_activities',
                'travel_places',
                'languages',
                
                // Style social et préférences
                'social_style',
                'party_style',
                'communication_style',
                
                // Questions de compatibilité
                'pets',
                'kids_future',
                'fitness_level',
                'diet_type',
                
                // Descriptions avancées
                'ideal_date_description',
                'weekend_activities',
                'favorite_quote',
                'deal_breakers',
                'relationship_goals',
                
                // Préférences d'affichage
                'show_age',
                'show_distance',
                'show_university',
                'show_occupation',
                'show_hobbies',
                'show_music_taste',
                'show_travel_history',
                
                // Informations lifestyle
                'relationship_type',
                'height',
                'smoking',
                'drinking',
                'religion',
                'is_active'
            ]));

            $profile->save();

            // Recalculer le pourcentage de completion
            $profile->calculateCompletionPercentage();

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => $profile->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour profil CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil'
            ], 500);
        }
    }

    /**
     * Uploader une photo de profil
     */
    public function uploadPhoto(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
                'is_profile_photo' => 'sometimes|boolean',
                'description' => 'sometimes|string|max:200',
                'location' => 'sometimes|string|max:100',
                'tags' => 'sometimes|array|max:5',
                'tags.*' => 'string|max:30'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Photo invalide',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $profile = CampusLoveProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'display_name' => $user->name,
                    'is_active' => true,
                ]
            );

            $photo = $request->file('photo');
            
            // Créer le dossier utilisateur s'il n'existe pas
            $userDir = 'public/campus_love/' . $user->id;
            if (!Storage::exists($userDir)) {
                Storage::makeDirectory($userDir, 0755, true);
            }
            
            // S'assurer que le dossier physique existe aussi
            $physicalDir = storage_path('app/public/campus_love/' . $user->id);
            if (!is_dir($physicalDir)) {
                mkdir($physicalDir, 0755, true);
            }
            
            $filename = time() . '_' . uniqid() . '.jpg'; // Toujours en JPG après traitement
            $photoPath = 'campus_love/' . $user->id . '/' . $filename;
            $fullPath = storage_path('app/public/' . $photoPath);
            
            // Redimensionner et optimiser l'image
            $manager = new ImageManager(new Driver());
            $image = $manager->read($photo->getPathname());
            
            // Redimensionner pour le swipe (maximum 1080px de largeur, qualité optimisée)
            $image->scaleDown(width: 1080);
            
            // Sauvegarder avec compression optimale
            $image->toJpeg(85)->save($fullPath);
            
            // Créer une version thumbnail (500px pour les previews)
            $thumbnailPath = 'campus_love/' . $user->id . '/thumb_' . $filename;
            $thumbnailFullPath = storage_path('app/public/' . $thumbnailPath);
            
            $thumbnail = $manager->read($photo->getPathname());
            $thumbnail->scaleDown(width: 500);
            $thumbnail->toJpeg(80)->save($thumbnailFullPath);

            // Ajouter la photo au profil
            $profile->addPhoto($photoPath);
            
            // Gérer les métadonnées de la photo
            $photoDescriptions = $profile->photo_descriptions ?? [];
            $photoLocations = $profile->photo_locations ?? [];
            $photoTags = $profile->photo_tags ?? [];
            
            $photoIndex = count($profile->photos) - 1; // Index de la nouvelle photo
            
            if ($request->has('description')) {
                $photoDescriptions[$photoIndex] = $request->description;
            }
            
            if ($request->has('location')) {
                $photoLocations[$photoIndex] = $request->location;
            }
            
            if ($request->has('tags')) {
                $photoTags[$photoIndex] = $request->tags;
            }
            
            // Mettre à jour les métadonnées
            $profile->update([
                'photo_descriptions' => $photoDescriptions,
                'photo_locations' => $photoLocations,
                'photo_tags' => $photoTags,
                'last_photo_update' => now()
            ]);

            // Si c'est marqué comme photo de profil ou si c'est la première photo
            if ($request->boolean('is_profile_photo') || !$profile->profile_photo) {
                $profile->setProfilePhoto($photoPath);
            }

            // Recalculer le pourcentage de completion
            $profile->calculateCompletionPercentage();

            return response()->json([
                'success' => true,
                'message' => 'Photo uploadée avec succès',
                'data' => [
                    'photo_url' => Storage::url($photoPath),
                    'thumbnail_url' => Storage::url($thumbnailPath),
                    'photo_path' => $photoPath,
                    'photo_index' => $photoIndex,
                    'metadata' => [
                        'description' => $request->description,
                        'location' => $request->location,
                        'tags' => $request->tags ?? []
                    ],
                    'profile' => $profile->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur upload photo CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de la photo'
            ], 500);
        }
    }

    /**
     * Supprimer une photo
     */
    public function deletePhoto(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'photo_path' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chemin de photo requis',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $profile = CampusLoveProfile::where('user_id', $user->id)->first();

            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil non trouvé'
                ], 404);
            }

            $photoPath = $request->photo_path;
            
            // Vérifier que la photo appartient à l'utilisateur
            $photos = $profile->photos ?? [];
            if (!in_array($photoPath, $photos)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Photo non trouvée dans votre profil'
                ], 404);
            }

            // Supprimer la photo
            $profile->removePhoto($photoPath);

            // Recalculer le pourcentage de completion
            $profile->calculateCompletionPercentage();

            return response()->json([
                'success' => true,
                'message' => 'Photo supprimée avec succès',
                'data' => $profile->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur suppression photo CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la photo'
            ], 500);
        }
    }

    /**
     * Définir une photo comme photo de profil principale
     */
    public function setProfilePhoto(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'photo_path' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chemin de photo requis',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $profile = CampusLoveProfile::where('user_id', $user->id)->first();

            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil non trouvé'
                ], 404);
            }

            $photoPath = $request->photo_path;
            
            // Vérifier que la photo appartient à l'utilisateur
            $photos = $profile->photos ?? [];
            if (!in_array($photoPath, $photos)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Photo non trouvée dans votre profil'
                ], 404);
            }

            // Définir comme photo de profil
            $profile->setProfilePhoto($photoPath);

            return response()->json([
                'success' => true,
                'message' => 'Photo de profil mise à jour avec succès',
                'data' => $profile->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur définition photo profil CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la photo de profil'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques du profil
     */
    public function getProfileStats(Request $request)
    {
        try {
            $user = Auth::user();
            $profile = CampusLoveProfile::where('user_id', $user->id)->first();

            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil non trouvé'
                ], 404);
            }

            $completionPercentage = $profile->calculateCompletionPercentage();
            $photosCount = is_array($profile->photos) ? count($profile->photos) : 0;

            $missingFields = [];
            $requiredFields = [
                'display_name' => 'Nom d\'affichage',
                'bio' => 'Description',
                'birth_date' => 'Date de naissance',
                'gender' => 'Genre',
                'looking_for' => 'Recherche',
                'city' => 'Ville',
                'university' => 'Université',
                'study_level' => 'Niveau d\'études',
                'field_of_study' => 'Domaine d\'études',
                'profile_photo' => 'Photo de profil'
            ];

            foreach ($requiredFields as $field => $label) {
                if (empty($profile->$field)) {
                    $missingFields[] = $label;
                }
            }

            $suggestions = [];
            if ($photosCount < 3) {
                $suggestions[] = 'Ajoutez plus de photos pour augmenter vos chances de match';
            }
            if (empty($profile->interests)) {
                $suggestions[] = 'Ajoutez vos centres d\'intérêt';
            }
            if (empty($profile->bio) || strlen($profile->bio) < 50) {
                $suggestions[] = 'Écrivez une description plus détaillée';
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'completion_percentage' => $completionPercentage,
                    'photos_count' => $photosCount,
                    'max_photos' => 6,
                    'missing_fields' => $missingFields,
                    'suggestions' => $suggestions,
                    'is_completed' => $profile->profile_completed_at !== null,
                    'is_active' => $profile->is_active,
                    'last_active' => $profile->last_active,
                    'is_online' => $profile->is_online
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur statistiques profil CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }

    /**
     * Obtenir les profils recommandés pour le matching
     */
    public function getRecommendedProfiles(Request $request)
    {
        try {
            $user = Auth::user();
            $myProfile = CampusLoveProfile::where('user_id', $user->id)->first();

            if (!$myProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez d\'abord créer votre profil CampusLove'
                ], 400);
            }

            // Mettre à jour la dernière activité
            $myProfile->updateLastActive();

            $limit = $request->input('limit', 10);
            $excludeIds = $request->input('exclude_ids', []);

            // Construire la query de base
            $query = CampusLoveProfile::with('user')
                ->active()
                ->where('user_id', '!=', $user->id)
                ->whereNotIn('user_id', $excludeIds);

            // Filtrer par préférences de genre
            if ($myProfile->looking_for && $myProfile->looking_for !== 'both') {
                $query->byGender($myProfile->looking_for);
            }

            // Filtrer par qui me recherche
            if ($myProfile->gender) {
                $query->where(function($q) use ($myProfile) {
                    $q->lookingFor($myProfile->gender);
                });
            }

            // Filtrer par âge si défini
            if ($myProfile->min_age && $myProfile->max_age) {
                $query->inAgeRange($myProfile->min_age, $myProfile->max_age);
            }

            // Filtrer par région/ville
            if ($myProfile->region) {
                $query->where(function($q) use ($myProfile) {
                    $q->inRegion($myProfile->region)
                      ->orWhere('region', null); // Inclure ceux sans région définie
                });
            }

            // Prioriser les profils complétés
            $query->orderByRaw('profile_completed_at IS NOT NULL DESC')
                  ->orderByRaw('profile_completion_percentage DESC')
                  ->orderBy('last_active', 'desc')
                  ->orderBy('created_at', 'desc');

            $profiles = $query->limit($limit)->get();

            // Ajouter des informations calculées
            $profiles->each(function ($profile) use ($myProfile) {
                // Calculer la distance si les coordonnées sont disponibles
                if ($profile->latitude && $profile->longitude && 
                    $myProfile->latitude && $myProfile->longitude) {
                    $profile->distance = $this->calculateDistance(
                        $myProfile->latitude, $myProfile->longitude,
                        $profile->latitude, $profile->longitude
                    );
                } else {
                    $profile->distance = null;
                }

                // Calculer le score de compatibilité
                $profile->compatibility_score = $this->calculateCompatibilityScore($myProfile, $profile);
            });

            return response()->json([
                'success' => true,
                'data' => $profiles,
                'meta' => [
                    'count' => $profiles->count(),
                    'my_profile_completion' => $myProfile->profile_completion_percentage,
                    'filters_applied' => [
                        'gender' => $myProfile->looking_for,
                        'age_range' => [$myProfile->min_age, $myProfile->max_age],
                        'region' => $myProfile->region
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur profils recommandés CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des profils recommandés'
            ], 500);
        }
    }

    /**
     * Calculer la distance entre deux points géographiques
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Rayon de la Terre en km

        $lat1Rad = deg2rad($lat1);
        $lon1Rad = deg2rad($lon1);
        $lat2Rad = deg2rad($lat2);
        $lon2Rad = deg2rad($lon2);

        $deltaLat = $lat2Rad - $lat1Rad;
        $deltaLon = $lon2Rad - $lon1Rad;

        $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
             cos($lat1Rad) * cos($lat2Rad) *
             sin($deltaLon / 2) * sin($deltaLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return round($distance, 1);
    }

    /**
     * Calculer le score de compatibilité entre deux profils
     */
    private function calculateCompatibilityScore($profile1, $profile2)
    {
        $score = 0;
        $maxScore = 0;

        // Même université (+30 points)
        $maxScore += 30;
        if ($profile1->university && $profile2->university && 
            strtolower($profile1->university) === strtolower($profile2->university)) {
            $score += 30;
        }

        // Même domaine d'études (+20 points)
        $maxScore += 20;
        if ($profile1->field_of_study && $profile2->field_of_study && 
            strtolower($profile1->field_of_study) === strtolower($profile2->field_of_study)) {
            $score += 20;
        }

        // Intérêts communs (+5 points par intérêt commun, max 25)
        $maxScore += 25;
        if ($profile1->interests && $profile2->interests) {
            $commonInterests = array_intersect(
                array_map('strtolower', $profile1->interests),
                array_map('strtolower', $profile2->interests)
            );
            $score += min(count($commonInterests) * 5, 25);
        }

        // Même région (+15 points)
        $maxScore += 15;
        if ($profile1->region && $profile2->region && 
            strtolower($profile1->region) === strtolower($profile2->region)) {
            $score += 15;
        }

        // Langues communes (+10 points)
        $maxScore += 10;
        if ($profile1->languages && $profile2->languages) {
            $commonLanguages = array_intersect(
                array_map('strtolower', $profile1->languages),
                array_map('strtolower', $profile2->languages)
            );
            if (count($commonLanguages) > 0) {
                $score += 10;
            }
        }

        return $maxScore > 0 ? round(($score / $maxScore) * 100) : 0;
    }

    /**
     * Upload multiple photos à la fois
     */
    public function uploadMultiplePhotos(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'photos' => 'required|array|max:6',
                'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240',
                'descriptions' => 'sometimes|array',
                'descriptions.*' => 'string|max:200',
                'locations' => 'sometimes|array',
                'locations.*' => 'string|max:100',
                'tags' => 'sometimes|array',
                'tags.*' => 'array|max:5'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $profile = CampusLoveProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'display_name' => $user->name,
                    'is_active' => true,
                ]
            );

            $uploadedPhotos = [];
            $photos = $request->file('photos');
            $descriptions = $request->input('descriptions', []);
            $locations = $request->input('locations', []);
            $tags = $request->input('tags', []);

            foreach ($photos as $index => $photo) {
                // Créer le dossier utilisateur s'il n'existe pas
                $userDir = 'public/campus_love/' . $user->id;
                if (!Storage::exists($userDir)) {
                    Storage::makeDirectory($userDir, 0755, true);
                }
                
                // S'assurer que le dossier physique existe aussi
                $physicalDir = storage_path('app/public/campus_love/' . $user->id);
                if (!is_dir($physicalDir)) {
                    mkdir($physicalDir, 0755, true);
                }
                
                $filename = time() . '_' . uniqid() . '_' . $index . '.jpg';
                $photoPath = 'campus_love/' . $user->id . '/' . $filename;
                $fullPath = storage_path('app/public/' . $photoPath);
                
                // Redimensionner et optimiser l'image
                $manager = new ImageManager(new Driver());
                $image = $manager->read($photo->getPathname());
                $image->scaleDown(width: 1080);
                $image->toJpeg(85)->save($fullPath);
                
                // Créer une version thumbnail
                $thumbnailPath = 'campus_love/' . $user->id . '/thumb_' . $filename;
                $thumbnailFullPath = storage_path('app/public/' . $thumbnailPath);
                $thumbnail = $manager->read($photo->getPathname());
                $thumbnail->scaleDown(width: 500);
                $thumbnail->toJpeg(80)->save($thumbnailFullPath);

                // Ajouter la photo au profil
                $profile->addPhoto($photoPath);
                
                $photoIndex = count($profile->photos) - 1;
                
                $uploadedPhotos[] = [
                    'photo_url' => Storage::url($photoPath),
                    'thumbnail_url' => Storage::url($thumbnailPath),
                    'photo_path' => $photoPath,
                    'photo_index' => $photoIndex,
                    'description' => $descriptions[$index] ?? null,
                    'location' => $locations[$index] ?? null,
                    'tags' => $tags[$index] ?? []
                ];
            }

            // Gérer les métadonnées globalement
            $photoDescriptions = $profile->photo_descriptions ?? [];
            $photoLocations = $profile->photo_locations ?? [];
            $photoTags = $profile->photo_tags ?? [];
            
            foreach ($uploadedPhotos as $uploaded) {
                if (!empty($uploaded['description'])) {
                    $photoDescriptions[$uploaded['photo_index']] = $uploaded['description'];
                }
                if (!empty($uploaded['location'])) {
                    $photoLocations[$uploaded['photo_index']] = $uploaded['location'];
                }
                if (!empty($uploaded['tags'])) {
                    $photoTags[$uploaded['photo_index']] = $uploaded['tags'];
                }
            }
            
            // Mettre à jour les métadonnées
            $profile->update([
                'photo_descriptions' => $photoDescriptions,
                'photo_locations' => $photoLocations,
                'photo_tags' => $photoTags,
                'last_photo_update' => now()
            ]);

            // Si pas de photo de profil, prendre la première
            if (!$profile->profile_photo && !empty($uploadedPhotos)) {
                $profile->setProfilePhoto($uploadedPhotos[0]['photo_path']);
            }

            // Recalculer le pourcentage de completion
            $profile->calculateCompletionPercentage();

            return response()->json([
                'success' => true,
                'message' => count($uploadedPhotos) . ' photos uploadées avec succès',
                'data' => [
                    'uploaded_photos' => $uploadedPhotos,
                    'profile' => $profile->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur upload multiple photos CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload des photos'
            ], 500);
        }
    }

    /**
     * Mettre à jour les métadonnées d'une photo
     */
    public function updatePhotoMetadata(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'photo_index' => 'required|integer|min:0',
                'description' => 'sometimes|string|max:200',
                'location' => 'sometimes|string|max:100',
                'tags' => 'sometimes|array|max:5',
                'tags.*' => 'string|max:30'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $profile = CampusLoveProfile::where('user_id', $user->id)->first();

            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil non trouvé'
                ], 404);
            }

            $photoIndex = $request->photo_index;
            $photos = $profile->photos ?? [];
            
            if ($photoIndex >= count($photos)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Index de photo invalide'
                ], 404);
            }

            // Mettre à jour les métadonnées
            $photoDescriptions = $profile->photo_descriptions ?? [];
            $photoLocations = $profile->photo_locations ?? [];
            $photoTags = $profile->photo_tags ?? [];
            
            if ($request->has('description')) {
                $photoDescriptions[$photoIndex] = $request->description;
            }
            
            if ($request->has('location')) {
                $photoLocations[$photoIndex] = $request->location;
            }
            
            if ($request->has('tags')) {
                $photoTags[$photoIndex] = $request->tags;
            }
            
            $profile->update([
                'photo_descriptions' => $photoDescriptions,
                'photo_locations' => $photoLocations,
                'photo_tags' => $photoTags,
                'last_photo_update' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Métadonnées de la photo mises à jour avec succès',
                'data' => [
                    'photo_index' => $photoIndex,
                    'photo_url' => Storage::url($photos[$photoIndex]),
                    'metadata' => [
                        'description' => $photoDescriptions[$photoIndex] ?? null,
                        'location' => $photoLocations[$photoIndex] ?? null,
                        'tags' => $photoTags[$photoIndex] ?? []
                    ],
                    'profile' => $profile->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour métadonnées photo CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des métadonnées'
            ], 500);
        }
    }
}