#!/bin/bash

# Script de configuration initiale de MySQL pour CampusVente
echo "⚙️  Configuration de MySQL pour CampusVente..."

# Démarrer MySQL s'il n'est pas déjà démarré
sudo service mysql start

# Créer la base de données et l'utilisateur
echo "📝 Configuration de la base de données..."

mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS campusVente CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'campusvente'@'localhost' IDENTIFIED BY 'campusvente123';
GRANT ALL PRIVILEGES ON campusVente.* TO 'campusvente'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuration terminée avec succès !"
    echo ""
    echo "📋 Informations de la base de données :"
    echo "Database: campusVente"
    echo "Username: campusvente"
    echo "Password: campusvente123"
    echo "Host: 127.0.0.1"
    echo "Port: 3306"
    echo ""
    echo "🔧 Mettez à jour votre fichier .env avec ces informations"
else
    echo "❌ Erreur lors de la configuration"
fi