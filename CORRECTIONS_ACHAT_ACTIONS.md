# Corrections : Système d'achat/vente d'actions

Date : 7 janvier 2026

## Problèmes corrigés

### 1. ✅ Achat d'actions ne créait pas de holdings
**Problème** : Quand un utilisateur achetait des actions au prix du marché, l'argent était débité mais les actions n'apparaissaient jamais dans son portfolio.

**Cause** : Le système créait un ordre PENDING et attendait un matching qui ne se produisait jamais (pas d'ordres SELL correspondants).

**Solution** : Créé `ExecuteInstantTradeUseCase` qui exécute immédiatement les achats/ventes au prix du marché :
- Débite le compte
- Réduit `stock.availableShares`
- Crée/met à jour le `StockHolding`
- Crée une opération COMPLETED
- Envoie une notification

### 2. ✅ Quantité disponible d'actions ne changeait pas
**Problème** : Après un achat, `stock.availableShares` restait inchangé.

**Solution** : Dans `ExecuteInstantTradeUseCase.executeBuy()` :
```typescript
const updatedStock = stock.executeBuyOrder(quantity);
await this.stockRepository.update(updatedStock);
```

### 3. ✅ Impossible de vendre (erreur "Quantité insuffisante")
**Problème** : Pas de holdings = impossible de vendre.

**Solution** : Maintenant que les achats créent correctement des holdings, les ventes fonctionnent. `ExecuteInstantTradeUseCase.executeSell()` :
- Vérifie que le client possède les actions
- Crédite le compte
- Augmente `stock.availableShares`
- Réduit le holding
- Crée une opération COMPLETED

### 4. ✅ Pas de mises à jour en temps réel
**Problème** : Le solde, le prix et la quantité disponible ne se mettaient pas à jour automatiquement.

**Solution** : Intégration complète de WebSocket :
- Ajout de `SocketServer` dans `OrderController` et `StockController`
- Émission d'événements après chaque transaction :
  - `stockUpdated` : prix et quantité disponible
  - `accountUpdated` : nouveau solde
  - `holdingsUpdated` : nouvelles possessions
- Création du hook `useStockRealtime` pour écouter ces événements
- La page de trading se rafraîchit automatiquement

## Fichiers modifiés

### Backend

#### Nouveau fichier
- **`application/use-cases/investment/ExecuteInstantTradeUseCase.ts`** : Use case pour exécuter immédiatement les achats/ventes au prix du marché

#### Fichiers modifiés
- **`application/use-cases/investment/CreateOrderUseCase.ts`** :
  - Détecte quand `price === null` (prix du marché)
  - Délègue à `ExecuteInstantTradeUseCase` au lieu de créer un ordre PENDING
  - Retourne un ordre fictif EXECUTED pour compatibilité API

- **`infrastructure/in-memory-api/controllers/OrderController.ts`** :
  - Ajout du paramètre `socketServer` au constructeur
  - Émission d'événements WebSocket après création d'ordre :
    - `stockUpdated` (broadcast à tous)
    - `holdingsUpdated` (à l'utilisateur)
    - `accountUpdated` (à l'utilisateur)

- **`infrastructure/in-memory-api/controllers/StockController.ts`** :
  - Ajout du paramètre `socketServer` au constructeur
  - Ajout de la route `GET /api/stocks/symbol/:symbol`

- **`infrastructure/in-memory-api/server.ts`** :
  - Passage de `socketServer` aux contrôleurs `StockController` et `OrderController`

- **`infrastructure/in-memory-api/seed.ts`** :
  - Suppression de tous les ordres pré-créés
  - Les utilisateurs créeront leurs propres ordres

### Frontend

#### Nouveau fichier
- **`infrastructure/nextjs-frontend/src/presentation/hooks/useStockRealtime.ts`** : Hook pour gérer les mises à jour WebSocket en temps réel d'une action

#### Fichiers modifiés
- **`infrastructure/nextjs-frontend/app/trading/[symbol]/page.tsx`** :
  - Intégration du hook `useStockRealtime`
  - Rafraîchissement automatique quand `refreshTrigger` change
  - Utilisation des fonctions `refresh` des hooks

## Flux de l'achat immédiat

```
Client clique "Acheter 2 AAPL" au prix du marché:
  ↓
POST /api/orders { stockSymbol: "AAPL", orderType: "BUY", quantity: 2, price: null }
  ↓
CreateOrderUseCase détecte price === null:
  ↓
ExecuteInstantTradeUseCase.executeBuy():
  1. Vérifie availableShares >= 2 ✅
  2. Débite le compte (déjà fait dans CreateOrderUseCase) ✅
  3. stock.executeBuyOrder(2) → availableShares -= 2 ✅
  4. StockHolding.addShares() ou create() ✅
  5. Crée opération COMPLETED ✅
  6. Crée notification ✅
  ↓
OrderController émet événements WebSocket:
  - stockUpdated (nouveau prix, availableShares)
  - holdingsUpdated (nouvelles possessions)
  - accountUpdated (nouveau solde)
  ↓
Frontend reçoit les événements:
  - useStockRealtime détecte les changements
  - refreshTrigger s'incrémente
  - La page rafraîchit stocks, account, orders
  ↓
✅ L'utilisateur voit immédiatement:
  - Son nouveau solde
  - Ses 2 actions AAPL dans son portfolio
  - La quantité disponible diminuée
```

## Tests à effectuer

1. **Achat au prix du marché** :
   - Se connecter en tant que client
   - Acheter 2 actions AAPL au prix du marché
   - Vérifier que le solde diminue immédiatement
   - Vérifier que les actions apparaissent dans le portfolio
   - Vérifier que `availableShares` diminue

2. **Vente au prix du marché** :
   - Après avoir acheté des actions
   - Vendre 1 action AAPL au prix du marché
   - Vérifier que le solde augmente
   - Vérifier que la possession passe de 2 à 1
   - Vérifier que `availableShares` augmente

3. **Mises à jour en temps réel** :
   - Observer les logs WebSocket dans la console
   - Vérifier que les événements sont émis
   - Vérifier que la page se met à jour automatiquement

4. **Ordres avec prix spécifique** :
   - Créer un ordre d'achat à 145€
   - Vérifier qu'il reste PENDING
   - Vérifier que l'argent est réservé
   - L'ordre devra être matché ou exécuté plus tard

## Points importants

### Double débit évité
Dans `ExecuteInstantTradeUseCase.executeBuy()`, on ne débite PAS le compte car il est déjà débité dans `CreateOrderUseCase`. Cela évite un double débit.

### Ordres fictifs pour compatibilité API
Quand un achat/vente est exécuté immédiatement, on retourne quand même un `OrderEntity` (exécuté) pour que l'API reste cohérente et que le frontend puisse traiter la réponse normalement.

### WebSocket vs Polling
Avant : La page appelait l'API en boucle (polling)
Maintenant : La page écoute les événements WebSocket et se met à jour uniquement quand nécessaire

## Prochaines étapes suggérées

1. **Système de carnet d'ordres complet** : Implémenter l'achat/vente direct contre des ordres existants (voir `PLAN_ACHAT_DIRECT_ORDRES.md`)

2. **Gestion des frais** : Actuellement les frais sont fixes (1€), envisager un système de frais proportionnels

3. **Historique des transactions** : Créer une page dédiée pour voir toutes les opérations d'achat/vente

4. **Graphiques de prix** : Ajouter des graphiques temps réel des prix des actions

5. **Limites de quantité** : Ajouter des limites min/max pour les transactions

