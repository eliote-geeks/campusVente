<?php

use Illuminate\Support\Facades\Route;

// Route pour servir l'application React
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');
