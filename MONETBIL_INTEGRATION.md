# Documentation Intégration Monetbil - CampusLove

## Vue d'ensemble

Deux approches d'intégration Monetbil ont été implémentées pour CampusLove, basées sur les fichiers de référence GitHub.

## Approches Disponibles

### 1. Standard (CampusLoveAccess)
**Fichier**: `/resources/js/components/CampusLoveAccess.jsx`
**Endpoint**: `/api/v1/payment/campus-love`

**Caractéristiques**:
- Méthodes de paiement multiples (SMS direct + Widget web)
- Vérification automatique du statut toutes les 10 secondes
- Interface utilisateur moderne avec sélection de méthode
- Gestion avancée des erreurs et timeouts

### 2. GitHub Style (CampusLoveAccessGitHub)
**Fichier**: `/resources/js/components/CampusLoveAccessGitHub.jsx`
**Endpoint**: `/api/v1/payment/campus-love-github`

**Caractéristiques**:
- Basé sur les fichiers de référence : `initier_paiement.php` et `register.php`
- URL de paiement construite selon l'approche GitHub
- Redirection directe vers le widget Monetbil v2.1
- Vérification du statut toutes les 15 secondes

## Implémentation Backend

### MonetbilService

#### Nouvelle méthode GitHub Style
```php
public function initiateCampusLovePayment($params)
{
    // Génère item_ref et payment_ref selon l'approche GitHub
    $item_ref = time() . '_' . rand(1000, 9999);
    $payment_ref = 'CL_' . $item_ref;
    
    // Construit l'URL selon l'approche des fichiers de référence
    $paymentUrl = $this->buildGitHubStylePaymentUrl($params);
}
```

#### URL de paiement GitHub Style
```php
private function buildGitHubStylePaymentUrl($params)
{
    $queryString = http_build_query($params);
    return "https://www.monetbil.com/widget/v2.1/{$this->serviceKey}?" . $queryString;
}
```

### PaymentController

#### Endpoint GitHub Style
- **Route**: `POST /api/v1/payment/campus-love-github`
- **Méthode**: `initiateCampusLovePaymentGitHub()`
- **Validation**: Téléphone et email requis
- **Réponse**: URL de paiement directe

## Interface Utilisateur

### Page CampusLove
Deux boutons d'accès disponibles :
- **💳 Débloquer CampusLove (Standard)** : Approche complète avec options multiples
- **🔧 Style GitHub (Référence)** : Implémentation basée sur les fichiers de référence

### Composants Modaux

#### CampusLoveAccess (Standard)
- Sélection méthode de paiement (SMS direct vs Widget web)
- Vérification automatique et manuelle
- Interface moderne avec feedback en temps réel

#### CampusLoveAccessGitHub (Référence)
- Interface simplifiée selon l'approche GitHub
- Redirection directe vers Monetbil
- Badge "GitHub Style" pour identification

## Configuration

### Variables d'environnement requises
```env
MONETBIL_SERVICE_KEY=votre_service_key
MONETBIL_SERVICE_SECRET=votre_service_secret
```

### Routes API
```php
// routes/api.php
Route::post('/payment/campus-love', [PaymentController::class, 'initiateCampusLovePayment']);
Route::post('/payment/campus-love-github', [PaymentController::class, 'initiateCampusLovePaymentGitHub']);
Route::get('/payment/{paymentId}/status', [PaymentController::class, 'checkPaymentStatus']);
```

## Flux de Paiement

### Standard
1. Utilisateur sélectionne la méthode (SMS direct ou Widget)
2. Système initie le paiement selon la méthode choisie
3. Vérification automatique du statut toutes les 10-15 secondes
4. Activation automatique de l'accès après paiement validé

### GitHub Style
1. Utilisateur saisit téléphone et email
2. Système génère l'URL de paiement selon l'approche GitHub
3. Redirection vers le widget Monetbil v2.1
4. Vérification du statut toutes les 15 secondes
5. Activation automatique de l'accès

## Gestion des Erreurs

### Messages d'Information
- ✅ SMS envoyé (pour transactions directes)
- 💻 Page ouverte (pour redirections widget)
- ⏰ Délai expiré (après 5 minutes)

### Messages d'Erreur
- ❌ Paiement échoué
- 🚫 Numéro invalide
- ⚠️ Données manquantes

## Tests et Validation

### Vérification Build
```bash
npm run build
```

### Endpoints à tester
1. `POST /api/v1/payment/campus-love-github`
2. `GET /api/v1/payment/{id}/status`
3. `GET /api/v1/campus-love/check-access`

## Références

- **Fichiers GitHub**: 
  - [initier_paiement.php](https://github.com/eliote-geeks/campusVente/blob/master/initier_paiement.php)
  - [register.php](https://github.com/eliote-geeks/campusVente/blob/master/register.php)
- **Documentation Monetbil**: [GitHub Monetbil PHP](https://github.com/Monetbil/monetbil-php)

## Notes Importantes

1. Les deux approches sont fonctionnelles et interopérables
2. L'approche GitHub Style suit exactement les fichiers de référence
3. L'approche Standard offre plus de fonctionnalités et d'options
4. Les deux utilisent la même base de données et le même système de vérification