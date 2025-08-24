<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;
use App\Http\Controllers\PlaceholderController;

// Route de retour de paiement Monetbil
Route::get('/payment/return/{payment}', function (Payment $payment) {
    return view('payment-return', compact('payment'));
})->name('payment.return');

// Route pour les images placeholder
Route::get('/api/placeholder/{width}/{height}', [PlaceholderController::class, 'generate']);

// TEMPORARY: Extract build assets (REMOVE AFTER USE)
Route::get('/extract-build-assets', function () {
    // Security check - only allow with specific key
    $key = request()->get('key');
    if ($key !== 'campus2025migrate') {
        abort(403, 'Non autorisé');
    }
    
    try {
        $archivePath = public_path('build.tar.gz');
        
        if (!file_exists($archivePath)) {
            throw new Exception('Archive build.tar.gz not found in public directory');
        }
        
        // Change to public directory
        $publicPath = public_path();
        chdir($publicPath);
        
        // Extract the archive
        $command = "tar -xzf build.tar.gz";
        $output = [];
        $returnVar = 0;
        
        exec($command, $output, $returnVar);
        
        if ($returnVar !== 0) {
            throw new Exception('Failed to extract archive: ' . implode("\n", $output));
        }
        
        // Verify extraction
        if (!file_exists(public_path('build/manifest.json'))) {
            throw new Exception('Extraction failed: manifest.json not found');
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Build assets extracted successfully',
            'files' => [
                'manifest' => file_exists(public_path('build/manifest.json')),
                'assets_dir' => is_dir(public_path('build/assets'))
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Extraction failed: ' . $e->getMessage()
        ], 500);
    }
});

// TEMPORARY: Create admin user (REMOVE AFTER USE)
Route::get('/create-admin-user', function () {
    // Security check - only allow with specific key
    $key = request()->get('key');
    if ($key !== 'campus2025migrate') {
        abort(403, 'Non autorisé');
    }
    
    try {
        // Execute the admin user SQL
        $sqlPath = database_path('admin_user.sql');
        
        if (!file_exists($sqlPath)) {
            throw new Exception('Admin user SQL file not found');
        }
        
        $sql = file_get_contents($sqlPath);
        DB::unprepared($sql);
        
        // Verify admin user was created
        $admin = DB::table('users')->where('is_admin', 1)->first();
        
        if (!$admin) {
            throw new Exception('Admin user creation failed');
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Admin user created successfully',
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Admin creation failed: ' . $e->getMessage()
        ], 500);
    }
});

// TEMPORARY: Import database schema (REMOVE AFTER USE)
Route::get('/import-database-schema', function () {
    // Security check - only allow with specific key
    $key = request()->get('key');
    if ($key !== 'campus2025migrate') {
        abort(403, 'Non autorisé');
    }
    
    try {
        // Read the schema file
        $schemaPath = database_path('schema/mysql-schema.sql');
        
        if (!file_exists($schemaPath)) {
            throw new Exception('Schema file not found');
        }
        
        $sql = file_get_contents($schemaPath);
        
        // Split SQL into individual statements
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        // Execute each statement
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                DB::unprepared($statement);
            }
        }
        
        // Run seeders manually
        $seeder = new \Database\Seeders\DatabaseSeeder();
        $seeder->run();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Database schema imported and seeded successfully'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Import failed: ' . $e->getMessage()
        ], 500);
    }
});

