<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CameroonCitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            // Région du Centre
            ['name' => 'Yaoundé', 'region' => 'Centre', 'is_capital' => true],
            ['name' => 'Mbalmayo', 'region' => 'Centre', 'is_capital' => false],
            ['name' => 'Soa', 'region' => 'Centre', 'is_capital' => false],
            ['name' => 'Obala', 'region' => 'Centre', 'is_capital' => false],
            ['name' => 'Akonolinga', 'region' => 'Centre', 'is_capital' => false],
            ['name' => 'Ntui', 'region' => 'Centre', 'is_capital' => false],
            ['name' => 'Ngoumou', 'region' => 'Centre', 'is_capital' => false],
            ['name' => 'Eseka', 'region' => 'Centre', 'is_capital' => false],

            // Région du Littoral
            ['name' => 'Douala', 'region' => 'Littoral', 'is_capital' => true],
            ['name' => 'Edéa', 'region' => 'Littoral', 'is_capital' => false],
            ['name' => 'Nkongsamba', 'region' => 'Littoral', 'is_capital' => false],
            ['name' => 'Loum', 'region' => 'Littoral', 'is_capital' => false],
            ['name' => 'Manjo', 'region' => 'Littoral', 'is_capital' => false],
            ['name' => 'Yabassi', 'region' => 'Littoral', 'is_capital' => false],
            ['name' => 'Dizangué', 'region' => 'Littoral', 'is_capital' => false],

            // Région de l'Ouest
            ['name' => 'Bafoussam', 'region' => 'Ouest', 'is_capital' => true],
            ['name' => 'Dschang', 'region' => 'Ouest', 'is_capital' => false],
            ['name' => 'Bangangté', 'region' => 'Ouest', 'is_capital' => false],
            ['name' => 'Mbouda', 'region' => 'Ouest', 'is_capital' => false],
            ['name' => 'Foumban', 'region' => 'Ouest', 'is_capital' => false],
            ['name' => 'Bafang', 'region' => 'Ouest', 'is_capital' => false],
            ['name' => 'Bandjoun', 'region' => 'Ouest', 'is_capital' => false],

            // Région du Sud-Ouest
            ['name' => 'Buea', 'region' => 'Sud-Ouest', 'is_capital' => true],
            ['name' => 'Limbe', 'region' => 'Sud-Ouest', 'is_capital' => false],
            ['name' => 'Kumba', 'region' => 'Sud-Ouest', 'is_capital' => false],
            ['name' => 'Mamfé', 'region' => 'Sud-Ouest', 'is_capital' => false],
            ['name' => 'Tiko', 'region' => 'Sud-Ouest', 'is_capital' => false],
            ['name' => 'Victoria', 'region' => 'Sud-Ouest', 'is_capital' => false],
            ['name' => 'Idenau', 'region' => 'Sud-Ouest', 'is_capital' => false],

            // Région du Nord-Ouest
            ['name' => 'Bamenda', 'region' => 'Nord-Ouest', 'is_capital' => true],
            ['name' => 'Wum', 'region' => 'Nord-Ouest', 'is_capital' => false],
            ['name' => 'Fundong', 'region' => 'Nord-Ouest', 'is_capital' => false],
            ['name' => 'Kumbo', 'region' => 'Nord-Ouest', 'is_capital' => false],
            ['name' => 'Ndop', 'region' => 'Nord-Ouest', 'is_capital' => false],
            ['name' => 'Nkambe', 'region' => 'Nord-Ouest', 'is_capital' => false],
            ['name' => 'Bali', 'region' => 'Nord-Ouest', 'is_capital' => false],

            // Région de l'Adamaoua
            ['name' => 'Ngaoundéré', 'region' => 'Adamaoua', 'is_capital' => true],
            ['name' => 'Tibati', 'region' => 'Adamaoua', 'is_capital' => false],
            ['name' => 'Banyo', 'region' => 'Adamaoua', 'is_capital' => false],
            ['name' => 'Tignère', 'region' => 'Adamaoua', 'is_capital' => false],
            ['name' => 'Meiganga', 'region' => 'Adamaoua', 'is_capital' => false],
            ['name' => 'Kontcha', 'region' => 'Adamaoua', 'is_capital' => false],

            // Région du Nord
            ['name' => 'Garoua', 'region' => 'Nord', 'is_capital' => true],
            ['name' => 'Guider', 'region' => 'Nord', 'is_capital' => false],
            ['name' => 'Figuil', 'region' => 'Nord', 'is_capital' => false],
            ['name' => 'Tcholliré', 'region' => 'Nord', 'is_capital' => false],
            ['name' => 'Pitoa', 'region' => 'Nord', 'is_capital' => false],
            ['name' => 'Lagdo', 'region' => 'Nord', 'is_capital' => false],
            ['name' => 'Bénoué', 'region' => 'Nord', 'is_capital' => false],

            // Région de l'Extrême-Nord
            ['name' => 'Maroua', 'region' => 'Extrême-Nord', 'is_capital' => true],
            ['name' => 'Kousseri', 'region' => 'Extrême-Nord', 'is_capital' => false],
            ['name' => 'Mokolo', 'region' => 'Extrême-Nord', 'is_capital' => false],
            ['name' => 'Kaélé', 'region' => 'Extrême-Nord', 'is_capital' => false],
            ['name' => 'Mora', 'region' => 'Extrême-Nord', 'is_capital' => false],
            ['name' => 'Yagoua', 'region' => 'Extrême-Nord', 'is_capital' => false],
            ['name' => 'Waza', 'region' => 'Extrême-Nord', 'is_capital' => false],

            // Région de l'Est
            ['name' => 'Bertoua', 'region' => 'Est', 'is_capital' => true],
            ['name' => 'Batouri', 'region' => 'Est', 'is_capital' => false],
            ['name' => 'Yokadouma', 'region' => 'Est', 'is_capital' => false],
            ['name' => 'Abong-Mbang', 'region' => 'Est', 'is_capital' => false],
            ['name' => 'Mbang', 'region' => 'Est', 'is_capital' => false],
            ['name' => 'Lomié', 'region' => 'Est', 'is_capital' => false],
            ['name' => 'Moloundou', 'region' => 'Est', 'is_capital' => false],

            // Région du Sud
            ['name' => 'Ebolowa', 'region' => 'Sud', 'is_capital' => true],
            ['name' => 'Kribi', 'region' => 'Sud', 'is_capital' => false],
            ['name' => 'Sangmélima', 'region' => 'Sud', 'is_capital' => false],
            ['name' => 'Ambam', 'region' => 'Sud', 'is_capital' => false],
            ['name' => 'Lolodorf', 'region' => 'Sud', 'is_capital' => false],
            ['name' => 'Djoum', 'region' => 'Sud', 'is_capital' => false],
            ['name' => 'Campo', 'region' => 'Sud', 'is_capital' => false],
        ];

        // Create table if it doesn't exist
        DB::statement('CREATE TABLE IF NOT EXISTS cameroon_cities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            region VARCHAR(255) NOT NULL,
            is_capital BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');

        // Insert cities
        foreach ($cities as $city) {
            DB::table('cameroon_cities')->insert([
                'name' => $city['name'],
                'region' => $city['region'],
                'is_capital' => $city['is_capital'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}