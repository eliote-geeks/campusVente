<?php
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Database\Capsule\Manager as DB;

// Bootstrap Laravel
$app = new Application(realpath(__DIR__));
$app->singleton(
    'Illuminate\Contracts\Http\Kernel',
    'App\Http\Kernel'
);
$app->singleton(
    'Illuminate\Contracts\Console\Kernel',
    'App\Console\Kernel'
);

// Simple database insert
DB::table('announcements')->insert([
    'title' => 'Test Annonce avec images',
    'description' => 'Test description',
    'price' => 1000,
    'type' => 'sell',
    'location' => 'Yaoundé',
    'category_id' => 1,
    'user_id' => 1,
    'images' => json_encode([
        'http://127.0.0.1:8000/storage/announcements/images/1752443755_68742b6b176cf_1.jpg',
        'http://127.0.0.1:8000/storage/announcements/images/1752443755_68742b6bb028a_2.jpg'
    ]),
    'media' => json_encode([
        [
            'type' => 'image',
            'url' => 'http://127.0.0.1:8000/storage/announcements/images/1752443755_68742b6b176cf_1.jpg',
            'filename' => '1752443755_68742b6b176cf_1.jpg'
        ],
        [
            'type' => 'image', 
            'url' => 'http://127.0.0.1:8000/storage/announcements/images/1752443755_68742b6bb028a_2.jpg',
            'filename' => '1752443755_68742b6bb028a_2.jpg'
        ]
    ]),
    'created_at' => now(),
    'updated_at' => now()
]);

echo "Annonce créée avec succès !";