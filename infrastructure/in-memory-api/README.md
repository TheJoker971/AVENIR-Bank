# API In-Memory - AVENIR Bank

Cette API utilise les repositories in-memory pour le stockage des données. Parfait pour le développement, les tests et les démonstrations.

## Installation

```bash
cd infrastructure/in-memory-api
npm install
```

## Démarrage

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

L'API sera accessible sur `http://localhost:3000`

## Initialisation des données

Pour peupler l'API avec des données de démonstration, vous pouvez utiliser l'endpoint de seeding :

```bash
curl -X POST http://localhost:3000/api/seed
```

Ou utiliser directement le script de seeding :

```bash
npm run seed
```

## Tests

Pour tester les endpoints de l'API, exécutez :

```bash
npm run test-api
```

## Authentification

L'API utilise une authentification basée sur des headers HTTP. Pour accéder aux endpoints protégés, vous devez inclure les headers suivants :

- `X-User-Id` : L'identifiant de l'utilisateur authentifié (requis)
- `X-User-Role` : Le rôle de l'utilisateur (CLIENT, ADVISE, DIRECTOR, ADMIN) (requis pour certains endpoints)

### Exemple d'utilisation

```bash
# Lister les messages de l'utilisateur ID 1 (CLIENT)
curl -H "X-User-Id: 1" -H "X-User-Role: CLIENT" http://localhost:3000/api/messages

# Créer un message en tant qu'utilisateur ID 1
curl -X POST \
  -H "X-User-Id: 1" \
  -H "X-User-Role: CLIENT" \
  -H "Content-Type: application/json" \
  -d '{"receiverId": 3, "message": "Bonjour conseiller !"}' \
  http://localhost:3000/api/messages

# Lister les comptes de l'utilisateur ID 1
curl -H "X-User-Id: 1" http://localhost:3000/api/accounts

# Modifier le taux d'intérêt en tant que directeur
curl -X PUT \
  -H "X-User-Id: 4" \
  -H "X-User-Role: DIRECTOR" \
  -H "Content-Type: application/json" \
  -d '{"newRate": 3.5}' \
  http://localhost:3000/api/bank/interest-rate
```

## Sécurité des endpoints

### Messages (`/api/messages`)
- ✅ Authentification requise pour tous les endpoints
- ✅ Les utilisateurs ne voient que leurs propres messages (envoyés ou reçus)
- ✅ Seuls CLIENT et ADVISE peuvent créer des messages
- ✅ Seuls le destinataire et l'expéditeur peuvent lire/supprimer un message

### Comptes (`/api/accounts`)
- ✅ Authentification requise pour tous les endpoints
- ✅ Les utilisateurs ne voient que leurs propres comptes
- ✅ Un CLIENT ne peut créer des comptes que pour lui-même
- ✅ Les ADVISE et DIRECTOR peuvent créer des comptes pour d'autres utilisateurs
- ✅ Seul le propriétaire peut supprimer un compte

### Notifications (`/api/notifications`)
- ✅ Authentification requise pour tous les endpoints
- ✅ Les utilisateurs ne voient que leurs propres notifications
- ✅ Seul le destinataire peut lire une notification

### Banque (`/api/bank`)
- ✅ GET `/api/bank` : Public, accessible sans authentification
- ✅ PUT `/api/bank/interest-rate` : Seul le DIRECTEUR peut modifier le taux d'intérêt
- ✅ Modification automatique du taux de tous les livrets A
- ✅ Notifications automatiques envoyées aux clients concernés

## Endpoints disponibles

### Comptes (`/api/accounts`)
- `GET /api/accounts` - Liste tous les comptes
- `GET /api/accounts/:id` - Récupère un compte par ID
- `GET /api/accounts/by-iban/:iban` - Récupère un compte par IBAN
- `GET /api/accounts/by-owner/:ownerId` - Récupère les comptes d'un propriétaire
- `POST /api/accounts` - Crée un nouveau compte
- `DELETE /api/accounts/:id` - Supprime un compte

### Utilisateurs (`/api/users`)
- `GET /api/users` - Liste tous les utilisateurs
- `GET /api/users/:id` - Récupère un utilisateur par ID
- `GET /api/users/by-email/:email` - Récupère un utilisateur par email
- `GET /api/users/by-role/:role` - Récupère les utilisateurs par rôle

### Opérations (`/api/operations`)
- `GET /api/operations` - Liste toutes les opérations
- `GET /api/operations/:id` - Récupère une opération par ID
- `GET /api/operations/by-account/:iban` - Récupère les opérations d'un compte
- `POST /api/operations/transfer` - Crée un nouveau virement
- `POST /api/operations/:id/execute` - Exécute une opération en attente

### Autres endpoints
- `GET /api/savings-accounts` - Comptes d'épargne
- `GET /api/stocks` - Actions disponibles
- `GET /api/orders` - Ordres d'achat/vente
- `GET /api/credits` - Crédits
- `GET /api/messages` - Messages
- `GET /api/notifications` - Notifications
- `GET /api/bank` - Informations bancaires
- `PUT /api/bank/interest-rate` - Met à jour le taux d'intérêt (DIRECTOR uniquement)

## Architecture

L'API utilise la Clean Architecture avec:
- **Controllers** : Gèrent les requêtes HTTP et appellent les use cases
- **Middlewares** : Gèrent l'authentification et l'autorisation
- **Use Cases** : Contiennent la logique métier
- **Repositories In-Memory** : Stockage temporaire en mémoire
