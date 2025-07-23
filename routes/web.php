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

// Route pour servir l'application React
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');
