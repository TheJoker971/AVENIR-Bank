# API Prisma - AVENIR Bank

Cette API utilise Prisma ORM pour l'accès à la base de données PostgreSQL. Parfait pour la production.

## Prérequis

- Node.js (v18+)
- PostgreSQL
- Variables d'environnement configurées

## Installation

```bash
cd infrastructure/prisma-api
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/avenir_bank?schema=public"
```

## Migration de la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer et appliquer les migrations
npm run prisma:migrate

# Ouvrir Prisma Studio (interface graphique)
npm run prisma:studio
```

## Démarrage

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

L'API sera accessible sur `http://localhost:3001`

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

L'API utilise :
- **Prisma ORM** : Accès type-safe à la base de données
- **Express** : Framework web
- **TypeScript** : Typage statique
- **Clean Architecture** : Séparation des préoccupations

## Schéma de base de données

Le schéma Prisma est défini dans `prisma/schema.prisma`. Pour le modifier :

1. Modifiez `prisma/schema.prisma`
2. Exécutez `npm run prisma:migrate` pour créer une migration
3. Le client Prisma sera automatiquement régénéré
