#!/bin/bash

# Script pour vérifier le statut de MySQL
echo "📊 Statut de MySQL :"
echo "===================="

# Vérifier le statut du service
sudo service mysql status

echo ""
echo "🔌 Processus MySQL actifs :"
ps aux | grep mysql | grep -v grep

echo ""
echo "🌐 Ports d'écoute MySQL :"
sudo netstat -tlnp | grep 3306 || echo "Aucun processus n'écoute sur le port 3306"