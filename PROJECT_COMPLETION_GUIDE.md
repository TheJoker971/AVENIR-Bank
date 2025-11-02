# 🏦 AVENIR Bank - Guide de Complétion du Projet

## ✅ Ce qui a été fait (Branch: feature/infrastructure-layer)

### Infrastructure Layer - Repositories In-Memory
Tous les repositories in-memory ont été créés dans `infrastructure/repositories/in-memory/`:
- ✅ UserRepositoryInMemory
- ✅ AccountRepositoryInMemory & SavingsAccountRepositoryInMemory
- ✅ BankRepositoryInMemory
- ✅ OperationRepositoryInMemory
- ✅ StockRepositoryInMemory
- ✅ OrderRepositoryInMemory
- ✅ CreditRepositoryInMemory
- ✅ MessageRepositoryInMemory
- ✅ NotificationRepositoryInMemory
- ✅ index.ts pour les exports

**Note:** Pour commiter ces fichiers, utilisez:
```bash
git add infrastructure/repositories/in-memory/
git commit -m "feat(infrastructure): implémenter tous les repositories in-memory pour les tests"
```

---

## 📋 Tâches Restantes par Branche

### 🌿 Branch: feature/infrastructure-layer (CONTINUE ICI)

#### 1. Implémenter les repositories SQL/NoSQL
**Répertoire:** `infrastructure/repositories/sql/` ou `infrastructure/repositories/mongodb/`

**Commits à faire:**
- `feat(infrastructure): ajouter configuration SQL (PostgreSQL/MySQL)`
- `feat(infrastructure): implémenter UserRepositorySQL`
- `feat(infrastructure): implémenter AccountRepositorySQL`
- `feat(infrastructure): implémenter tous les repositories SQL restants`
- `feat(infrastructure): ajouter migrations de base de données`

**Dépendances à installer:**
```bash
npm install pg mysql2 typeorm @nestjs/typeorm # Pour SQL
# OU
npm install mongodb mongoose @nestjs/mongoose # Pour MongoDB
```

#### 2. Créer les adapters pour les frameworks
**Répertoires:** `infrastructure/adapters/express/` et `infrastructure/adapters/nestjs/`

**Fichiers à créer:**
- Configuration Express avec routes
- Configuration NestJS avec modules
- Injection de dépendances pour les repositories

**Commits:**
- `feat(infrastructure): créer adapter Express avec configuration de base`
- `feat(infrastructure): créer adapter NestJS avec modules`

---

### 🌿 Branch: feature/api-layer

**Basculer sur cette branche:**
```bash
git checkout feature/api-layer
# ou créer si elle n'existe pas:
git checkout -b feature/api-layer
```

#### 1. Authentification JWT
**Répertoire:** `infrastructure/api/auth/`

**Fichiers à créer:**
- `AuthService.ts` - Service d'authentification
- `JwtStrategy.ts` - Stratégie JWT
- `AuthMiddleware.ts` - Middleware d'authentification
- `RoleGuard.ts` - Guard pour les rôles (CLIENT, ADVISE, DIRECTOR)

**Dépendances:**
```bash
npm install jsonwebtoken bcryptjs passport passport-jwt
npm install -D @types/jsonwebtoken @types/bcryptjs @types/passport-jwt
```

**Commits:**
- `feat(api): implémenter l'authentification JWT avec Passport`
- `feat(api): ajouter middleware d'authentification et guards de rôles`

#### 2. DTOs (Data Transfer Objects)
**Répertoire:** `infrastructure/api/dto/`

**DTOs à créer pour chaque module:**
- `auth/` - LoginDto, RegisterDto
- `account/` - CreateAccountDto, UpdateAccountDto
- `operation/` - CreateTransferDto
- `savings/` - CreateSavingsAccountDto
- `investment/` - CreateOrderDto
- `credit/` - CreateCreditDto
- `message/` - SendMessageDto
- `notification/` - NotificationDto

**Commits:**
- `feat(api): créer DTOs pour l'authentification`
- `feat(api): créer DTOs pour les comptes et opérations`
- `feat(api): créer DTOs pour épargne, investissements et crédits`
- `feat(api): créer DTOs pour messagerie et notifications`

#### 3. Controllers REST
**Répertoire:** `infrastructure/api/controllers/`

**Controllers à créer:**
- `AuthController.ts` - POST /auth/login, POST /auth/register
- `AccountController.ts` - CRUD comptes
- `OperationController.ts` - Virements
- `SavingsController.ts` - Livrets A
- `InvestmentController.ts` - Actions et ordres
- `CreditController.ts` - Crédits (conseiller seulement)
- `MessageController.ts` - Messagerie
- `NotificationController.ts` - Notifications
- `AdminController.ts` - Administration (directeur seulement)

