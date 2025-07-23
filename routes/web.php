<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
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
        // Fresh migration with seeders
        Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
        
        $output = Artisan::output();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Migration completed successfully',
            'output' => $output
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
