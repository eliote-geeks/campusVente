<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\StudentLike;
use App\Models\StudentMatch;

class CampusLoveLikesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer un utilisateur principal (premier utilisateur réel, pas de test)
        $mainUser = User::where('email', 'not like', '%@campuslove.test')->first();
        
        if (!$mainUser) {
            // Si pas d'utilisateur réel, créer un utilisateur de test principal
            $mainUser = User::create([
                'name' => 'User Principal',
                'email' => 'principal@campuslove.test',
                'password' => bcrypt('password123'),
                'phone' => '+237690000000',
                'whatsapp_number' => '+237690000000',
                'birth_date' => '1995-01-15',
                'gender' => 'male',
                'looking_for' => 'female',
                'university' => 'Université de Yaoundé I',
                'study_level' => 'master1',
                'field' => 'Informatique',
                'bio_dating' => 'Développeur passionné cherche l\'âme sœur',
                'location' => 'Cameroun',
                'is_student' => true,
                'verified' => true,
                'dating_active' => true,
                'max_distance' => 50,
                'interests' => ['Tech', 'Sport', 'Musique'],
                'dating_photos' => [
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face"
                ],
            ]);
        }

        // Récupérer des utilisateurs test pour créer des interactions
        $testUsers = User::where('email', 'like', '%@campuslove.test')
            ->where('id', '!=', $mainUser->id)
            ->limit(20)
            ->get();

        $likesCreated = 0;
        $matchesCreated = 0;

        foreach ($testUsers as $targetUser) {
            // Créer des likes de l'utilisateur principal vers les autres (70% de chance)
            if (rand(1, 100) <= 70) {
                $like = StudentLike::create([
                    'liker_id' => $mainUser->id,
                    'liked_id' => $targetUser->id,
                    'is_super_like' => rand(1, 100) <= 20 // 20% chance de super like
                ]);
                $likesCreated++;

                // Créer parfois un like en retour pour générer des matches (40% de chance)
                if (rand(1, 100) <= 40) {
                    $reciprocalLike = StudentLike::create([
                        'liker_id' => $targetUser->id,
                        'liked_id' => $mainUser->id,
                        'is_super_like' => false
                    ]);

                    // Créer le match
                    $user1Id = min($mainUser->id, $targetUser->id);
                    $user2Id = max($mainUser->id, $targetUser->id);
                    
                    StudentMatch::create([
                        'user1_id' => $user1Id,
                        'user2_id' => $user2Id,
                        'matched_at' => now()->subDays(rand(1, 10)),
                        'conversation_started' => rand(0, 1) === 1,
                        'conversation_started_at' => rand(0, 1) === 1 ? now()->subDays(rand(1, 5)) : null,
                    ]);
                    $matchesCreated++;
                }
            }

            // Créer aussi quelques likes vers l'utilisateur principal (30% de chance)
            if (rand(1, 100) <= 30) {
                StudentLike::firstOrCreate([
                    'liker_id' => $targetUser->id,
                    'liked_id' => $mainUser->id,
                ], [
                    'is_super_like' => rand(1, 100) <= 10 // 10% chance de super like
                ]);
            }
        }

        $this->command->info("Seeder terminé !");
        $this->command->info("- {$likesCreated} likes créés");
        $this->command->info("- {$matchesCreated} matches créés");
        $this->command->info("- Utilisateur principal: {$mainUser->name} (ID: {$mainUser->id})");
    }
}