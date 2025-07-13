<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Meeting;
use App\Models\User;
use App\Models\Category;
use Carbon\Carbon;

class MeetingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $categories = Category::all();

        $meetings = [
            [
                'title' => 'Soirée étudiante - Rentrée 2024',
                'description' => 'Grande soirée pour célébrer la rentrée universitaire ! Venez nombreux pour faire connaissance avec les nouveaux étudiants et retrouver vos amis. Ambiance musicale, boissons et petits plats au programme.',
                'type' => 'party',
                'status' => 'upcoming',
                'meeting_date' => now()->addDays(15)->setTime(20, 0),
                'location' => 'Bar Le Central',
                'address' => 'Avenue Kennedy, Yaoundé',
                'max_participants' => 50,
                'price' => 5000,
                'is_free' => false,
                'is_online' => false,
                'requirements' => 'Être étudiant avec une carte d\'étudiant valide',
                'contact_info' => 'WhatsApp: +237 123 456 789',
                'is_featured' => true,
                'views' => 124,
                'user_id' => $users->where('name', 'Marie Dupont')->first()->id ?? 1,
                'category_id' => $categories->where('name', 'Événements')->first()->id ?? null,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5)
            ],
            [
                'title' => 'Groupe d\'étude Mathématiques',
                'description' => 'Séance de révision pour l\'examen de mathématiques du semestre. Nous réviserons les chapitres sur les intégrales, les dérivées et les équations différentielles. Apportez vos exercices et calculatrices.',
                'type' => 'study_group',
                'status' => 'upcoming',
                'meeting_date' => now()->addDays(3)->setTime(14, 0),
                'location' => 'Bibliothèque Université de Yaoundé I',
                'address' => 'Campus principal, Salle 205',
                'max_participants' => 15,
                'price' => 0,
                'is_free' => true,
                'is_online' => false,
                'requirements' => 'Niveau L2 minimum en mathématiques',
                'contact_info' => 'Email: maths.study@gmail.com',
                'is_featured' => false,
                'views' => 67,
                'user_id' => $users->where('name', 'Paul Martin')->first()->id ?? 2,
                'category_id' => $categories->where('name', 'Éducation')->first()->id ?? null,
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(7)
            ],
            [
                'title' => 'Conférence: IA et Avenir Technologique',
                'description' => 'Conférence sur l\'intelligence artificielle et son impact sur l\'avenir technologique en Afrique. Intervention de Dr. Robert Tchinda, expert en informatique. Questions-réponses à la fin.',
                'type' => 'conference',
                'status' => 'upcoming',
                'meeting_date' => now()->addDays(10)->setTime(16, 30),
                'location' => 'Amphithéâtre 500',
                'address' => 'École Nationale Supérieure Polytechnique, Yaoundé',
                'max_participants' => 200,
                'price' => 0,
                'is_free' => true,
                'is_online' => true,
                'online_link' => 'https://zoom.us/j/123456789',
                'requirements' => 'Aucune, ouverte à tous',
                'contact_info' => 'contact@ensp.cm',
                'is_featured' => true,
                'views' => 289,
                'user_id' => $users->where('name', 'Dr. Robert Tchinda')->first()->id ?? 6,
                'category_id' => $categories->where('name', 'Technologie')->first()->id ?? null,
                'created_at' => now()->subDays(12),
                'updated_at' => now()->subDays(12)
            ],
            [
                'title' => 'Tournoi de Football Inter-Universités',
                'description' => 'Tournoi amical de football entre les différentes universités de Yaoundé. Inscription par équipe de 11 joueurs + 3 remplaçants. Trophée et médailles pour les vainqueurs.',
                'type' => 'sport',
                'status' => 'upcoming',
                'meeting_date' => now()->addDays(20)->setTime(9, 0),
                'location' => 'Stade Omnisports de Yaoundé',
                'address' => 'Avenue du 20 Mai, Yaoundé',
                'max_participants' => 100,
                'price' => 2000,
                'is_free' => false,
                'is_online' => false,
                'requirements' => 'Être étudiant et avoir une assurance sport',
                'contact_info' => 'Tel: +237 234 567 890',
                'is_featured' => false,
                'views' => 156,
                'user_id' => $users->where('name', 'Jean-Claude Mballa')->first()->id ?? 4,
                'category_id' => $categories->where('name', 'Sport')->first()->id ?? null,
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(8)
            ],
            [
                'title' => 'Atelier Entrepreneuriat Étudiant',
                'description' => 'Atelier pratique sur l\'entrepreneuriat pour les étudiants. Comment créer sa startup, lever des fonds, et développer son business model. Cas pratiques et témoignages d\'entrepreneurs.',
                'type' => 'workshop',
                'status' => 'upcoming',
                'meeting_date' => now()->addDays(7)->setTime(10, 0),
                'location' => 'Centre d\'Innovation ESSEC',
                'address' => 'ESSEC Business School, Douala',
                'max_participants' => 30,
                'price' => 10000,
                'is_free' => false,
                'is_online' => false,
                'requirements' => 'Avoir un projet d\'entreprise ou une idée',
                'contact_info' => 'entrepreneuriat@essec.cm',
                'is_featured' => true,
                'views' => 201,
                'user_id' => $users->where('name', 'Claire Fotso')->first()->id ?? 9,
                'category_id' => $categories->where('name', 'Business')->first()->id ?? null,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10)
            ],
            [
                'title' => 'Networking des Professionnels IT',
                'description' => 'Rencontre networking pour les étudiants et professionnels du secteur IT au Cameroun. Échanges d\'expériences, opportunités d\'emploi et de stage. Buffet inclus.',
                'type' => 'networking',
                'status' => 'upcoming',
                'meeting_date' => now()->addDays(25)->setTime(18, 0),
                'location' => 'Hôtel Hilton Yaoundé',
                'address' => 'Boulevard du 20 Mai, Yaoundé',
                'max_participants' => 80,
                'price' => 15000,
                'is_free' => false,
                'is_online' => false,
                'requirements' => 'Étudiant en informatique ou professionnel IT',
                'contact_info' => 'it.networking@gmail.com',
                'is_featured' => false,
                'views' => 98,
                'user_id' => $users->where('name', 'Aminata Diallo')->first()->id ?? 5,
                'category_id' => $categories->where('name', 'Technologie')->first()->id ?? null,
                'created_at' => now()->subDays(6),
                'updated_at' => now()->subDays(6)
            ],
            [
                'title' => 'Festival Culturel Africain',
                'description' => 'Célébration de la diversité culturelle africaine avec danses traditionnelles, expositions d\'art, musique live et gastronomie locale. Participation de plusieurs groupes culturels.',
                'type' => 'cultural',
                'status' => 'upcoming',
                'meeting_date' => now()->addDays(30)->setTime(15, 0),
                'location' => 'Centre Culturel Camerounais',
                'address' => 'Rue de la Culture, Yaoundé',
                'max_participants' => 150,
                'price' => 3000,
                'is_free' => false,
                'is_online' => false,
                'requirements' => 'Aucune',
                'contact_info' => 'culture@ccc.cm',
                'is_featured' => true,
                'views' => 178,
                'user_id' => $users->where('name', 'Sophie Legrand')->first()->id ?? 3,
                'category_id' => $categories->where('name', 'Culture')->first()->id ?? null,
                'created_at' => now()->subDays(14),
                'updated_at' => now()->subDays(14)
            ],
            [
                'title' => 'Session de Révision Anglais',
                'description' => 'Session intensive de révision pour l\'examen d\'anglais. Focus sur la grammaire, le vocabulaire et la compréhension. Exercices pratiques et tests blancs.',
                'type' => 'study_group',
                'status' => 'completed',
                'meeting_date' => now()->subDays(2)->setTime(9, 0),
                'location' => 'Salle B12, Université de Buéa',
                'address' => 'Campus principal, Buéa',
                'max_participants' => 20,
                'price' => 0,
                'is_free' => true,
                'is_online' => false,
                'requirements' => 'Niveau intermédiaire en anglais',
                'contact_info' => 'english.revision@ub.cm',
                'is_featured' => false,
                'views' => 45,
                'user_id' => $users->where('name', 'Emmanuel Nkomo')->first()->id ?? 8,
                'category_id' => $categories->where('name', 'Éducation')->first()->id ?? null,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(2)
            ]
        ];

        foreach ($meetings as $meetingData) {
            $meeting = Meeting::create($meetingData);
            
            // Add the creator as organizer
            $meeting->addParticipant($meeting->user_id, null, true);
            
            // Add some random participants
            $randomUsers = $users->except($meeting->user_id)->random(rand(3, 8));
            foreach ($randomUsers as $user) {
                if (rand(1, 3) == 1) { // 33% chance to participate
                    $meeting->addParticipant($user->id, 'Intéressé par cette rencontre !');
                }
            }
        }
    }
}