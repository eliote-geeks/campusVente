<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@campusvente.com'],
            [
                'name' => 'Administrateur CampusVente',
                'email' => 'admin@campusvente.com',
                'password' => Hash::make('admin123'),
                'is_admin' => true,
                'is_student' => false,
                'university' => 'Administration',
                'email_verified_at' => now(),
            ]
        );
    }
}
