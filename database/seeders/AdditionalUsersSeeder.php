<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdditionalUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $additionalUsers = [
            [
                'name' => 'Alice Bernard',
                'email' => 'alice.bernard@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 111 222 333',
                'university' => 'Université de Bamenda',
                'study_level' => 'license',
                'field' => 'Sociologie',
                'bio' => 'Étudiante en sociologie, passionnée par les questions sociales contemporaines.',
                'location' => 'Bamenda, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subMinutes(10),
                'created_at' => now()->subDays(18),
                'updated_at' => now()->subDays(18)
            ],
            [
                'name' => 'Thomas Njoya',
                'email' => 'thomas.njoya@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 222 333 444',
                'university' => 'Université de Yaoundé II',
                'study_level' => 'master',
                'field' => 'Droit',
                'bio' => 'Étudiant en Master Droit des Affaires, futur avocat.',
                'location' => 'Yaoundé, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subHours(3),
                'created_at' => now()->subDays(14),
                'updated_at' => now()->subDays(14)
            ],
            [
                'name' => 'Isabelle Moukoko',
                'email' => 'isabelle.moukoko@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 333 444 555',
                'university' => 'Université de Douala',
                'study_level' => 'doctorat',
                'field' => 'Économie',
                'bio' => 'Doctorante en Sciences Économiques, spécialiste du développement africain.',
                'location' => 'Douala, Cameroun',
                'is_student' => true,
                'verified' => false,
                'last_seen' => now()->subDays(3),
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10)
            ],
            [
                'name' => 'Kevin Talla',
                'email' => 'kevin.talla@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 444 555 666',
                'university' => 'Institut Universitaire de Technologie',
                'study_level' => 'license',
                'field' => 'Réseaux et Télécommunications',
                'bio' => 'Étudiant en réseaux, passionné par la cybersécurité.',
                'location' => 'Douala, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subMinutes(45),
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(7)
            ],
            [
                'name' => 'Nadège Bilong',
                'email' => 'nadege.bilong@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 555 666 777',
                'university' => 'Université Catholique d\'Afrique Centrale',
                'study_level' => 'master',
                'field' => 'Psychologie',
                'bio' => 'Étudiante en Master Psychologie Clinique, future thérapeute.',
                'location' => 'Yaoundé, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subHours(8),
                'created_at' => now()->subDays(4),
                'updated_at' => now()->subDays(4)
            ],
            [
                'name' => 'Junior Essi',
                'email' => 'junior.essi@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 666 777 888',
                'university' => 'École Supérieure des Sciences Économiques',
                'study_level' => 'license',
                'field' => 'Comptabilité',
                'bio' => 'Étudiant comptable, expert en gestion financière.',
                'location' => 'Douala, Cameroun',
                'is_student' => true,
                'verified' => false,
                'last_seen' => now()->subDays(1),
                'created_at' => now()->subDays(6),
                'updated_at' => now()->subDays(6)
            ],
            [
                'name' => 'Sandrine Kana',
                'email' => 'sandrine.kana@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 777 888 999',
                'university' => 'Université de Ngaoundéré',
                'study_level' => 'master',
                'field' => 'Biologie',
                'bio' => 'Étudiante en Master Biologie, future chercheuse.',
                'location' => 'Ngaoundéré, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subMinutes(20),
                'created_at' => now()->subDays(9),
                'updated_at' => now()->subDays(9)
            ],
            [
                'name' => 'Patrick Owona',
                'email' => 'patrick.owona@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 888 999 000',
                'university' => 'École Nationale Supérieure Polytechnique',
                'study_level' => 'license',
                'field' => 'Génie Industriel',
                'bio' => 'Étudiant ingénieur industriel, passionné par l\'optimisation des processus.',
                'location' => 'Yaoundé, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subHours(1),
                'created_at' => now()->subDays(11),
                'updated_at' => now()->subDays(11)
            ],
            [
                'name' => 'Marlène Fouda',
                'email' => 'marlene.fouda@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 999 000 111',
                'university' => 'Université de Dschang',
                'study_level' => 'doctorat',
                'field' => 'Chimie',
                'bio' => 'Doctorante en Chimie Organique, spécialiste des produits naturels.',
                'location' => 'Dschang, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subDays(2),
                'created_at' => now()->subDays(16),
                'updated_at' => now()->subDays(16)
            ],
            [
                'name' => 'Rodrigue Manga',
                'email' => 'rodrigue.manga@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 000 111 222',
                'university' => 'Institut Supérieur de Commerce',
                'study_level' => 'master',
                'field' => 'Marketing Digital',
                'bio' => 'Étudiant en Marketing Digital, entrepreneur en devenir.',
                'location' => 'Douala, Cameroun',
                'is_student' => true,
                'verified' => false,
                'last_seen' => now()->subHours(5),
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2)
            ]
        ];

        foreach ($additionalUsers as $userData) {
            User::create($userData);
        }
    }
}