**Commits:**
- `feat(api): créer AuthController avec login et register`
- `feat(api): créer AccountController avec CRUD complet`
- `feat(api): créer OperationController pour les virements`
- `feat(api): créer SavingsController pour les livrets A`
- `feat(api): créer InvestmentController pour actions et ordres`
- `feat(api): créer CreditController pour les conseillers`
- `feat(api): créer MessageController pour la messagerie`
- `feat(api): créer NotificationController`
- `feat(api): créer AdminController pour les directeurs`

#### 4. Validation et Gestion d'erreurs
**Répertoire:** `infrastructure/api/middleware/`

**Fichiers:**
- `ValidationMiddleware.ts` - Validation des DTOs (class-validator)
- `ErrorHandlerMiddleware.ts` - Gestion centralisée des erreurs
- `RequestLoggerMiddleware.ts` - Logging des requêtes

**Dépendances:**
```bash
npm install class-validator class-transformer express-validator
```

**Commits:**
- `feat(api): ajouter validation des DTOs avec class-validator`
- `feat(api): implémenter gestion centralisée des erreurs`

#### 5. Documentation Swagger
**Dépendances:**
```bash
npm install swagger-ui-express swagger-jsdoc
npm install -D @types/swagger-ui-express @types/swagger-jsdoc
```

**Commits:**
- `feat(api): ajouter documentation Swagger/OpenAPI`

---

### 🌿 Branch: feature/frontend

**Basculer:**
```bash
git checkout feature/frontend
```

**Choisir un framework:**
- React (recommandé pour commencer)
- Angular
- Solid.js

**Structure à créer:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── accounts/
│   │   ├── operations/
│   │   ├── savings/
│   │   ├── investments/
│   │   ├── credits/
│   │   ├── messages/
│   │   └── notifications/
│   ├── services/
│   │   ├── api/
│   │   └── auth/
│   ├── store/ (ou contexts pour React)
│   └── utils/
```

**Commits:**
- `feat(frontend): initialiser projet React/Angular/Solid`
- `feat(frontend): implémenter authentification avec JWT`
- `feat(frontend): créer composants de gestion des comptes`
- `feat(frontend): créer interface de virements`
- `feat(frontend): créer interface d'épargne`
- `feat(frontend): créer interface d'investissements`
- `feat(frontend): créer interface de crédits (conseiller)`
- `feat(frontend): créer interface de messagerie`
- `feat(frontend): créer interface d'administration (directeur)`

---

### 🌿 Branch: feature/testing

**Basculer:**
```bash
git checkout feature/testing
```

**Tests à créer:**
- Tests unitaires pour les entités (domain)
- Tests unitaires pour les use cases (application)
- Tests unitaires pour les repositories (infrastructure)
- Tests d'intégration pour l'API
- Tests E2E pour le frontend

**Dépendances:**
```bash
npm install -D jest @types/jest ts-jest supertest
# ou
npm install -D vitest @vitest/ui
```

**Commits:**
- `test(domain): ajouter tests unitaires pour les entités`
- `test(application): ajouter tests pour les use cases`
- `test(infrastructure): ajouter tests pour les repositories`
- `test(api): ajouter tests d'intégration pour les controllers`
- `test(e2e): ajouter tests end-to-end`

---

### 🌿 Branch: docker-setup (ou directement dans main)

**Fichiers à créer:**
- `Dockerfile` - Image Docker pour l'API
- `docker-compose.yml` - Orchestration (API + DB + Frontend)
- `.dockerignore`

**Commits:**
- `feat(devops): ajouter Dockerfile pour l'API`
- `feat(devops): ajouter docker-compose pour l'environnement de développement`

---

## 🚀 Ordre Recommandé d'Implémentation

1. ✅ **Infrastructure Layer** - Repositories in-memory (FAIT)
2. **Infrastructure Layer** - Repositories SQL/NoSQL
3. **API Layer** - Authentification JWT
4. **API Layer** - DTOs et Validation
5. **API Layer** - Controllers
6. **API Layer** - Documentation Swagger
7. **Frontend** - Setup et Authentification
8. **Frontend** - Composants métier
9. **Testing** - Tests unitaires et d'intégration
10. **Docker** - Containerisation

---

## 📝 Commandes Git Utiles

```bash
# Créer une nouvelle branche depuis main/feature/error-classes
git checkout -b feature/nouvelle-branche

# Ajouter tous les fichiers d'un répertoire
git add infrastructure/repositories/in-memory/
git commit -m "feat(infrastructure): message descriptif"

# Voir l'historique des commits
git log --oneline

# Push vers le remote
git push origin feature/nom-branche
```

---

## ⚠️ Notes Importantes

- Faire **un commit par fonctionnalité** comme demandé
- Chaque commit doit avoir un message clair et descriptif
- Utiliser le format: `feat(module): description` ou `fix(module): description`
- Tester chaque fonctionnalité avant de commiter
- Suivre les principes SOLID et Clean Architecture

---

*Guide créé pour faciliter la complétion du projet AVENIR Bank* 🏦

