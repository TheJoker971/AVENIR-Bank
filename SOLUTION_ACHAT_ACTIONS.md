# Solution : Correction du système d'achat/vente d'actions

## Problèmes identifiés

1. **Achat au prix du marché ne crée pas de holding** : L'argent est réservé mais les actions ne sont jamais ajoutées au portfolio
2. **availableShares non mis à jour** : La quantité disponible de l'action ne diminue pas
3. **Impossible de vendre** : Pas de holdings = erreur "Quantité insuffisante"
4. **Pas de mises à jour temps réel** : Le solde et les prix ne se rafraîchissent pas automatiquement

## Flux actuel (INCOMPLET)

```
Client achète 2 actions AAPL au prix du marché:
  ↓
CreateOrderUseCase:
  - Vérifie le solde ✅
  - Débite le compte (réservation) ✅  
  - Crée ordre PENDING ✅
  - Lance matching...
  ↓
Matching ne trouve rien (pas d'ordres SELL correspondants)
  ↓
Ordre reste PENDING indéfiniment ❌
Actions jamais ajoutées au portfolio ❌
```

## Solution : Achat/Vente immédiat au prix du marché

Quand `price === null` (prix du marché), on doit ACHETER/VENDRE IMMÉDIATEMENT contre le stock disponible, pas créer un ordre en attente.

### Nouveau flux

```
Client achète 2 actions AAPL au prix du marché:
  ↓
CreateOrderUseCase détecte price === null:
  - Vérifie availableShares >= quantity ✅
  - Débite le compte ✅
  - Réduit stock.availableShares ✅
  - Crée/met à jour StockHolding ✅
  - Crée opération COMPLETED ✅
  - Envoie notification ✅
  - Émet événement WebSocket ✅
  ↓
Achat terminé immédiatement
```

## Modifications à apporter

### 1. Créer ExecuteInstantTradeUseCase

**Nouveau fichier** : `application/use-cases/investment/ExecuteInstantTradeUseCase.ts`

Ce use case gère les achats/ventes immédiats au prix du marché (sans ordre en attente).

### 2. Modifier CreateOrderUseCase

Détecter quand `price === null` et déléguer à `ExecuteInstantTradeUseCase` au lieu de créer un ordre PENDING.

### 3. Ajouter événements WebSocket pour les actions

Émettre des événements quand :
- Le prix d'une action change
- Les availableShares changent
- Un ordre est exécuté

### 4. Mettre à jour le frontend

Écouter les événements WebSocket pour mettre à jour en temps réel :
- Solde du compte
- Prix de l'action
- Quantité disponible
- Holdings du client

## Implementation simplifiée

Pour l'instant, on va simplifier : quand `price === null`, on exécute immédiatement contre le stock disponible.

Plus tard, on pourra ajouter le système de carnet d'ordres complet avec exécution contre des ordres existants.

