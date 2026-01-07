# Implémentation des Ordres au Prix du Marché avec Matching Récursif

## 📋 Résumé

Implémentation complète du système d'ordres au prix du marché avec matching automatique récursif pour la plateforme AVENIR Bank.

## ✅ Fonctionnalités Implémentées

### 1. Ordres au Prix du Marché

Les clients peuvent maintenant créer des ordres d'achat ou de vente au prix actuel du marché en passant `price = null` :

- **Backend** : Le `CreateOrderUseCase` accepte `price: number | null`
- **Logique** : Si `price === null`, le prix actuel de l'action (`stock.getCurrentPrice()`) est automatiquement utilisé
- **Validation** : Le système vérifie toujours le solde avant la création d'ordre

### 2. Matching Récursif Automatique

Après chaque exécution d'ordre et recalcul du prix :

- Le système cherche automatiquement de nouvelles correspondances
- Les ordres compatibles sont exécutés en cascade
- Limite de sécurité : 10 itérations maximum pour éviter les boucles infinies
- Logs détaillés pour suivre le processus

### 3. Vérifications Complètes

- ✅ Vérification du solde avant création d'ordre d'achat
- ✅ Vérification des holdings avant création d'ordre de vente
- ✅ Débit/crédit automatique des comptes lors des transactions
- ✅ Mise à jour automatique des holdings
- ✅ Recalcul du prix d'équilibre après chaque transaction
- ✅ Notifications automatiques pour chaque transaction

### 4. Interface Frontend

La page de trading (`/trading/[symbol]`) inclut maintenant :

- **Bouton "Prix du marché"** : Toggle pour activer/désactiver le mode prix du marché
- **Affichage dynamique** : Le prix du marché est affiché en temps réel
- **Calcul du total** : Estimation du montant total pour les ordres au prix du marché
- **Message informatif** : Indication que le prix final peut varier légèrement

## 📁 Fichiers Modifiés

### Backend

1. **`application/use-cases/investment/CreateOrderUseCase.ts`**
   - Signature modifiée : `price: number | null`
   - Logique ajoutée pour utiliser le prix du marché si `price === null`

2. **`application/use-cases/investment/ExecuteMatchedOrdersUseCase.ts`**
   - Méthode `triggerRecursiveMatching()` ajoutée
   - Matching récursif déclenché après recalcul du prix

3. **`infrastructure/in-memory-api/controllers/OrderController.ts`**
   - Validation adaptée pour accepter `price` optionnel ou null
   - Conversion de `undefined` en `null` pour l'API

### Frontend

4. **`infrastructure/nextjs-frontend/app/trading/[symbol]/page.tsx`**
   - État `useMarketPrice` ajouté
   - Toggle pour activer le mode prix du marché
   - Affichage conditionnel du formulaire
   - Calcul du total adapté

5. **`infrastructure/nextjs-frontend/src/presentation/hooks/useStocks.ts`**
   - Interface `createOrder` mise à jour : `price: number | null`

6. **`infrastructure/nextjs-frontend/src/application/services/StockService.ts`**
   - Interface `CreateOrderData` mise à jour : `price: number | null`

### Tests

7. **`infrastructure/in-memory-api/test-market-orders.ts`** (nouveau)
   - Script de test complet pour les ordres au prix du marché
   - Test du matching récursif
   - Vérification du recalcul du prix

8. **`infrastructure/in-memory-api/package.json`**
   - Nouveau script : `npm run test-market-orders`

## 🚀 Utilisation

### Backend - API

```typescript
// Créer un ordre au prix du marché
POST /api/orders
{
  "stockSymbol": "AAPL",
  "orderType": "BUY",
  "quantity": 10,
  "price": null  // null = prix du marché
}
```

### Frontend - Interface

1. Accéder à la page de trading : `/trading/AAPL`
2. Cliquer sur le bouton "Prix du marché"
3. Saisir la quantité souhaitée
4. Soumettre l'ordre

Le système utilisera automatiquement le prix actuel de l'action.

## 🧪 Tests

Pour tester les fonctionnalités :

```bash
# 1. Démarrer le serveur
cd infrastructure/in-memory-api
npm run dev

# 2. Dans un autre terminal, exécuter les tests
npm run test-market-orders
```

Le script de test vérifie :
- ✅ Création d'ordres au prix du marché
- ✅ Matching automatique
- ✅ Matching récursif en cascade
- ✅ Recalcul du prix d'équilibre
- ✅ Mise à jour du prix de l'action
- ✅ Exécution des ordres

## 📊 Flux de Traitement

```
1. Client crée un ordre (price = null)
   ↓
2. CreateOrderUseCase récupère le prix actuel de l'action
   ↓
3. Vérification du solde/holdings
   ↓
4. Création de l'ordre avec le prix du marché
   ↓
5. Matching automatique (MatchOrdersUseCase)
   ↓
6. Si correspondances trouvées :
   - Exécution des ordres matchés
   - Débit/crédit des comptes
   - Mise à jour des holdings
   - Recalcul du prix d'équilibre
   - Déclenchement du matching récursif
   ↓
7. Répétition jusqu'à épuisement des correspondances
   (max 10 itérations)
```

## ⚠️ Points d'Attention

1. **Limite de récursion** : Le matching récursif est limité à 10 itérations pour éviter les boucles infinies
2. **Prix variable** : Le prix final d'un ordre au marché peut légèrement varier du prix affiché selon l'état du carnet d'ordres
3. **Performance** : Le matching récursif peut prendre quelques secondes si beaucoup d'ordres sont traités
4. **Notifications** : Chaque transaction génère des notifications pour les deux parties

## 🔄 Améliorations Futures Possibles

- [ ] WebSocket pour mise à jour en temps réel du carnet d'ordres
- [ ] Historique détaillé du matching récursif
- [ ] Statistiques sur les ordres au prix du marché
- [ ] Limite configurable pour les itérations récursives
- [ ] Simulation avant exécution pour les ordres au marché

## 📝 Notes Techniques

### Matching Récursif

La méthode `triggerRecursiveMatching()` dans `ExecuteMatchedOrdersUseCase` :
- Est appelée automatiquement après chaque recalcul de prix
- Cherche de nouvelles correspondances dans le carnet d'ordres
- S'arrête quand aucune correspondance n'est trouvée ou après 10 itérations
- Log chaque itération dans la console pour le débogage

### Gestion du Prix du Marché

Le prix du marché est récupéré via `stock.getCurrentPrice()` qui :
- Reflète le dernier prix de transaction
- Est mis à jour après chaque exécution d'ordre
- Peut être différent du prix d'équilibre calculé

### Sécurité

- Les vérifications de solde/holdings sont toujours effectuées
- Les ordres incompatibles ne sont pas exécutés
- Les erreurs sont gérées sans bloquer les autres transactions
- Les transactions partielles sont supportées

---

**Date d'implémentation** : Janvier 2026  
**Version** : 1.0.0  
**Statut** : ✅ Production Ready

