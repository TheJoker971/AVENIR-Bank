# Correction : Débit manquant pour les achats instantanés au prix du marché

Date : 7 janvier 2026

## Problème corrigé

Lorsqu'un utilisateur achetait des actions **au prix du marché** (`price === null`), le système :
- ❌ Ne débitait PAS le compte
- ❌ Ne créait PAS de holdings (possessions d'actions)
- ❌ Rendait impossible la vente ultérieure ("Quantité insuffisante")

### Cause du bug

Dans `ExecuteInstantTradeUseCase.executeBuy()`, il y avait un commentaire ligne 62-63 disant :
```typescript
// NOTE: L'argent est déjà débité par CreateOrderUseCase
// On ne débite PAS à nouveau ici
```

**Ce commentaire était FAUX** pour les achats au prix du marché car :
1. Quand `price === null`, `CreateOrderUseCase` saute directement à `ExecuteInstantTradeUseCase`
2. Il ne passe JAMAIS par la section qui débite le compte (lignes 157-164)
3. Résultat : l'argent n'était jamais débité

## Solution appliquée

### Fichier modifié : `ExecuteInstantTradeUseCase.ts`

**Ajout du débit du compte** dans la méthode `executeBuy()` :

```typescript
// 4. Vérifier le solde (pour les achats au prix du marché)
if (account.balance.isLessThan(totalWithFees)) {
  return new Error(`Solde insuffisant. Requis: ${totalWithFees.value}€, Disponible: ${account.balance.value}€`);
}

// 5. Débiter le compte
const debitedAccount = account.debit(totalWithFees);
if (debitedAccount instanceof Error) {
  return debitedAccount;
}
await this.accountRepository.update(debitedAccount);

// 6. Réduire les actions disponibles
const updatedStock = stock.executeBuyOrder(quantity);
// ...
```

### Modifications apportées

**Lignes 62-79** : Remplacement du commentaire par le code de débit

**Ajustement de la numérotation** :
- Ancien `// 4. Réduire les actions` → Nouveau `// 6. Réduire les actions`
- Ancien `// 5. Ajouter au portfolio` → Nouveau `// 7. Ajouter au portfolio`
- Ancien `// 6. Créer opération` → Nouveau `// 8. Créer opération`
- Ancien `// 7. Créer notification` → Nouveau `// 9. Créer notification`

## Flux corrigé

### Achat au prix du marché (InstantTrade) ✅

```
POST /api/orders { stockSymbol: "AAPL", orderType: "BUY", quantity: 2, price: null }
  ↓
CreateOrderUseCase.execute()
  ↓
Détecte price === null
  ↓
ExecuteInstantTradeUseCase.executeBuy():
  1. Récupère l'action
  2. Vérifie disponibilité (availableShares >= 2)
  3. Récupère le compte du client
  4. Vérifie le solde (>= 302€) ✅ NOUVEAU
  5. Débite le compte (302€) ✅ NOUVEAU
  6. Réduit stock.availableShares (-2)
  7. Crée/met à jour StockHolding (+2 AAPL)
  8. Crée opération COMPLETED
  9. Crée notification
  ↓
Retourne ordre EXECUTED
  ↓
OrderController émet WebSocket:
  - stockUpdated (availableShares)
  - holdingsUpdated (2 AAPL)
  - accountUpdated (solde - 302€)
  ↓
Frontend se met à jour automatiquement
```

### Ordre à prix spécifique (CreateOrder) - Inchangé

```
POST /api/orders { stockSymbol: "AAPL", orderType: "BUY", quantity: 2, price: 145.50 }
  ↓
CreateOrderUseCase.execute()
  ↓
Détecte price !== null
  ↓
Vérifie solde
Débite le compte (réservation)
Crée opération PENDING
Crée ordre PENDING
  ↓
Attente de matching avec un ordre SELL à 145.50€
```

## Test de validation

### Scénario 1 : Achat au prix du marché

1. **Connexion** : Se connecter avec `jean.dupont@example.com` / `password123`
2. **Solde initial** : Noter le solde (ex: 2198,75€)
3. **Achat** : Aller sur AAPL, acheter 2 actions au prix du marché (150,50€)
4. **Vérifications** :
   - ✅ Solde diminue de `(150,50 × 2) + 1 = 302€` → Nouveau solde : 1896,75€
   - ✅ Les 2 actions apparaissent dans "Mes Ordres" > "Exécutés (1)"
   - ✅ Le portfolio affiche "2 AAPL" avec prix moyen 150,50€
   - ✅ `stock.availableShares` passe de 1000000 à 999998

### Scénario 2 : Vente après achat

5. **Vente** : Vendre 1 action AAPL au prix du marché
6. **Vérifications** :
   - ✅ Pas d'erreur "Quantité insuffisante"
   - ✅ Solde augmente de `150,50 - 1 = 149,50€`
   - ✅ Le portfolio affiche "1 AAPL"
   - ✅ `stock.availableShares` passe de 999998 à 999999

### Scénario 3 : Ordre à prix spécifique (régression)

7. **Ordre** : Créer un ordre d'achat de 1 AAPL à 145€
8. **Vérifications** :
   - ✅ Ordre apparaît dans "En attente (1)"
   - ✅ Solde diminue de `145 + 1 = 146€` (réservation)
   - ✅ Ordre reste PENDING (pas d'exécution automatique)

## Résultat

✅ **Les achats au prix du marché fonctionnent maintenant correctement** :
- Le compte est débité
- Les actions sont ajoutées au portfolio
- Les ventes deviennent possibles
- Les mises à jour WebSocket fonctionnent

✅ **Les ordres à prix spécifique continuent de fonctionner** (pas de régression)

✅ **Architecture clarifiée** :
- `ExecuteInstantTradeUseCase` : Achats/ventes immédiats au prix du marché
- `CreateOrderUseCase` + `ExecuteMatchedOrdersUseCase` : Ordres en attente + matching

## Fichiers modifiés

- [`application/use-cases/investment/ExecuteInstantTradeUseCase.ts`](application/use-cases/investment/ExecuteInstantTradeUseCase.ts)
  - Lignes 62-79 : Ajout du débit du compte
  - Lignes 81, 93, 123 : Ajustement de la numérotation des commentaires

