<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Assurer qu'il y a au moins un utilisateur
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
                'university' => 'Université de Yaoundé I',
                'is_student' => true,
                'email_verified_at' => now()
            ]);
        }

        // Assurer qu'il y a au moins une catégorie
        $categories = Category::all();
        if ($categories->isEmpty()) {
            $categories = collect([
                Category::create(['name' => 'Électronique', 'description' => 'Appareils électroniques', 'active' => true]),
                Category::create(['name' => 'Vêtements', 'description' => 'Vêtements et accessoires', 'active' => true]),
                Category::create(['name' => 'Livres', 'description' => 'Livres et matériel scolaire', 'active' => true]),
            ]);
        }

        $announcements = [
            [
                'title' => 'iPhone 13 Pro Max 256GB',
                'description' => 'iPhone 13 Pro Max 256GB en excellent état. Couleur bleu sierra. Aucune rayure, toujours sous protection. Vendu avec chargeur original, écouteurs et boîte.',
                'price' => 850000,
                'type' => 'sell',
                'status' => 'active',
                'location' => 'Yaoundé',
                'user_id' => $user->id,
                'category_id' => $categories->first()->id,
                'is_urgent' => true,
                'views' => 45
            ],
            [
                'title' => 'MacBook Pro 2021 M1',
                'description' => 'MacBook Pro 2021 avec processeur M1. 8GB RAM, 256GB SSD. Parfait pour les étudiants en informatique. Très bon état.',
                'price' => 1200000,
                'type' => 'sell',
                'status' => 'active',
                'location' => 'Douala',
                'user_id' => $user->id,
                'category_id' => $categories->first()->id,
                'is_urgent' => false,
                'views' => 78
            ],
            [
                'title' => 'Cours particuliers de Mathématiques',
                'description' => 'Professeur expérimenté donne cours particuliers de mathématiques pour tous niveaux. Préparation aux examens, aide aux devoirs.',
                'price' => 15000,
                'type' => 'service',
                'status' => 'active',
                'location' => 'Yaoundé',
                'user_id' => $user->id,
                'category_id' => $categories->skip(2)->first()->id,
                'is_urgent' => false,
                'views' => 23
            ],
            [
                'title' => 'Vélo de ville en bon état',
                'description' => 'Vélo de ville parfait pour les déplacements sur le campus. Freins récemment changés, pneus en bon état.',
                'price' => 85000,
                'type' => 'sell',
                'status' => 'active',
                'location' => 'Yaoundé',
                'user_id' => $user->id,
                'category_id' => $categories->first()->id,
                'is_urgent' => false,
                'views' => 12
            ],
            [
                'title' => 'Recherche colocation',
                'description' => 'Étudiant sérieux recherche colocation près du campus. Budget max 100000 FCFA/mois. Non-fumeur.',
                'price' => 100000,
                'type' => 'buy',
                'status' => 'active',
                'location' => 'Yaoundé',
                'user_id' => $user->id,
                'category_id' => $categories->first()->id,
                'is_urgent' => true,
                'views' => 67
            ],
            [
                'title' => 'Livres de médecine 2ème année',
                'description' => 'Ensemble de livres de médecine pour la 2ème année. Anatomie, physiologie, histologie. Bon état.',
                'price' => 45000,
                'type' => 'sell',
                'status' => 'pending',
                'location' => 'Douala',
                'user_id' => $user->id,
                'category_id' => $categories->skip(2)->first()->id,
                'is_urgent' => false,
                'views' => 34
            ]
        ];

        foreach ($announcements as $announcement) {
            Announcement::create($announcement);
        }
    }
}