<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CampusLoveAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        if (!$user->campus_love_access) {
            return response()->json([
                'success' => false,
                'message' => 'Accès à CampusLove requis. Veuillez effectuer le paiement pour accéder à cette fonctionnalité.',
                'access_required' => true,
                'access_fee' => 1000,
                'currency' => 'FCFA'
            ], 403);
        }

        return $next($request);
    }
}
