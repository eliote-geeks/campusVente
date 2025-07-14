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
        $users = User::all();
        $categories = Category::all();

        if ($users->isEmpty() || $categories->isEmpty()) {
            $this->command->error('Vous devez d\'abord créer des utilisateurs et des catégories');
            return;
        }

        $announcements = [
            [
                'title' => 'MacBook Pro M2 13" - Excellent état',
                'description' => 'MacBook Pro 13 pouces avec puce M2, 8GB RAM, 256GB SSD. Acheté il y a 6 mois, encore sous garantie Apple. Parfait pour les étudiants en informatique. Livré avec chargeur original.',
                'price' => 1850000,
                'type' => 'sell',
                'location' => 'Yaoundé, Bastos',
                'phone' => '+237 690 123 456',
                'is_urgent' => false,
                'is_promotional' => false,
                'status' => 'active',
                'views' => 156,
                'likes' => 23,
                'images' => [
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=400&fit=crop'
                ],
                'media' => [
                    ['type' => 'image', 'url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop'],
                    ['type' => 'image', 'url' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=400&fit=crop']
                ]
            ],
            [
                'title' => 'Cours particuliers Mathématiques/Physique',
                'description' => 'Professeur expérimenté donne cours particuliers en maths et physique. Niveau lycée et première année universitaire. Méthodes pédagogiques adaptées. Première séance gratuite.',
                'price' => 15000,
                'type' => 'service',
                'location' => 'Douala, Akwa',
                'phone' => '+237 655 789 012',
                'is_urgent' => false,
                'is_promotional' => true,
                'promotional_fee' => 500,
                'promoted_at' => now(),
                'status' => 'active',
                'views' => 89,
                'likes' => 12
            ],
            [
                'title' => 'Chambre meublée proche campus',
                'description' => 'Belle chambre meublée dans maison sécurisée, proche université de Yaoundé I. Internet fibre, cuisine équipée, jardin. Ambiance étudiante conviviale.',
                'price' => 85000,
                'type' => 'sell',
                'location' => 'Yaoundé, Ngoa-Ekellé',
                'phone' => '+237 677 345 678',
                'is_urgent' => true,
                'is_promotional' => false,
                'status' => 'active',
                'views' => 234,
                'likes' => 45
            ],
            [
                'title' => 'iPhone 14 Pro 128GB - Comme neuf',
                'description' => 'iPhone 14 Pro 128GB couleur violet, acheté en France. État impeccable, aucune rayure. Livré avec boîte, câble lightning et protection écran déjà posée.',
                'price' => 750000,
                'type' => 'sell',
                'location' => 'Douala, Bonanjo',
                'phone' => '+237 698 876 543',
                'is_urgent' => false,
                'is_promotional' => false,
                'status' => 'active',
                'views' => 178,
                'likes' => 34
            ],
            [
                'title' => 'Service rédaction mémoires/thèses',
                'description' => 'Aide à la rédaction de mémoires, thèses et projets académiques. Correction, mise en page, recherche bibliographique. Doctorant en Sciences Économiques.',
                'price' => 50000,
                'type' => 'service',
                'location' => 'Yaoundé, Centre-ville',
                'phone' => '+237 612 456 789',
                'is_urgent' => false,
                'is_promotional' => true,
                'promotional_fee' => 500,
                'promoted_at' => now(),
                'status' => 'active',
                'views' => 67,
                'likes' => 8
            ],
            [
                'title' => 'Vélo de ville état neuf',
                'description' => 'Vélo de ville 26 pouces, parfait pour se déplacer sur le campus. Très peu utilisé, équipé de phares LED et antivol. Idéal étudiant.',
                'price' => 125000,
                'type' => 'sell',
                'location' => 'Douala, Deido',
                'phone' => '+237 656 234 567',
                'is_urgent' => false,
                'is_promotional' => false,
                'status' => 'active',
                'views' => 92,
                'likes' => 16
            ],
            [
                'title' => 'Studio meublé centre Douala',
                'description' => 'Joli studio meublé au centre de Douala, proche des universités. Climatisé, sécurisé, internet inclus. Disponible immédiatement.',
                'price' => 120000,
                'type' => 'sell',
                'location' => 'Douala, Akwa',
                'phone' => '+237 690 345 678',
                'is_urgent' => true,
                'is_promotional' => false,
                'status' => 'active',
                'views' => 145,
                'likes' => 28
            ],
            [
                'title' => 'Livres de médecine 1ère année',
                'description' => 'Collection complète de livres de médecine 1ère année : Anatomie, Physiologie, Biochimie. Excellent état, annotations utiles incluses.',
                'price' => 75000,
                'type' => 'sell',
                'location' => 'Yaoundé, Mvan',
                'phone' => '+237 677 123 890',
                'is_urgent' => false,
                'is_promotional' => false,
                'status' => 'active',
                'views' => 134,
                'likes' => 22
            ],
            [
                'title' => 'Cours soutien informatique',
                'description' => 'Étudiant en Master Informatique propose cours de soutien : programmation Python, Java, bases de données, développement web. Tarifs étudiants.',
                'price' => 20000,
                'type' => 'service',
                'location' => 'Yaoundé, Essos',
                'phone' => '+237 655 567 234',
                'is_urgent' => false,
                'is_promotional' => true,
                'promotional_fee' => 500,
                'promoted_at' => now(),
                'status' => 'active',
                'views' => 98,
                'likes' => 19
            ],
            [
                'title' => 'Tablette Samsung Galaxy Tab S8',
                'description' => 'Tablette Samsung Galaxy Tab S8 11 pouces, 128GB. Parfaite pour prendre des notes en cours. Livrée avec clavier et stylet S-Pen.',
                'price' => 425000,
                'type' => 'sell',
                'location' => 'Douala, Bonapriso',
                'phone' => '+237 698 432 167',
                'is_urgent' => false,
                'is_promotional' => false,
                'status' => 'active',
                'views' => 76,
                'likes' => 13
            ],
            [
                'title' => 'Colocation 3 chambres Yaoundé',
                'description' => 'Maison 3 chambres à partager entre étudiants. Cuisine équipée, salon, jardin, parking. Ambiance studieuse et conviviale garantie.',
                'price' => 65000,
                'type' => 'sell',
                'location' => 'Yaoundé, Emana',
                'phone' => '+237 612 789 345',
                'is_urgent' => false,
                'is_promotional' => false,
                'status' => 'active',
                'views' => 187,
                'likes' => 31
            ],
            [
                'title' => 'Service traduction FR/EN/ES',
                'description' => 'Traducteur professionnel propose services de traduction français-anglais-espagnol. Spécialisé dans les documents académiques et techniques.',
                'price' => 2500,
                'type' => 'service',
                'location' => 'Douala, Centre',
                'phone' => '+237 677 654 321',
                'is_urgent' => false,
                'is_promotional' => false,
                'status' => 'active',
                'views' => 54,
                'likes' => 7
            ]
        ];

        foreach ($announcements as $announcementData) {
            // Assigner un utilisateur aléatoire
            $user = $users->random();
            
            // Assigner une catégorie aléatoire
            $category = $categories->random();
            
            Announcement::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'title' => $announcementData['title'],
                'description' => $announcementData['description'],
                'price' => $announcementData['price'],
                'type' => $announcementData['type'],
                'location' => $announcementData['location'],
                'phone' => $announcementData['phone'],
                'is_urgent' => $announcementData['is_urgent'],
                'is_promotional' => $announcementData['is_promotional'],
                'promotional_fee' => $announcementData['promotional_fee'] ?? null,
                'promoted_at' => $announcementData['promoted_at'] ?? null,
                'status' => $announcementData['status'],
                'views' => $announcementData['views'],
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(0, 5))
            ]);
        }

        $this->command->info('12 annonces créées avec succès!');
    }
}