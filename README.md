# �� AVENIR Bank

**Alliance de Valeurs Économiques et Nationales Investies Responsablement**

Application web bancaire moderne développée avec TypeScript et Clean Architecture, permettant aux clients de gérer leurs liquidités, épargne et investissements.

---

## 📋 Table des matières

- [Description](#-description)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Structure du projet](#-structure-du-projet)
- [Démarrage rapide](#-démarrage-rapide)
- [Documentation](#-documentation)
- [Contributeurs](#-contributeurs)

---

## 🎯 Description

AVENIR Bank est une application bancaire complète qui propose une alternative innovante aux banques traditionnelles grâce à une gestion fluide, transparente et automatisée des opérations bancaires.

### Objectifs principaux

- ✅ Gestion des comptes bancaires avec génération d'IBAN uniques
- ✅ Système d'épargne (Livret A) avec calcul d'intérêts quotidiens
- ✅ Plateforme d'investissement en actions avec carnet d'ordres
- ✅ Gestion de crédits avec calcul de mensualités constantes
- ✅ Messagerie instantanée entre clients et conseillers
- ✅ Administration complète pour directeurs et conseillers

---

## 🏗️ Architecture

Le projet suit les principes de **Clean Architecture** et **Domain-Driven Design (DDD)** :

### Couches de l'architecture

```
┌─────────────────────────────────────┐
│   Presentation Layer (Next.js)      │
├─────────────────────────────────────┤
│   Application Layer (Use Cases)     │
├─────────────────────────────────────┤
│   Domain Layer (Entities & Values)  │
├─────────────────────────────────────┤
│   Infrastructure (Repos & APIs)     │
└─────────────────────────────────────┘
```

### Principes respectés

- ✅ **Clean Architecture** : Séparation claire des responsabilités
- ✅ **DDD** : Domain-Driven Design avec entités et objets de valeur
- ✅ **SOLID** : Application des principes SOLID
- ✅ **Type Safety** : TypeScript sur l'ensemble du stack
- ✅ **Dependency Inversion** : Dépendances sur les abstractions

---

## 🛠️ Technologies

### Backend
- **TypeScript** - Langage principal
- **Node.js** - Runtime
- **Express** - Framework web (API in-memory)
- **Prisma** - ORM pour PostgreSQL (API Prisma)
- **PostgreSQL** - Base de données (production)

### Frontend
- **Next.js** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling

### Architecture & Qualité
- **Clean Architecture** - Organisation du code
- **Domain-Driven Design** - Modélisation métier
- **SOLID Principles** - Bonnes pratiques

---

## ✨ Fonctionnalités

### 👤 Client
- **Authentification** : Inscription avec confirmation par e-mail, création automatique d'un premier compte
- **Comptes** : Création de plusieurs comptes avec IBAN unique et valide
- **Virements** : Transferts intrabancaires entre comptes
- **Épargne** : Ouverture de livrets A rémunérés avec intérêts quotidiens
- **Investissements** : Ordres d'achat/vente d'actions avec frais fixes de 1€
- **Messagerie** : Communication avec les conseillers bancaires

### 👔 Directeur de banque
- **Gestion des clients** : Création, modification, suppression, bannissement
- **Taux d'épargne** : Modification du taux avec notifications automatiques
- **Gestion des actions** : Création, modification et suppression des actions disponibles

### 🧑‍💼 Conseiller bancaire
- **Crédits** : Attribution de crédits avec taux annuel, assurance et mensualités constantes
- **Messagerie** : Réponse aux messages clients, assignation de discussions
- **Gestion** : Transfert de discussions à d'autres conseillers

---

## 📦 Installation

### Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- PostgreSQL (pour l'API Prisma)
- Git

### Clonage du projet

```bash
git clone https://github.com/TheJoker971/AVENIR-Bank.git
cd AVENIR-Bank
```

### Installation des dépendances

#### Installation globale (scripts principaux)

```bash
npm install
```

#### API In-Memory

```bash
cd infrastructure/in-memory-api
npm install
```

#### API Prisma

```bash
cd infrastructure/prisma-api
npm install
```

Créez un fichier `.env` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/avenir_bank?schema=public"
```

Puis initialisez la base de données :

```bash
npm run prisma:generate
npm run prisma:migrate
```

#### Frontend Next.js

```bash
cd infrastructure/nextjs-frontend
npm install
```

---

## 📁 Structure du projet

```
AVENIR-Bank/
├── domain/                    # Couche domaine (entités, valeurs, erreurs)
│   ├── entities/             # Entités métier
│   ├── values/               # Objets de valeur
│   └── errors/               # Erreurs personnalisées
│
├── application/              # Couche application (cas d'usage)
│   ├── use-cases/           # Cas d'usage métier
│   │   ├── account/         # Gestion des comptes
│   │   ├── admin/           # Administration
│   │   ├── beneficiary/     # Bénéficiaires
│   │   ├── credit/          # Crédits
│   │   ├── investment/      # Investissements
│   │   ├── messaging/       # Messagerie
│   │   ├── operation/       # Opérations
│   │   └── savings/         # Épargne
│   └── repositories/        # Interfaces de repositories
│
├── infrastructure/           # Couche infrastructure
│   ├── in-memory-api/       # API Express avec données en mémoire
│   ├── prisma-api/          # API Express avec Prisma/PostgreSQL
│   ├── nextjs-frontend/     # Interface utilisateur Next.js
│   └── repositories/        # Implémentations des repositories
│       ├── in-memory/       # Repositories in-memory (tests)
│       └── sql/             # Repositories SQL (production)
│
└── scripts/                  # Scripts utilitaires
```

---

## 🚀 Démarrage rapide

### Option 1 : Démarrage complet (API + Frontend)

```bash
npm run dev
```

Cette commande démarre :
- L'API in-memory sur `http://localhost:3000`
- Le frontend Next.js sur `http://localhost:3001`
- Initialise les données de seed automatiquement

### Option 2 : Démarrage séparé

#### API In-Memory seule

```bash
npm run api:in-memory
# API disponible sur http://localhost:3000
```

#### API Prisma seule

```bash
npm run api:prisma
# API disponible sur http://localhost:3001
```

#### Frontend seul

```bash
npm run frontend
# Frontend disponible sur http://localhost:3002
```

---

## 📚 Documentation

### Documentation détaillée

- **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)** - Résumé de l'architecture
- **[PROJECT_COMPLETION_GUIDE.md](./PROJECT_COMPLETION_GUIDE.md)** - Guide de complétion
- **[GIT_BRANCHING_STRATEGY.md](./GIT_BRANCHING_STRATEGY.md)** - Stratégie de branches Git
- **[INFRASTRUCTURE_REPOSITORIES_SUMMARY.md](./INFRASTRUCTURE_REPOSITORIES_SUMMARY.md)** - Résumé des repositories
- **[Sujet.md](./Sujet.md)** - Spécifications complètes du projet

### API Documentation

#### API In-Memory

Voir le fichier `infrastructure/in-memory-api/README.md`

#### API Prisma

Voir le fichier `infrastructure/prisma-api/README.md`

Les endpoints sont documentés avec :
- Routes disponibles par rôle
- Formats de requête/réponse
- Exemples d'utilisation

---

## 🔧 Scripts disponibles

### Scripts principaux (racine)

```bash
npm run dev                  # Démarre API + Frontend
npm run api:in-memory        # Démarre uniquement l'API in-memory
npm run api:prisma           # Démarre uniquement l'API Prisma
npm run frontend             # Démarre uniquement le frontend
```

### Scripts de build

```bash
npm run api:in-memory:build  # Installe les dépendances de l'API in-memory
npm run api:prisma:build     # Installe les dépendances de l'API Prisma
npm run frontend:build       # Installe les dépendances du frontend
```

---

## 🧪 Tests

Les tests sont à implémenter dans la branche `feature/testing`.

**Technologies prévues :**
- Jest ou Vitest
- Tests unitaires (Domain, Application)
- Tests d'intégration (API)
- Tests E2E (Frontend)

---

## 🐳 Docker (À venir)

Le projet prévoit une containerisation avec Docker pour :
- API Backend
- Base de données PostgreSQL
- Frontend Next.js
- Environnement de développement complet

---

## 📈 Prochaines étapes

- ✅ Architecture Clean complète
- ✅ Repositories in-memory
- ✅ API Express (in-memory et Prisma)
- ✅ Frontend Next.js
- 🔄 Tests unitaires et d'intégration
- 🔄 Docker & Docker Compose
- 🔄 Event Sourcing (Bonus)
- 🔄 CQRS (Bonus)

---

## 👥 Contributeurs

- **Jsegor** - Développeur principal

---

## 📄 Licence

ISC

---

## 🔗 Liens utiles

- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Développé avec ❤️ en TypeScript suivant les principes de Clean Architecture**