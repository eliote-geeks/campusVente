# CampusVente - Plateforme Universitaire Multi-Services

CampusVente est une plateforme web complète dédiée aux étudiants universitaires, offrant trois services principaux : marketplace d'annonces, organisation de meetings et service de rencontres (Campus Love).

## 🚀 Fonctionnalités

### 📢 Marketplace d'Annonces
- Publication et consultation d'annonces (vente, achat, services)
- Catégorisation par type de produit/service
- Système de likes et de vues
- Upload d'images et vidéos pour les annonces
- Notifications en temps réel
- Système de notation des utilisateurs

### 🤝 Meetings & Événements
- Création et gestion de meetings étudiants
- Système de participants et d'invitations
- Calendrier intégré

### 💕 Campus Love
- Service de rencontres pour étudiants
- Profils détaillés avec photos
- Système de matching intelligent
- Chat privé entre matches
- Accès premium avec fonctionnalités avancées

### 💳 Système de Paiement
- Intégration Monetbil pour les paiements mobiles
- Gestion des abonnements premium
- Historique des transactions

## 🛠 Technologies Utilisées

### Backend
- **Laravel 12** - Framework PHP
- **Laravel Sanctum** - Authentification API
- **MySQL** - Base de données
- **Intervention Image** - Traitement d'images

### Frontend
- **React 19** - Interface utilisateur
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Bootstrap 5** - Framework CSS
- **Tailwind CSS** - Styling utilitaire
- **Lucide React** - Icônes

### Outils de Développement
- **Vite** - Build tool
- **Laravel Pint** - Code formatting
- **PHPUnit** - Tests unitaires
- **Concurrently** - Gestion des processus

## 📦 Installation

### Prérequis
- PHP 8.2+
- Composer
- Node.js 18+ (ou 20+ pour React Router v7)
- MySQL

### Installation Backend

```bash
# Cloner le projet
git clone https://github.com/votre-username/campusVente.git
cd campusVente

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=campus_vente
# DB_USERNAME=root
# DB_PASSWORD=

# Exécuter les migrations
php artisan migrate

# Peupler la base de données (optionnel)
php artisan db:seed
```

### Installation Frontend

```bash
# Installer les dépendances Node.js
npm install

# Construire les assets
npm run build
```

## 🚀 Utilisation

### Développement

```bash
# Démarrer tous les services en développement
composer run dev
```

Cette commande lance simultanément :
- Serveur Laravel (`php artisan serve`)
- Worker de queue (`php artisan queue:listen`)
- Logs en temps réel (`php artisan pail`)
- Build Vite en mode watch (`npm run dev`)

### Production

```bash
# Construire pour la production
npm run build

# Démarrer le serveur
php artisan serve
```

### Tests

```bash
# Exécuter les tests
composer run test
```

## 👤 Compte Administrateur

Un compte administrateur est automatiquement créé lors de l'installation :
- **Email**: admin@campusvente.com
- **Mot de passe**: admin123

## 🗂 Structure du Projet

```
campusVente/
├── app/
│   ├── Http/Controllers/Api/    # Contrôleurs API
│   ├── Models/                  # Modèles Eloquent
│   ├── Services/               # Services métier
│   └── Notifications/          # Notifications personnalisées
├── database/
│   ├── migrations/             # Migrations de base de données
│   └── seeders/               # Peuplage de données
├── resources/
│   ├── js/                    # Code React
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/            # Pages de l'application
│   │   └── services/         # Services API
│   └── css/                  # Styles CSS
├── routes/
│   ├── api.php               # Routes API
│   └── web.php               # Routes web
└── storage/
    └── app/public/           # Fichiers uploadés
```

## 🔧 Configuration

### Variables d'Environnement Importantes

```env
# Application
APP_NAME=CampusVente
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=campus_vente

# Monetbil (Paiements)
MONETBIL_SERVICE_KEY=votre_cle_service
MONETBIL_SERVICE_SECRET=votre_secret_service

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email
MAIL_PASSWORD=votre_mot_de_passe
MAIL_ENCRYPTION=tls
```

## 📱 API Endpoints

### Authentification
- `POST /api/register` - Inscription
- `POST /api/login` - Connexion
- `POST /api/logout` - Déconnexion

### Annonces
- `GET /api/announcements` - Liste des annonces
- `POST /api/announcements` - Créer une annonce
- `PUT /api/announcements/{id}` - Modifier une annonce
- `DELETE /api/announcements/{id}` - Supprimer une annonce

### Campus Love
- `GET /api/campus-love/profiles` - Profils disponibles
- `POST /api/campus-love/like` - Liker un profil
- `POST /api/campus-love/pass` - Passer un profil

### Paiements
- `POST /api/payments/initiate` - Initier un paiement
- `GET /api/payments/history` - Historique des paiements

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter vos changements (`git commit -am 'Ajout d'une nouvelle fonctionnalité'`)
4. Pusher vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème, veuillez créer une issue sur GitHub ou contacter l'équipe de développement.

---

Développé avec ❤️ pour la communauté étudiante