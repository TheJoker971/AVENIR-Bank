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

## Architecture

L'API utilise la Clean Architecture avec:
- **Controllers** : Gèrent les requêtes HTTP et appellent les use cases
- **Use Cases** : Contiennent la logique métier
- **Repositories In-Memory** : Stockage temporaire en mémoire
