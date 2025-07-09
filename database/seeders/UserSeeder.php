<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Marie Dupont',
                'email' => 'marie.dupont@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 123 456 789',
                'university' => 'Université de Yaoundé I',
                'study_level' => 'master',
                'field' => 'Informatique',
                'bio' => 'Étudiante en Master 2 Informatique, passionnée par le développement web et mobile.',
                'location' => 'Yaoundé, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subMinutes(5),
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30)
            ],
            [
                'name' => 'Paul Martin',
                'email' => 'paul.martin@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 234 567 890',
                'university' => 'Université de Douala',
                'study_level' => 'license',
                'field' => 'Génie Civil',
                'bio' => 'Étudiant en Licence 3 Génie Civil. Intéressé par les nouvelles technologies de construction.',
                'location' => 'Douala, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subHours(2),
                'created_at' => now()->subDays(25),
                'updated_at' => now()->subDays(25)
            ],
            [
                'name' => 'Sophie Legrand',
                'email' => 'sophie.legrand@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 345 678 901',
                'university' => 'Université de Dschang',
                'study_level' => 'doctorat',
                'field' => 'Médecine',
                'bio' => 'Doctorante en Médecine générale. Recherche active dans le domaine de la santé publique.',
                'location' => 'Dschang, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subDays(1),
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(20)
            ],
            [
                'name' => 'Jean-Claude Mballa',
                'email' => 'jc.mballa@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 456 789 012',
                'university' => 'Université de Ngaoundéré',
                'study_level' => 'master',
                'field' => 'Commerce International',
                'bio' => 'Étudiant en Master Commerce International, entrepreneur en herbe.',
                'location' => 'Ngaoundéré, Cameroun',
                'is_student' => true,
                'verified' => false,
                'last_seen' => now()->subHours(6),
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15)
            ],
            [
                'name' => 'Aminata Diallo',
                'email' => 'aminata.diallo@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 567 890 123',
                'university' => 'École Nationale Supérieure Polytechnique',
                'study_level' => 'license',
                'field' => 'Génie Électrique',
                'bio' => 'Étudiante en Génie Électrique, passionnée par les énergies renouvelables.',
                'location' => 'Yaoundé, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subMinutes(30),
                'created_at' => now()->subDays(12),
                'updated_at' => now()->subDays(12)
            ],
            [
                'name' => 'Dr. Robert Tchinda',
                'email' => 'robert.tchinda@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 678 901 234',
                'university' => 'Université de Yaoundé I',
                'field' => 'Enseignement Supérieur',
                'bio' => 'Professeur d\'université, spécialiste en informatique et nouvelles technologies.',
                'location' => 'Yaoundé, Cameroun',
                'is_student' => false,
                'verified' => true,
                'last_seen' => now()->subHours(4),
                'created_at' => now()->subDays(45),
                'updated_at' => now()->subDays(45)
            ],
            [
                'name' => 'Fatima Bello',
                'email' => 'fatima.bello@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 789 012 345',
                'university' => 'Université de Maroua',
                'study_level' => 'master',
                'field' => 'Agronomie',
                'bio' => 'Étudiante en Master Agronomie, spécialisée dans l\'agriculture durable.',
                'location' => 'Maroua, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subDays(2),
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(8)
            ],
            [
                'name' => 'Emmanuel Nkomo',
                'email' => 'emmanuel.nkomo@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 890 123 456',
                'university' => 'Université de Buéa',
                'study_level' => 'license',
                'field' => 'Anglais',
                'bio' => 'Étudiant en Licence Anglais, passionné par la littérature et la traduction.',
                'location' => 'Buéa, Cameroun',
                'is_student' => true,
                'verified' => false,
                'last_seen' => now()->subHours(12),
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5)
            ],
            [
                'name' => 'Claire Fotso',
                'email' => 'claire.fotso@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+237 901 234 567',
                'university' => 'ESSEC Douala',
                'study_level' => 'master',
                'field' => 'Management',
                'bio' => 'Étudiante en Master Management, future consultante en entreprise.',
                'location' => 'Douala, Cameroun',
                'is_student' => true,
                'verified' => true,
                'last_seen' => now()->subMinutes(15),
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3)
            ],
            [
                'name' => 'Admin User',
                'email' => 'admin@campusvente.com',
                'password' => Hash::make('admin123'),
                'phone' => '+237 000 000 000',
                'bio' => 'Administrateur système de la plateforme CampusVente.',
                'location' => 'Yaoundé, Cameroun',
                'is_student' => false,
                'verified' => true,
                'last_seen' => now(),
                'created_at' => now()->subDays(60),
                'updated_at' => now()->subDays(60)
            ]
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}