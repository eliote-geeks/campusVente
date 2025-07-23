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

// TEMPORARY: Migration endpoint for production (REMOVE AFTER USE)
Route::get('/migrate-fresh-production', function () {
    // Security check - only allow with specific key
    $key = request()->get('key');
    if ($key !== 'campus2025migrate') {
        abort(403, 'Non autorisé');
    }
    
    try {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Get all table names
        $tables = DB::select('SHOW TABLES');
        $dbName = DB::getDatabaseName();
        
        // Drop all tables
        foreach ($tables as $table) {
            $tableName = $table->{"Tables_in_$dbName"};
            DB::statement("DROP TABLE IF EXISTS `$tableName`");
        }
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        // Run migrations manually
        $migrator = app('migrator');
        $migrator->run(database_path('migrations'));
        
        // Run seeders manually
        $seeder = new \Database\Seeders\DatabaseSeeder();
        $seeder->run();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Migration and seeding completed successfully'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Migration failed: ' . $e->getMessage()
        ], 500);
    }
});

// Route pour servir l'application React
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');
