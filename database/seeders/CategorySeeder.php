<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Électronique',
                'icon' => '📱',
                'description' => 'Smartphones, ordinateurs, tablettes, accessoires tech',
                'sort_order' => 1
            ],
            [
                'name' => 'Logement',
                'icon' => '🏠',
                'description' => 'Colocations, chambres, appartements, studios',
                'sort_order' => 2
            ],
            [
                'name' => 'Services',
                'icon' => '🛠️',
                'description' => 'Cours particuliers, aide, réparations, services divers',
                'sort_order' => 3
            ],
            [
                'name' => 'Livres',
                'icon' => '📚',
                'description' => 'Manuels scolaires, livres universitaires, romans',
                'sort_order' => 4
            ],
            [
                'name' => 'Événements',
                'icon' => '🎉',
                'description' => 'Soirées, conférences, activités étudiantes',
                'sort_order' => 5
            ],
            [
                'name' => 'Vêtements',
                'icon' => '👕',
                'description' => 'Vêtements, chaussures, accessoires de mode',
                'sort_order' => 6
            ],
            [
                'name' => 'Transport',
                'icon' => '🚗',
                'description' => 'Vélos, scooters, covoiturage, transport en commun',
                'sort_order' => 7
            ],
            [
                'name' => 'Sport & Loisirs',
                'icon' => '⚽',
                'description' => 'Équipements sportifs, instruments de musique, jeux',
                'sort_order' => 8
            ],
            [
                'name' => 'Mobilier',
                'icon' => '🪑',
                'description' => 'Meubles, décoration, électroménager',
                'sort_order' => 9
            ],
            [
                'name' => 'Alimentation',
                'icon' => '🍕',
                'description' => 'Nourriture, boissons, restaurants étudiants',
                'sort_order' => 10
            ],
            [
                'name' => 'Santé & Beauté',
                'icon' => '💄',
                'description' => 'Cosmétiques, soins, produits de santé',
                'sort_order' => 11
            ],
            [
                'name' => 'Emploi',
                'icon' => '💼',
                'description' => 'Jobs étudiants, stages, emplois temporaires',
                'sort_order' => 12
            ],
            [
                'name' => 'Formation',
                'icon' => '🎓',
                'description' => 'Cours, formations, certifications',
                'sort_order' => 13
            ],
            [
                'name' => 'Voyage',
                'icon' => '✈️',
                'description' => 'Voyages étudiants, échanges, billets',
                'sort_order' => 14
            ],
            [
                'name' => 'Autre',
                'icon' => '📦',
                'description' => 'Divers, objets non classés',
                'sort_order' => 15
            ]
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'icon' => $category['icon'],
                'description' => $category['description'],
                'is_active' => true,
                'sort_order' => $category['sort_order']
            ]);
        }
    }
}
