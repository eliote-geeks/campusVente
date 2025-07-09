#!/bin/bash

# Script pour démarrer MySQL
echo "🚀 Démarrage de MySQL..."

# Démarrer MySQL
sudo service mysql start

# Vérifier le statut
if sudo service mysql status | grep -q "running"; then
    echo "✅ MySQL est démarré et fonctionne"
    
    # Afficher les informations de connexion
    echo ""
    echo "📋 Informations de connexion :"
    echo "Host: 127.0.0.1"
    echo "Port: 3306"
    echo "Database: campusVente"
    echo "Username: root"
    echo ""
    echo "Pour vous connecter : mysql -u root -p"
    echo "Pour arrêter MySQL : ./scripts/mysql-stop.sh"
else
    echo "❌ Erreur lors du démarrage de MySQL"
fi