<?php

use Illuminate\Support\Facades\Route;
use App\Models\Payment;

// Route de retour de paiement Monetbil
Route::get('/payment/return/{payment}', function (Payment $payment) {
    return view('payment-return', compact('payment'));
})->name('payment.return');

// Route pour servir l'application React
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');
