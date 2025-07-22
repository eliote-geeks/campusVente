<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\StudentLike;
use App\Models\StudentMatch;
use App\Models\StudentPass;

class CampusLoveInteractionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer tous les utilisateurs actifs sur CampusLove
        $users = User::where('dating_active', true)
                    ->where('campus_love_access', true)
                    ->get();

        if ($users->count() < 2) {
            $this->command->info('Pas assez d\'utilisateurs actifs pour créer des interactions');
            return;
        }

        $likesCreated = 0;
        $matchesCreated = 0;
        $passesCreated = 0;

        // Créer des interactions aléatoires
        foreach ($users as $user) {
            // Prendre quelques autres utilisateurs pour interagir
            $potentialMatches = $users->where('id', '!=', $user->id)
                                     ->where('gender', '!=', $user->gender) // Genre opposé par défaut
                                     ->shuffle()
                                     ->take(rand(10, 25));

            foreach ($potentialMatches as $target) {
                // Éviter les doublons
                $existingLike = StudentLike::where('liker_id', $user->id)
                                         ->where('liked_id', $target->id)
                                         ->exists();
                
                $existingPass = StudentPass::where('passer_id', $user->id)
                                         ->where('passed_id', $target->id)
                                         ->exists();

                if ($existingLike || $existingPass) {
                    continue;
                }

                $action = rand(1, 100);

                if ($action <= 35) { // 35% de chances de liker
                    $isSuperLike = rand(1, 100) <= 15; // 15% de super likes
                    
                    StudentLike::create([
                        'liker_id' => $user->id,
                        'liked_id' => $target->id,
                        'is_super_like' => $isSuperLike,
                        'created_at' => now()->subDays(rand(0, 30)),
                    ]);
                    
                    $likesCreated++;

                    // Chance de match réciproque (30% des likes)
                    if (rand(1, 100) <= 30) {
                        // Vérifier si un like en retour n'existe pas déjà
                        $reciprocalExists = StudentLike::where('liker_id', $target->id)
                                                     ->where('liked_id', $user->id)
                                                     ->exists();

                        if (!$reciprocalExists) {
                            StudentLike::create([
                                'liker_id' => $target->id,
                                'liked_id' => $user->id,
                                'is_super_like' => false,
                                'created_at' => now()->subDays(rand(0, 30)),
                            ]);

                            // Créer le match
                            $user1Id = min($user->id, $target->id);
                            $user2Id = max($user->id, $target->id);
                            
                            $matchExists = StudentMatch::where('user1_id', $user1Id)
                                                     ->where('user2_id', $user2Id)
                                                     ->exists();

                            if (!$matchExists) {
                                $conversationStarted = rand(1, 100) <= 60; // 60% des matches démarrent une conversation
                                
                                StudentMatch::create([
                                    'user1_id' => $user1Id,
                                    'user2_id' => $user2Id,
                                    'matched_at' => now()->subDays(rand(0, 25)),
                                    'conversation_started' => $conversationStarted,
                                    'conversation_started_at' => $conversationStarted ? 
                                        now()->subDays(rand(0, 20)) : null,
                                ]);
                                
                                $matchesCreated++;
                            }
                        }
                    }
                } elseif ($action <= 60) { // 25% de chances de passer
                    StudentPass::create([
                        'passer_id' => $user->id,
                        'passed_id' => $target->id,
                        'created_at' => now()->subDays(rand(0, 30)),
                    ]);
                    
                    $passesCreated++;
                }
                // 40% de ne rien faire (profil pas encore vu)
            }
        }

        $this->command->info("Interactions CampusLove créées :");
        $this->command->info("- {$likesCreated} likes");
        $this->command->info("- {$matchesCreated} matches");
        $this->command->info("- {$passesCreated} profils refusés");
    }
}