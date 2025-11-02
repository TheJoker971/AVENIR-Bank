# 🗄️ Repositories SQL - AVENIR Bank

## 📋 Vue d'ensemble

Cette couche contient les implémentations SQL des repositories pour la production, utilisant **TypeORM** comme ORM.

## 🏗️ Structure

```
sql/
├── entities/          # Entités TypeORM (schémas de base de données)
├── mappers/           # Mappers entre entités SQL et entités du domaine
├── repositories/      # Implémentations SQL des repositories
├── config/            # Configuration TypeORM (DataSource)
└── migrations/        # Migrations de base de données (à créer)
```

## 📦 Entités SQL

Toutes les entités TypeORM sont définies dans `entities/` :
- `UserEntitySQL`
- `AccountEntitySQL` & `SavingsAccountEntitySQL`
- `BankEntitySQL`
- `OperationEntitySQL`
- `StockEntitySQL`
- `OrderEntitySQL`
- `CreditEntitySQL`
- `MessageEntitySQL`
- `NotificationEntitySQL`

## 🔄 Mappers

Les mappers convertissent entre les entités SQL (TypeORM) et les entités du domaine :
- `UserMapper`
- `AccountMapper` & `SavingsAccountMapper`
- `OperationMapper`
- `StockMapper`
- `OrderMapper`
- `CreditMapper`
- `MessageMapper`
- `NotificationMapper`

## 🗄️ Repositories

Tous les repositories implémentent les interfaces définies dans `application/repositories/` :
- `UserRepositorySQL`
- `AccountRepositorySQL` & `SavingsAccountRepositorySQL`
- `BankRepositorySQL`
- `OperationRepositorySQL`
- `StockRepositorySQL`
- `OrderRepositorySQL`
- `CreditRepositorySQL`
- `MessageRepositorySQL`
- `NotificationRepositorySQL`

## ⚙️ Configuration

### Variables d'environnement

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=avenir_bank
NODE_ENV=development
```

### Initialisation

```typescript
import { AppDataSource } from "infrastructure/repositories/sql/config/DataSource";

// Initialiser la connexion
await AppDataSource.initialize();

// Utiliser les repositories
const userRepository = new UserRepositorySQL(AppDataSource);
```

## 🚀 Utilisation

### Exemple avec UserRepository

```typescript
import { AppDataSource } from "infrastructure/repositories/sql/config/DataSource";
import { UserRepositorySQL } from "infrastructure/repositories/sql/repositories/UserRepositorySQL";

// Initialiser
await AppDataSource.initialize();

// Créer le repository
const userRepo = new UserRepositorySQL(AppDataSource);

// Utiliser
const user = await userRepo.findByEmail("client@example.com");
```

### Injection de dépendances

Les repositories prennent un `DataSource` en paramètre, ce qui permet de :
- Faciliter les tests (mock du DataSource)
- Changer facilement de base de données
- Gérer les transactions

## 📝 Notes importantes

1. **Synchronize** : `synchronize: true` est uniquement pour le développement. **JAMAIS en production !**
2. **Migrations** : Utiliser les migrations TypeORM pour gérer les changements de schéma.
3. **Transactions** : TypeORM gère les transactions via `DataSource.transaction()`.
4. **Pool de connexions** : Configurer selon les besoins de production.

## 🔧 Prochaines étapes

1. Créer les migrations initiales
2. Configurer les connexions pool
3. Ajouter les index pour les performances
4. Implémenter les stratégies de cache si nécessaire

---

*Repositories SQL créés selon les principes de Clean Architecture* ✅

