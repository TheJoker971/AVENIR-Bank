# 🏦 AVENIR Bank - Front-end Next.js

Front-end de l'application bancaire AVENIR Bank, développé avec **Next.js 14** et **TypeScript**, en respectant les principes de la **Clean Architecture**.

## 📁 Structure du Projet

```
nextjs-frontend/
├── app/                    # Next.js App Router (pages et layouts)
├── src/
│   ├── domain/            # Couche Domaine
│   │   ├── entities/      # Entités métier (User, Account, etc.)
│   │   └── values/        # Value Objects (Amount, etc.)
│   ├── application/       # Couche Application
│   │   └── services/      # Interfaces de services (AuthService, AccountService, etc.)
│   ├── infrastructure/    # Couche Infrastructure
│   │   └── api/          # Adaptateurs API (ApiClient, AuthApiAdapter, etc.)
│   ├── presentation/     # Couche Présentation
│   │   ├── components/   # Composants React réutilisables
│   │   └── hooks/        # Hooks React personnalisés
│   └── shared/           # Couche Partagée
│       └── utils/         # Utilitaires partagés
├── public/               # Fichiers statiques
└── ...config files
```

## 🏗️ Architecture Clean

### **Domain Layer** (`src/domain`)
- **Entités** : Représentations des objets métier (User, Account, Stock, etc.)
- **Value Objects** : Objets de valeur immutables (Amount)

### **Application Layer** (`src/application`)
- **Services Interfaces** : Définitions des contrats de services
- Contient la logique métier applicative

### **Infrastructure Layer** (`src/infrastructure`)
- **Adaptateurs API** : Implémentations concrètes des services
- **ApiClient** : Client HTTP configuré avec Axios
- Gestion de l'authentification et des tokens

### **Presentation Layer** (`src/presentation`)
- **Composants React** : Composants UI réutilisables
- **Hooks** : Hooks personnalisés pour gérer l'état
- **Pages Next.js** : Dans le dossier `app/`

## 🚀 Installation

```bash
cd infrastructure/nextjs-frontend
npm install
```

## 🛠️ Développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run start` - Lance le serveur de production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run type-check` - Vérifie les types TypeScript

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### API Backend

Assurez-vous que l'API backend est démarrée et accessible à l'URL configurée.

## 📋 Fonctionnalités

### ✅ Implémentées
- Structure Clean Architecture complète
- Authentification (login/register)
- Routing avec Next.js App Router
- Gestion d'état avec hooks personnalisés
- Client API configuré
- Interfaces de services définies

### 🚧 À développer
- Pages de gestion des comptes
- Interface d'épargne (Livret A)
- Interface d'investissements (Actions)
- Messagerie instantanée
- Dashboard selon les rôles (Client, Conseiller, Directeur)
- Gestion des crédits (pour conseillers)
- Administration (pour directeurs)

## 🎨 Technologies

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP
- **Zod** - Validation de schémas (à venir)

## 🏛️ Principes Respectés

- ✅ **Clean Architecture** : Séparation claire des couches
- ✅ **Dependency Inversion** : Les couches supérieures dépendent des abstractions
- ✅ **Single Responsibility** : Chaque module a une responsabilité unique
- ✅ **TypeScript strict** : Typage fort pour la sécurité

## 📝 Notes

- Les adaptateurs API implémentent les interfaces de services
- Les hooks utilisent les services via les interfaces
- Les composants utilisent les hooks pour interagir avec l'application
- Tous les appels API passent par `ApiClient` qui gère l'authentification

