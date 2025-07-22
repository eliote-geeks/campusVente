<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class CampusLoveUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $universities = [
            'Université de Yaoundé I',
            'Université de Yaoundé II',
            'Université de Douala',
            'Université de Buea',
            'Université de Bamenda',
            'Université de Ngaoundéré',
            'Université de Maroua',
            'Université de Dschang',
            'ENSP Yaoundé',
            'Polytechnique Yaoundé'
        ];

        $fields = [
            'Informatique', 'Médecine', 'Droit', 'Marketing', 'Ingénierie', 
            'Architecture', 'Psychologie', 'Économie', 'Biologie', 'Littérature',
            'Sciences Politiques', 'Communication', 'Mathématiques', 'Physique'
        ];

        $levels = ['licence1', 'licence2', 'licence3', 'master1', 'master2'];

        $interests = [
            'Musique', 'Sport', 'Voyage', 'Cuisine', 'Lecture', 'Cinéma', 
            'Art', 'Technologie', 'Danse', 'Photo', 'Nature', 'Gaming',
            'Fitness', 'Mode', 'Entrepreneuriat', 'Langues', 'Histoire',
            'Sciences', 'Théâtre', 'Bénévolat'
        ];

        $bios = [
            "Passionné(e) de tech et de musique 🎵 Toujours partant(e) pour de nouvelles aventures !",
            "Créatif(ve) et ambitieux(se) ✨ J'adore les nouvelles expériences et rencontrer des gens.",
            "Future médecin 👩‍⚕️ Yoga et lecture sont mes passions. Cherche quelqu'un avec qui partager.",
            "Designer dans l'âme 🎨 Créons ensemble quelque chose de beau !",
            "Juriste passionné(e) ⚖️ Danseur(se) à mes heures perdues. La vie est belle !",
            "Entrepreneur en herbe 💼 Sport et voyages me passionnent. Et toi ?",
            "Artiste et rêveur(se) 🌟 La beauté est partout, il suffit de savoir regarder.",
            "Scientifique curieux(se) 🔬 Toujours en quête de nouvelles découvertes.",
            "Amoureux(se) de la nature 🌿 Randonnée et photographie sont mes échappatoires.",
            "Mélomane invétéré(e) 🎶 La musique adoucit les mœurs et rapproche les cœurs."
        ];

        $femaleNames = [
            'Marie Dubois', 'Sophie Martin', 'Julie Kamga', 'Emma Tchoupo', 'Laure Mvondo',
            'Claire Nguyen', 'Sarah Fotso', 'Jessica Biya', 'Vanessa Nkomo', 'Rachelle Mbida',
            'Audrey Tagne', 'Priscilla Fouda', 'Grace Njoya', 'Divine Ateba', 'Carole Essomba',
            'Sandrine Mbelek', 'Patricia Owono', 'Denise Tchinda', 'Brigitte Zambo', 'Nathalie Muna'
        ];

        $maleNames = [
            'Paul Ngono', 'Jean Talla', 'Michel Etoa', 'André Bilé', 'Roger Mbang',
            'Claude Nanga', 'Patrick Fonkou', 'Olivier Mbouda', 'Serge Assamba', 'Hervé Ndong',
            'Francis Ottou', 'Marcel Ebong', 'Armand Njikam', 'Alain Kana', 'Christian Bello',
            'Emmanuel Feudjio', 'Rodrigue Messi', 'Fabrice Onana', 'Gaston Ewodo', 'Norbert Zoa'
        ];

        $photos = [
            // Photos femmes
            [
                "https://images.unsplash.com/photo-1494790108755-2616c0763e78?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face"
            ],
            [
                "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1488572482-de8d27e0d81c?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=600&fit=crop&crop=face"
            ],
            [
                "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=600&fit=crop&crop=face"
            ],
            [
                "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=600&fit=crop&crop=face"
            ],
        ];

        $malePhotos = [
            [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=600&fit=crop&crop=face"
            ],
            [
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face"
            ]
        ];

        // Créer 30 profils féminins
        for ($i = 0; $i < 30; $i++) {
            $birthDate = Carbon::now()->subYears(rand(18, 28))->subDays(rand(1, 365));
            $userInterests = collect($interests)->random(rand(3, 6))->toArray();
            $userPhotos = $photos[array_rand($photos)];
            
            User::create([
                'name' => $femaleNames[array_rand($femaleNames)],
                'email' => 'female_' . ($i + 1) . '@campuslove.test',
                'password' => Hash::make('password123'),
                'phone' => '+237' . rand(600000000, 699999999),
                'whatsapp_number' => '+237' . rand(600000000, 699999999),
                'birth_date' => $birthDate,
                'gender' => 'female',
                'looking_for' => rand(0, 1) ? 'male' : 'both',
                'university' => $universities[array_rand($universities)],
                'study_level' => $levels[array_rand($levels)],
                'field' => $fields[array_rand($fields)],
                'bio' => 'Étudiante passionnée à ' . $universities[array_rand($universities)],
                'bio_dating' => $bios[array_rand($bios)],
                'location' => 'Cameroun',
                'is_student' => true,
                'verified' => true,
                'dating_active' => true,
                'max_distance' => rand(20, 100),
                'interests' => $userInterests,
                'dating_photos' => $userPhotos,
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);
        }

        // Créer 20 profils masculins
        for ($i = 0; $i < 20; $i++) {
            $birthDate = Carbon::now()->subYears(rand(18, 28))->subDays(rand(1, 365));
            $userInterests = collect($interests)->random(rand(3, 6))->toArray();
            $userPhotos = $malePhotos[array_rand($malePhotos)];
            
            User::create([
                'name' => $maleNames[array_rand($maleNames)],
                'email' => 'male_' . ($i + 1) . '@campuslove.test',
                'password' => Hash::make('password123'),
                'phone' => '+237' . rand(600000000, 699999999),
                'whatsapp_number' => '+237' . rand(600000000, 699999999),
                'birth_date' => $birthDate,
                'gender' => 'male',
                'looking_for' => rand(0, 1) ? 'female' : 'both',
                'university' => $universities[array_rand($universities)],
                'study_level' => $levels[array_rand($levels)],
                'field' => $fields[array_rand($fields)],
                'bio' => 'Étudiant passionné à ' . $universities[array_rand($universities)],
                'bio_dating' => $bios[array_rand($bios)],
                'location' => 'Cameroun',
                'is_student' => true,
                'verified' => true,
                'dating_active' => true,
                'max_distance' => rand(20, 100),
                'interests' => $userInterests,
                'dating_photos' => $userPhotos,
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);
        }

        $this->command->info('50 profils CampusLove créés avec succès !');
    }
}