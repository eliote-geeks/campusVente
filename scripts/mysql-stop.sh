#!/bin/bash

# Script pour arrêter MySQL
echo "🛑 Arrêt de MySQL..."

# Arrêter MySQL
sudo service mysql stop

# Vérifier le statut
if sudo service mysql status | grep -q "stopped\|not running"; then
    echo "✅ MySQL est arrêté"
else
    echo "❌ MySQL est encore en cours d'exécution"
fi