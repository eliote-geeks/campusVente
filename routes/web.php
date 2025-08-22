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

// Route pour servir les images depuis storage sans lien symbolique
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    
    if (!file_exists($filePath)) {
        abort(404);
    }
    
    $mimeType = mime_content_type($filePath);
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
    ]);
})->where('path', '.*');

// Route pour servir l'application React
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');