// TEMPORARY: Clear Laravel cache (REMOVE AFTER USE)
Route::get('/clear-cache', function () {
    // Security check - only allow with specific key
    $key = request()->get('key');
    if ($key !== 'campus2025migrate') {
        abort(403, 'Non autorisé');
    }
    
    try {
        // Clear all caches
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');
        Artisan::call('cache:clear');
        
        return response()->json([
            'status' => 'success',
            'message' => 'Cache cleared and rebuilt successfully',
            'commands_executed' => [
                'config:cache',
                'route:cache', 
                'view:cache',
                'cache:clear'
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Cache clear failed: ' . $e->getMessage()
        ], 500);
    }
});

// Route pour nettoyer automatiquement les annonces expirées (sans terminal)
Route::get('/cleanup-expired-announcements', function () {
    try {
        $deletedCount = \App\Models\Announcement::where('expires_at', '<=', now())->delete();
        
        return response()->json([
            'success' => true,
            'message' => "Nettoyage terminé : {$deletedCount} annonces expirées supprimées.",
            'deleted_count' => $deletedCount
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du nettoyage : ' . $e->getMessage()
        ], 500);
    }
});

// Route pour exécuter la migration des images base64 (sans terminal)
Route::get('/migrate-images-base64', function () {
    // Security check - only allow with specific key
    $key = request()->get('key');
    if ($key !== 'campus2025migrate') {
        abort(403, 'Non autorisé');
    }
    
    try {
        \Artisan::call('migrate', ['--path' => 'database/migrations/2025_08_23_063409_add_base64_images_to_announcements_table.php']);
        
        return response()->json([
            'success' => true,
            'message' => 'Migration exécutée avec succès',
            'output' => \Artisan::output()
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la migration : ' . $e->getMessage()
        ], 500);
    }
});

// Route pour ajouter manuellement les colonnes manquantes (sans artisan)
Route::get('/add-images-columns', function () {
    try {
        // Vérifier si les colonnes existent déjà
        $hasImagesBase64 = \Schema::hasColumn('announcements', 'images_base64');
        $hasExpiresAt = \Schema::hasColumn('announcements', 'expires_at');
        
        $messages = [];
        
        if (!$hasImagesBase64) {
            \DB::statement('ALTER TABLE announcements ADD COLUMN images_base64 JSON NULL AFTER images');
            $messages[] = 'Colonne images_base64 ajoutée';
        } else {
            $messages[] = 'Colonne images_base64 existe déjà';
        }
        
        if (!$hasExpiresAt) {
            \DB::statement('ALTER TABLE announcements ADD COLUMN expires_at TIMESTAMP NULL AFTER created_at');
            \DB::statement('ALTER TABLE announcements ADD INDEX idx_expires_at (expires_at)');
            $messages[] = 'Colonne expires_at ajoutée avec index';
        } else {
            $messages[] = 'Colonne expires_at existe déjà';
        }
        
        // Mettre à jour les annonces existantes avec une date d'expiration
        $updated = \DB::table('announcements')
            ->whereNull('expires_at')
            ->update(['expires_at' => \DB::raw('DATE_ADD(created_at, INTERVAL 7 DAY)')]);
        
        if ($updated > 0) {
            $messages[] = "{$updated} annonces mises à jour avec date d'expiration";
        }
        
        return response()->json([
            'success' => true,
            'messages' => $messages
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur : ' . $e->getMessage()
        ], 500);
    }
});

// Route pour ajouter les colonnes base64 au modèle User
Route::get('/add-user-base64-columns', function () {
    try {
        $messages = [];
        
        // Vérifier et ajouter avatar_base64
        if (!\Schema::hasColumn('users', 'avatar_base64')) {
            \DB::statement('ALTER TABLE users ADD COLUMN avatar_base64 LONGTEXT NULL AFTER avatar');
            $messages[] = 'Colonne avatar_base64 ajoutée';
        } else {
            $messages[] = 'Colonne avatar_base64 existe déjà';
        }
        
        // Vérifier et ajouter dating_photos_base64
        if (!\Schema::hasColumn('users', 'dating_photos_base64')) {
            \DB::statement('ALTER TABLE users ADD COLUMN dating_photos_base64 JSON NULL AFTER dating_photos');
            $messages[] = 'Colonne dating_photos_base64 ajoutée';
        } else {
            $messages[] = 'Colonne dating_photos_base64 existe déjà';
        }
        
        return response()->json([
            'success' => true,
            'messages' => $messages
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur : ' . $e->getMessage()
        ], 500);
    }
});

// Route de diagnostic pour les problèmes d'avatar
Route::get('/debug-avatar-system', function () {
    try {
        $results = [];
        
        // Vérifier les colonnes users
        $results['user_columns'] = [
            'avatar_base64' => \Schema::hasColumn('users', 'avatar_base64'),
            'dating_photos_base64' => \Schema::hasColumn('users', 'dating_photos_base64')
        ];
        
        // Vérifier les colonnes announcements
        $results['announcement_columns'] = [
            'images_base64' => \Schema::hasColumn('announcements', 'images_base64'),
            'expires_at' => \Schema::hasColumn('announcements', 'expires_at')
        ];
        
        // Vérifier les extensions PHP GD
        $results['gd_info'] = function_exists('imagecreatefromstring') ? gd_info() : 'Extension GD non disponible';
        
        // Tester un utilisateur
        $user = \App\Models\User::first();
        if ($user) {
            $results['test_user'] = [
                'id' => $user->id,
                'name' => $user->name,
                'has_avatar' => !empty($user->avatar),
                'has_avatar_base64' => !empty($user->avatar_base64),
                'avatar_field' => $user->avatar,
            ];
        }
        
        return response()->json([
            'success' => true,
            'diagnostic' => $results
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Route pour servir l'application React
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');
