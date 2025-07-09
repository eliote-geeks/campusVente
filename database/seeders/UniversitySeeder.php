<?php

namespace Database\Seeders;

use App\Models\University;
use Illuminate\Database\Seeder;

class UniversitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $universities = [
            // Région du Centre
            [
                'name' => 'Université de Yaoundé I',
                'acronym' => 'UY1',
                'city' => 'Yaoundé',
                'region' => 'Centre',
                'type' => 'public',
                'founded' => 1962,
                'description' => 'Première université du Cameroun, spécialisée en sciences et technologies.',
                'website' => 'https://www.uy1.uninet.cm',
                'active' => true,
            ],
            [
                'name' => 'Université de Yaoundé II - Soa',
                'acronym' => 'UY2',
                'city' => 'Soa',
                'region' => 'Centre',
                'type' => 'public',
                'founded' => 1993,
                'description' => 'Université spécialisée en sciences sociales et de gestion.',
                'website' => 'https://www.uy2.uninet.cm',
                'active' => true,
            ],
            [
                'name' => 'Université Catholique d\'Afrique Centrale',
                'acronym' => 'UCAC',
                'city' => 'Yaoundé',
                'region' => 'Centre',
                'type' => 'private',
                'founded' => 1991,
                'description' => 'Université privée catholique pluridisciplinaire.',
                'website' => 'https://www.ucac-icy.net',
                'active' => true,
            ],
            [
                'name' => 'Université Protestante d\'Afrique Centrale',
                'acronym' => 'UPAC',
                'city' => 'Yaoundé',
                'region' => 'Centre',
                'type' => 'private',
                'founded' => 2007,
                'description' => 'Université privée protestante.',
                'website' => null,
                'active' => true,
            ],

            // Région du Littoral
            [
                'name' => 'Université de Douala',
                'acronym' => 'UDa',
                'city' => 'Douala',
                'region' => 'Littoral',
                'type' => 'public',
                'founded' => 1993,
                'description' => 'Université publique pluridisciplinaire.',
                'website' => 'https://www.univ-douala.com',
                'active' => true,
            ],
            [
                'name' => 'Université de Douala - Institut Universitaire de Technologie',
                'acronym' => 'IUT-Douala',
                'city' => 'Douala',
                'region' => 'Littoral',
                'type' => 'public',
                'founded' => 1993,
                'description' => 'Institut universitaire de technologie.',
                'website' => null,
                'active' => true,
            ],

            // Région de l'Ouest
            [
                'name' => 'Université de Dschang',
                'acronym' => 'UDs',
                'city' => 'Dschang',
                'region' => 'Ouest',
                'type' => 'public',
                'founded' => 1993,
                'description' => 'Université publique spécialisée en agriculture et sciences vétérinaires.',
                'website' => 'https://www.univ-dschang.org',
                'active' => true,
            ],
            [
                'name' => 'Université des Montagnes',
                'acronym' => 'UdM',
                'city' => 'Bangangté',
                'region' => 'Ouest',
                'type' => 'private',
                'founded' => 2000,
                'description' => 'Université privée spécialisée en sciences de l\'ingénieur.',
                'website' => 'https://www.udesmontagnes.org',
                'active' => true,
            ],

            // Région du Nord-Ouest
            [
                'name' => 'University of Buea',
                'acronym' => 'UB',
                'city' => 'Buea',
                'region' => 'Sud-Ouest',
                'type' => 'public',
                'founded' => 1993,
                'description' => 'Université anglophone publique.',
                'website' => 'https://www.ubuea.cm',
                'active' => true,
            ],
            [
                'name' => 'University of Bamenda',
                'acronym' => 'UBa',
                'city' => 'Bamenda',
                'region' => 'Nord-Ouest',
                'type' => 'public',
                'founded' => 2011,
                'description' => 'Université publique anglophone.',
                'website' => 'https://www.uniba.cm',
                'active' => true,
            ],

            // Région du Nord
            [
                'name' => 'Université de Ngaoundéré',
                'acronym' => 'UN',
                'city' => 'Ngaoundéré',
                'region' => 'Adamaoua',
                'type' => 'public',
                'founded' => 1993,
                'description' => 'Université publique du Grand Nord.',
                'website' => 'https://www.univ-ndere.cm',
                'active' => true,
            ],
            [
                'name' => 'Université de Maroua',
                'acronym' => 'UM',
                'city' => 'Maroua',
                'region' => 'Extrême-Nord',
                'type' => 'public',
                'founded' => 2008,
                'description' => 'Université publique de l\'Extrême-Nord.',
                'website' => 'https://www.univ-maroua.cm',
                'active' => true,
            ],

            // Instituts Spécialisés
            [
                'name' => 'École Nationale Supérieure Polytechnique',
                'acronym' => 'ENSP',
                'city' => 'Yaoundé',
                'region' => 'Centre',
                'type' => 'public',
                'founded' => 1971,
                'description' => 'Grande école d\'ingénieurs.',
                'website' => 'https://www.ensp-uy1.cm',
                'active' => true,
            ],
            [
                'name' => 'École Nationale Supérieure des Postes et Télécommunications',
                'acronym' => 'ENSPT',
                'city' => 'Yaoundé',
                'region' => 'Centre',
                'type' => 'public',
                'founded' => 1971,
                'description' => 'École spécialisée en télécommunications.',
                'website' => null,
                'active' => true,
            ],
            [
                'name' => 'Institut Supérieur de Commerce de Douala',
                'acronym' => 'ISCD',
                'city' => 'Douala',
                'region' => 'Littoral',
                'type' => 'private',
                'founded' => 1985,
                'description' => 'École supérieure de commerce.',
                'website' => null,
                'active' => true,
            ],
            [
                'name' => 'Institut Universitaire de la Côte',
                'acronym' => 'IUC',
                'city' => 'Douala',
                'region' => 'Littoral',
                'type' => 'private',
                'founded' => 2005,
                'description' => 'Université privée pluridisciplinaire.',
                'website' => 'https://www.iuc-douala.com',
                'active' => true,
            ],
        ];

        foreach ($universities as $university) {
            University::create([
                'name' => $university['name'],
                'acronym' => $university['acronym'],
                'city' => $university['city'],
                'region' => $university['region'],
                'type' => $university['type'],
                'founded' => $university['founded'],
                'website' => $university['website'],
                'description' => $university['description'],
                'active' => $university['active']
            ]);
        }
    }
}