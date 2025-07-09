# API d'Authentification CampusVente

## Vue d'ensemble

Le système d'authentification de CampusVente utilise Laravel Sanctum pour gérer l'authentification API avec des tokens. Pas de vérification d'email requise - simple et direct.

## Base URL

```
http://localhost:8000/api/v1
```

## Endpoints Publics

### 1. Inscription utilisateur

**POST** `/register`

**Body (JSON) - Format Frontend:**
```json
{
  "firstName": "Marie",
  "lastName": "Dubois",
  "email": "marie@example.cm",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "+237612345678",
  "university": "Université de Yaoundé I",
  "studyLevel": "Master 2",
  "fieldOfStudy": "Informatique",
  "bio": "Étudiante en Master 2 Intelligence Artificielle",
  "location": "Yaoundé",
  "isStudent": true
}
```

**Body (JSON) - Format Backend (également supporté):**
```json
{
  "name": "Marie Dubois",
  "email": "marie@example.cm",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+237612345678",
  "university": "Université de Yaoundé I",
  "study_level": "Master 2",
  "field": "Informatique",
  "bio": "Étudiante en Master 2 Intelligence Artificielle",
  "location": "Yaoundé",
  "is_student": true
}
```

**Réponse de succès (201):**
```json
{
  "success": true,
  "message": "Inscription réussie!",
  "user": {
    "id": 1,
    "name": "Marie Dubois",
    "email": "marie@example.cm",
    "phone": "+237612345678",
    "university": "Université de Yaoundé I",
    "study_level": "Master 2",
    "field": "Informatique",
    "bio": "Étudiante en Master 2 Intelligence Artificielle",
    "location": "Yaoundé",
    "is_student": true,
    "rating": "0.00",
    "avatar": null,
    "verified": false,
    "last_seen": "2025-07-06T23:10:02.000000Z"
  },
  "token": "1|iEuewivig0Sh9uTa1qWcM0ZJc51Cy1wuDdr8jkb38c874e27",
  "token_type": "Bearer"
}
```

### 2. Connexion utilisateur

**POST** `/login`

**Body (JSON):**
```json
{
  "email": "marie@example.cm",
  "password": "password123"
}
```

**Réponse de succès (200):**
```json
{
  "success": true,
  "message": "Connexion réussie!",
  "user": { /* données utilisateur complètes */ },
  "token": "2|8mc5AuITNmrvPhsPujIHmXTDUnwChPkXgAdrah4k",
  "token_type": "Bearer"
}
```

## Endpoints Protégés

> **Note:** Tous les endpoints protégés nécessitent le header d'autorisation :
> ```
> Authorization: Bearer YOUR_TOKEN_HERE
> ```

### 3. Informations utilisateur connecté

**GET** `/me`

**Réponse de succès (200):**
```json
{
  "success": true,
  "user": { /* données utilisateur complètes */ },
  "is_online": false
}
```

### 4. Déconnexion

**POST** `/logout`

**Réponse de succès (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie!"
}
```

### 5. Mise à jour du profil

**PUT** `/profile`

**Body (JSON):**
```json
{
  "name": "Nouveau nom",
  "phone": "+33123456789",
  "university": "Nouvelle université",
  "study_level": "Doctorat",
  "field": "Sciences",
  "bio": "Nouvelle bio",
  "location": "Nouvelle ville",
  "is_student": false
}
```

## Validation des données

### Inscription
- `name`: requis, chaîne, max 255 caractères
- `email`: requis, email valide, unique, max 255 caractères  
- `password`: requis, chaîne, min 8 caractères, avec confirmation
- `phone`: optionnel, chaîne, max 20 caractères
- `university`: optionnel, chaîne, max 255 caractères
- `study_level`: optionnel, chaîne, max 100 caractères
- `field`: optionnel, chaîne, max 100 caractères
- `bio`: optionnel, texte, max 1000 caractères
- `location`: optionnel, chaîne, max 255 caractères
- `is_student`: booléen, défaut true

### Connexion
- `email`: requis, format email
- `password`: requis

## Gestion des erreurs

### Erreurs de validation (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

### Erreurs d'authentification (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Email ou mot de passe incorrect."]
  }
}
```

### Non autorisé (401)
```json
{
  "message": "Unauthenticated."
}
```

## Fonctionnalités spéciales

### Statut en ligne
- Le champ `last_seen` est automatiquement mis à jour lors de l'authentification
- La méthode `isOnline()` considère qu'un utilisateur est en ligne s'il a été vu dans les 5 dernières minutes

### Champs utilisateur étendus
Le modèle utilisateur inclut des champs spécifiques au contexte universitaire :
- Informations académiques (université, niveau d'études, domaine)
- Données de contact (téléphone, localisation)
- Profil social (bio, avatar, vérification, notation)

## Exemples d'utilisation

### Flux d'authentification complet
```bash
# 1. Inscription
curl -X POST http://localhost:8000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'

# 2. Connexion
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Utilisation avec token
curl -X GET http://localhost:8000/api/v1/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Déconnexion
curl -X POST http://localhost:8000/api/v1/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Données de référence

### Universités du Cameroun

**GET** `/universities`

Retourne la liste des universités du Cameroun avec leurs informations détaillées.

**Réponse de succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Université de Yaoundé I",
      "acronym": "UY1",
      "city": "Yaoundé",
      "region": "Centre",
      "type": "public",
      "founded": 1962,
      "description": "Première université du Cameroun, spécialisée en sciences et technologies.",
      "website": "https://www.uy1.uninet.cm",
      "active": true
    }
  ]
}
```

### Villes du Cameroun

**GET** `/cities`

Retourne la liste des villes du Cameroun organisées par région.

**Réponse de succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Yaoundé",
      "region": "Centre",
      "is_capital": true
    }
  ]
}
```

### Régions du Cameroun

**GET** `/regions`

Retourne la liste des régions du Cameroun.

**Réponse de succès (200):**
```json
{
  "success": true,
  "data": [
    "Adamaoua",
    "Centre",
    "Est",
    "Extrême-Nord",
    "Littoral",
    "Nord",
    "Nord-Ouest",
    "Ouest",
    "Sud",
    "Sud-Ouest"
  ]
}
```