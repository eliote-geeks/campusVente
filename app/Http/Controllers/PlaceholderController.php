<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class PlaceholderController extends Controller
{
    public function generate(Request $request, $width = 400, $height = 300)
    {
        $width = min(max((int)$width, 50), 2000);
        $height = min(max((int)$height, 50), 2000);
        
        $text = $request->get('text', 'Photo');
        $bgColor = $request->get('bg', 'ff6b6b');
        $textColor = $request->get('color', 'ffffff');
        
        // Créer l'image
        $manager = new ImageManager(new Driver());
        $image = $manager->create($width, $height)->fill('#' . $bgColor);
        
        // Ajouter le texte (simplifié pour éviter les erreurs de font)
        // Note: Le texte est optionnel pour le moment
        
        // Retourner l'image
        return response($image->toPng())
            ->header('Content-Type', 'image/png')
            ->header('Cache-Control', 'public, max-age=3600');
    }
}