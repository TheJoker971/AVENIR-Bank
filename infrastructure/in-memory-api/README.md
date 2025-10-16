# 🏦 AVENIR Bank API - Version en Mémoire

API de simulation bancaire utilisant l'architecture Clean Architecture avec des repositories en mémoire.

## 🚀 Démarrage Rapide

### Installation
```bash
cd infrastructure/in-memory-api
npm install
```

### Démarrage du serveur
```bash
npm start
# ou pour le développement
npm run dev
```

Le serveur sera disponible sur `http://localhost:3000`

## 📚 Endpoints API

### 🏥 Health Check
- **GET** `/health` - Vérifier l'état du serveur

### 🔐 Authentification
- **POST** `/api/auth/login` - Connexion utilisateur
- **POST** `/api/auth/register` - Inscription utilisateur

### 💳 Comptes
- **POST** `/api/accounts` - Créer un compte bancaire
- **POST** `/api/accounts/savings` - Créer un livret A

### 💸 Virements
- **POST** `/api/transfers` - Créer un virement
- **POST** `/api/transfers/:id/execute` - Exécuter un virement

### 📈 Investissements
- **POST** `/api/orders` - Créer un ordre d'achat/vente
- **POST** `/api/orders/:id/execute` - Exécuter un ordre

### 💰 Crédits
- **POST** `/api/credits` - Créer un crédit
- **POST** `/api/credits/:id/payments` - Effectuer un paiement

### 💬 Messagerie
- **POST** `/api/messages` - Envoyer un message

### ⚙️ Administration
- **PUT** `/api/admin/interest-rate` - Modifier le taux d'épargne
- **POST** `/api/admin/calculate-interest` - Calculer les intérêts quotidiens

## 🧪 Données de Test

L'API s'initialise automatiquement avec des données de test :

### Utilisateurs
- **Client** : `jean.dupont@example.com` / `password123`
- **Conseiller** : `marie.martin@avenir-bank.com` / `advisor123`
- **Directeur** : `pierre.durand@avenir-bank.com` / `director123`

### Banque
- **Nom** : AVENIR Bank
- **Code banque** : 12345
- **Code agence** : 67890
- **Taux d'épargne** : 2.5%

## 📝 Exemples d'Utilisation

### Créer un compte
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "ownerId": 1,
    "countryCode": "FR",
    "bankCode": "12345",
    "branchCode": "67890",
    "ribKey": "12"
  }'
```

### Créer un virement
```bash
curl -X POST http://localhost:3000/api/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "senderFirstName": "Jean",
    "senderLastName": "Dupont",
    "senderIban": "FR1420041010050500013M02606",
    "receiverFirstName": "Marie",
    "receiverLastName": "Martin",
    "receiverIban": "FR1420041010050500013M02607",
    "amount": 150.50,
    "reason": "Remboursement",
    "instantTransfer": true
  }'
```

### Créer un ordre d'achat
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "stockSymbol": "AAPL",
    "orderType": "BUY",
    "quantity": 10,
    "price": 150.00
  }'
```

## 🏗️ Architecture

```
infrastructure/in-memory-api/
├── controllers/          # Contrôleurs API
├── repositories/         # Implémentations en mémoire
├── services/            # Services métier
├── server/              # Configuration Express
├── types/               # Types TypeScript
├── utils/               # Utilitaires
└── index.ts            # Point d'entrée
```

## 🔧 Développement

### Structure des Repositories
Chaque repository implémente l'interface correspondante du domaine :
- `InMemoryUserRepository` → `UserRepositoryInterface`
- `InMemoryBankRepository` → `BankRepositoryInterface`
- etc.

### Use Cases
Tous les use cases de l'application layer sont utilisés :
- `CreateAccountUseCase`
- `CreateTransferUseCase`
- `CreateOrderUseCase`
- etc.

### Gestion des Erreurs
- Toutes les erreurs sont capturées et retournées au format JSON
- Codes de statut HTTP appropriés
- Messages d'erreur en français

## 🧪 Tests

```bash
npm test
```

## 📊 Monitoring

- Logs automatiques des requêtes
- Health check endpoint
- Gestion des erreurs centralisée

## 🚀 Déploiement

L'API peut être déployée sur :
- Docker
- Heroku
- AWS
- Vercel
- etc.

## 📈 Prochaines Étapes

1. Implémenter tous les repositories manquants
2. Ajouter la validation des données
3. Implémenter l'authentification JWT
4. Ajouter les tests unitaires
5. Créer la documentation Swagger
6. Ajouter la persistance en base de données

---

*Cette API simule parfaitement le comportement d'un système bancaire réel en utilisant l'architecture Clean Architecture* 🏦
