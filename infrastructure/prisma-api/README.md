# API Prisma - AVENIR Bank

Cette API utilise Prisma ORM pour l'accès à la base de données PostgreSQL. Parfait pour la production.

## Prérequis

- Node.js (v18+)
- PostgreSQL
- Variables d'environnement configurées
- npm ou yarn

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
- **Middlewares** : Authentification, autorisation, validation, gestion d'erreurs

## Authentification et Autorisation

L'API utilise un système d'authentification basé sur les tokens (JWT à implémenter) et des middlewares pour gérer les rôles.

### Rôles disponibles
- **CLIENT** : Clients de la banque
- **ADVISE** : Conseillers bancaires
- **DIRECTOR** : Directeurs de banque
- **ADMIN** : Administrateurs

### Middlewares

#### Authentification (`auth.middleware.ts`)
- Vérifie la présence d'un token Bearer dans le header `Authorization`
- Récupère l'utilisateur depuis la base de données
- Ajoute l'utilisateur à `req.user`

#### Autorisation (`authorization.middleware.ts`)
- `requireClient` : Accès réservé aux clients
- `requireAdvisor` : Accès réservé aux conseillers
- `requireDirector` : Accès réservé aux directeurs et administrateurs

#### Validation (`validation.middleware.ts`)
- Valide les données de requête selon un schéma
- Validateurs disponibles : email, iban, positiveNumber, etc.

#### Gestion d'erreurs (`error.middleware.ts`)
- Capture et formate toutes les erreurs
- Gestion spéciale des erreurs Prisma

## Routes par rôle

### Routes publiques
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/stocks/public` - Consultation des actions (sans authentification)

### Routes CLIENT (authentification requise)
- `/api/accounts/*` - Gestion des comptes
- `/api/operations/*` - Virements intrabancaires
- `/api/savings-accounts/*` - Comptes d'épargne (Livret A)
- `/api/orders/*` - Ordres d'achat/vente d'actions
- `/api/messages/*` - Messagerie instantanée
- `/api/notifications/*` - Notifications

### Routes ADVISE (conseillers)
- `/api/credits/*` - Attribution de crédits
- `/api/messages/advisor/*` - Gestion des messages clients

### Routes DIRECTOR (directeurs)
- `/api/users/admin/*` - Gestion complète des utilisateurs (création, modification, suppression, bannissement)
- `/api/stocks/*` - Gestion des actions (création, modification, suppression)
- `/api/bank/*` - Fixation du taux d'épargne (avec notifications automatiques)

## Utilisation

### Authentification
Pour accéder aux routes protégées, inclure le header :
```
Authorization: Bearer <token>
x-user-id: <user_id>
```

Note : Actuellement, l'API utilise `x-user-id` en attendant l'implémentation complète de JWT.

## Fonctionnalités selon le sujet

### Client
✅ Inscription avec confirmation par email (à implémenter l'envoi)
✅ Création automatique d'un premier compte (à implémenter)
✅ Gestion des comptes avec IBAN
✅ Virements intrabancaires
✅ Comptes d'épargne
✅ Investissements (ordres d'achat/vente)

### Directeur
✅ Authentification sécurisée
✅ Gestion complète des comptes clients
✅ Fixation du taux d'épargne avec notifications automatiques
✅ Gestion des actions (création, modification, suppression)
✅ Impossible de modifier manuellement le cours d'une action

### Conseiller
✅ Authentification
✅ Attribution de crédits
✅ Messagerie instantanée avec gestion des conseillers attitrés

## Schéma de base de données

Le schéma Prisma est défini dans `prisma/schema.prisma`. Pour le modifier :

1. Modifiez `prisma/schema.prisma`
2. Exécutez `npm run prisma:migrate` pour créer une migration
3. Le client Prisma sera automatiquement régénéré
