# 📋 Liste des Fonctionnalités Manquantes - AVENIR Bank

## 🎉 Résumé Exécutif

### ✅ Phase 1 - Fonctionnalités Critiques : **100% TERMINÉ (Backend + Frontend)**
Toutes les fonctionnalités critiques demandées par le sujet ont été implémentées :
- ✅ Système complet de carnet d'ordres avec matching automatique
- ✅ Calcul du prix d'équilibre basé sur l'offre et la demande  
- ✅ Tracking complet des actions détenues (holdings)
- ✅ Vérification solde et débit automatique pour achat d'actions
- ✅ Calcul des gains temps réel sur livrets A (Backend + Frontend)
- ✅ Validation complète des ordres de vente
- ✅ Page portfolio frontend pour afficher les holdings

**Statut** : Backend, API et Frontend critiques terminés ✅

---

## 🎯 Priorités Critiques (Requis par le sujet)

### 1. 🔄 Système de Carnet d'Ordres (Order Book) - PRIORITÉ ABSOLUE ✅ **TERMINÉ**
**Problème** : Les ordres sont créés mais ne sont jamais automatiquement exécutés ou matchés. Le prix des actions ne se régule pas selon l'offre et la demande.

**Manque** :
- ✅ **Matching automatique d'ordres** : Quand un ordre d'achat peut matcher avec un ordre de vente (même symbole, prix compatible)
- ✅ **Calcul du prix d'équilibre** : Le prix actuel d'une action devrait être calculé à partir du carnet d'ordres (intersection offre/demande)
- ✅ **Service de matching d'ordres** : Use case pour matcher les ordres BUY et SELL
- ✅ **Mise à jour automatique du prix** : Quand des ordres matchent, le prix de l'action devrait être mis à jour
- ✅ **Exécution automatique** : Les ordres qui matchent devraient être exécutés automatiquement
- ✅ **Gestion de la file d'attente** : Ordres triés par prix et date pour le matching FIFO ou prix prioritaire

**Implémenté** :
- ✅ `MatchOrdersUseCase` : Service pour matcher les ordres BUY et SELL
- ✅ `CalculateEquilibriumPriceUseCase` : Calculer le prix d'équilibre à partir du carnet d'ordres
- ✅ `ExecuteMatchedOrdersUseCase` : Exécuter automatiquement les ordres qui matchent
- ✅ Modifier `CreateOrderUseCase` pour déclencher le matching après création
- ✅ Méthode `getOrderBook()` dans `CalculateEquilibriumPriceUseCase` pour récupérer les ordres en attente d'une action
- ✅ Endpoints API : `/api/orders/match/:stockSymbol` et `/api/orders/orderbook/:stockSymbol`

---

### 2. 💰 Affichage Gains Temps Réel sur Livrets A - PRIORITÉ HAUTE ✅ **TERMINÉ (Backend)**
**Problème** : Les clients ne voient que le solde actuel, pas le montant total incluant les intérêts non encore crédités.

**Manque** :
- ✅ **Calcul en temps réel des intérêts non crédités** : Calculer les intérêts depuis le dernier calcul jusqu'à maintenant
- ✅ **Affichage du montant total projeté** : Solde actuel + intérêts calculés en temps réel
- ✅ **Méthode dans SavingsAccountEntity** : `calculateAccumulatedInterest()` pour calculer les intérêts depuis lastInterestCalculation
- ✅ **Endpoint API** : `/api/savings-accounts/:id/total-value` pour retourner le total (solde + gains)
- ✅ **Affichage frontend** : Afficher "Montant total estimé" sur la page savings

**Implémenté** :
- ✅ Méthode `calculateAccumulatedInterest()` dans `SavingsAccountEntity`
- ✅ Méthode `calculateTotalValue()` dans `SavingsAccountEntity`
- ✅ Endpoint API dans `SavingsAccountController` pour calculer le total (`GET /api/savings-accounts/:id/total-value`)
- ✅ Hook `useSavingsTotalValue` pour récupérer les valeurs totales
- ✅ Mise à jour de la page `/savings` pour afficher la valeur totale avec gains temps réel
- ✅ Affichage du solde actuel, valeur totale estimée et intérêts accumulés

---

### 3. 💳 Vérification Solde et Débit pour Achat d'Actions - PRIORITÉ HAUTE ✅ **TERMINÉ**
**Problème** : Dans `ExecuteOrderUseCase`, il y a un commentaire TODO pour déduire le montant du compte, mais ce n'est pas implémenté.

**Manque** :
- ✅ **Vérification du solde** : Avant de créer un ordre d'achat, vérifier que le client a assez d'argent
- ✅ **Débit automatique** : Quand un ordre d'achat est exécuté, déduire le montant + frais (1€) du compte
- ✅ **Crédit automatique** : Quand un ordre de vente est exécuté, créditer le montant - frais (1€) au compte
- ✅ **Gestion des frais de transaction** : Les 1€ de frais doivent être débités/crédités correctement
- ⏳ **Rollback en cas d'erreur** : Si l'exécution échoue, annuler les modifications (Partiellement fait - gestion d'erreurs présente)

**Implémenté** :
- ✅ Vérification dans `CreateOrderUseCase` : Vérifier le solde avant création d'ordre BUY
- ✅ Modification de `ExecuteMatchedOrdersUseCase` : Débiter/créditer les comptes lors du matching
- ✅ Méthodes `debit()` et `credit()` ajoutées dans `AccountEntity`
- ⏳ Créer une opération bancaire pour chaque transaction d'actions (À faire - commenté dans le code)
- ✅ Gestion des erreurs dans les use cases

---

### 4. 📊 Tracking des Actions Détenues par Client - PRIORITÉ HAUTE ✅ **TERMINÉ (Backend)**
**Problème** : Aucun système pour savoir quelles actions et combien un client possède.

**Manque** :
- ✅ **Entité StockHolding** : Représenter la possession d'actions par un client (clientId, stockSymbol, quantity)
- ✅ **Repository StockHoldingRepository** : Gérer les possessions d'actions
- ✅ **Mise à jour automatique** : Quand un ordre est exécuté, mettre à jour les holdings
- ✅ **Endpoint API** : `/api/portfolio` ou `/api/holdings` pour voir le portefeuille d'un client
- ✅ **Affichage frontend** : Page ou section montrant les actions détenues

**Implémenté** :
- ✅ Nouvelle entité `StockHoldingEntity` avec calcul de prix moyen d'achat et gains/pertes
- ✅ `StockHoldingRepositoryInterface` et implémentation `StockHoldingRepositoryInMemory`
- ✅ `UpdateStockHoldingUseCase` pour gérer les holdings (addShares, removeShares)
- ✅ Modifier `ExecuteMatchedOrdersUseCase` pour créer/mettre à jour les holdings automatiquement
- ✅ `PortfolioController` avec endpoints `/api/portfolio` (liste complète) et `/api/portfolio/:stockSymbol` (détail)
- ✅ Calcul de la valeur actuelle et gains/pertes non réalisés
- ✅ Page frontend `/portfolio` avec résumé global, tableau détaillé des holdings, et calculs de gains/pertes
- ✅ Hook `usePortfolio` pour gérer les données du portefeuille

---

## 🔧 Fonctionnalités Importantes (Amélioration UX/UI)

### 5. 📱 Page Notifications ✅ **TERMINÉ**
**Problème** : Le système de notifications existe dans le domaine mais pas de page frontend.

**Manque** :
- ✅ Page `/notifications` pour afficher les notifications d'un client
- ✅ Marquer comme lues/non lues (endpoint PUT /api/notifications/:id/read)
- ⏳ Badge de compteur de notifications non lues dans le header (À faire)

**Implémenté** :
- ✅ Service `NotificationService` et adapter `NotificationApiAdapter`
- ✅ Hook `useNotifications` pour gérer les notifications
- ✅ Page `/notifications` avec affichage des notifications lues/non lues
- ✅ Fonctionnalité pour marquer une notification ou toutes comme lues
- ✅ Endpoint backend PUT /api/notifications/:id/read

---

### 6. 🔄 Actualisation Automatique des Prix d'Actions
**Problème** : Les prix ne sont mis à jour que manuellement ou lors de l'exécution d'ordres.

**Manque** :
- ❌ **Service périodique** : Job/Cron pour recalculer les prix à partir du carnet d'ordres
- ❌ **WebSocket ou polling** : Mettre à jour les prix en temps réel côté frontend
- ❌ **Recalcul automatique** : Recalculer le prix d'équilibre toutes les X secondes/minutes

---

### 7. 📈 Dashboard Amélioré - Vue Portefeuille ✅ **TERMINÉ (Partiel)**
**Manque** :
- ✅ **Valeur totale du portefeuille** : Comptes + Livrets (avec gains temps réel) + Actions (valeur actuelle)
- ✅ **Évolution des gains** : Afficher les gains/pertes sur les actions
- ⏳ **Graphiques** : Visualisation de l'évolution du portefeuille (À faire)
- ✅ **Résumé des actifs** : Vue d'ensemble de tous les avoirs (comptes, épargne, actions)

**Implémenté** :
- ✅ Card "Valeur Totale du Portefeuille" avec calcul automatique
- ✅ Card "Portefeuille Actions" avec gains/pertes
- ✅ Card "Épargne" avec gains estimés
- ✅ Intégration de `usePortfolio` et `useSavingsTotalValue` dans le dashboard

---

### 8. 🎫 Interface Carnet d'Ordres Visible ✅ **TERMINÉ**
**Manque** :
- ✅ **Affichage du carnet d'ordres** : Voir les ordres d'achat et de vente en attente pour chaque action
- ⏳ **Depth chart** : Visualisation de l'offre et de la demande (À faire - amélioration UI)
- ⏳ **Historique des transactions** : Voir les ordres exécutés récemment (À faire - filtre dans GET /api/orders)

**Implémenté** :
- ✅ Endpoint `GET /api/orders/orderbook/:stockSymbol` retourne buyOrders et sellOrders triés
- ✅ Calcul du prix d'équilibre inclus dans la réponse
- ✅ Interface frontend modal pour visualiser le carnet d'ordres sur la page stocks
- ✅ Bouton "Voir le carnet d'ordres" sur chaque action
- ✅ Affichage des ordres d'achat/vente avec prix et quantités
- ✅ Bouton pour déclencher le matching manuellement (DIRECTOR uniquement)

---

### 9. ⏰ Calcul Automatique Quotidien des Intérêts ✅ **TERMINÉ (Backend API)**
**Problème** : `CalculateDailyInterestUseCase` existe mais n'est jamais appelé automatiquement.

**Manque** :
- ⏳ **Job/Cron** : Tâche planifiée pour calculer les intérêts quotidiennement (À faire)
- ✅ **Endpoint manuel** : `/api/savings-accounts/calculate-interests` pour déclencher le calcul
- ⏳ **Interface admin** : Bouton pour le directeur de déclencher le calcul manuellement (À faire - frontend)

**Implémenté** :
- ✅ Endpoint `POST /api/savings-accounts/calculate-interests` (DIRECTOR uniquement)
- ✅ Intégration de `CalculateDailyInterestUseCase` dans `SavingsAccountController`
- ✅ Tests complets pour l'endpoint (tests 6, 7, 8 dans testSavingsAccounts)

---

### 10. 🔍 Validation Ordres de Vente ✅ **TERMINÉ**
**Manque** :
- ✅ **Vérification de possession** : Avant de créer un ordre de vente, vérifier que le client possède assez d'actions
- ✅ **Bloquer la vente** : Si le client n'a pas assez d'actions, rejeter l'ordre

**Implémenté** :
- ✅ Vérification dans `CreateOrderUseCase` avant création d'ordre SELL
- ✅ Validation des holdings via `StockHoldingRepository`
- ✅ Message d'erreur explicite si quantité insuffisante

---

### 11. 💸 Gestion des Frais de Transaction
**Manque** :
- ❌ **Compte de la banque** : Compte spécial pour recevoir les frais de transaction
- ❌ **Enregistrement des frais** : Créer une opération pour chaque frais perçu
- ❌ **Rapport des revenus** : Pour le directeur, voir les revenus générés par les frais

---

## 📝 Améliorations Techniques

### 12. 🎯 Endpoint Exécution d'Ordres Manuelle ✅ **TERMINÉ (Partiel)**
**Manque** :
- ✅ Endpoint `POST /api/orders/match/:stockSymbol` pour déclencher le matching manuellement
- ✅ Endpoint `GET /api/orders/orderbook/:stockSymbol` pour voir le carnet d'ordres
- ✅ Endpoint `DELETE /api/orders/:id` pour annuler un ordre
- ⏳ Interface frontend pour le directeur de forcer l'exécution d'un ordre (À faire)

---

### 13. 📊 Statistiques et Rapports
**Manque** :
- ❌ **Statistiques des actions** : Volume échangé, prix min/max, évolution
- ❌ **Statistiques utilisateurs** : Nombre de transactions, volume échangé
- ❌ **Rapport de revenus** : Pour le directeur, revenus des frais de transaction

---

### 14. 🔐 Validation et Sécurité
**Manque** :
- ❌ **Rate limiting** : Limiter les créations d'ordres pour éviter le spam
- ❌ **Validation des prix** : Vérifier que le prix proposé est raisonnable
- ❌ **Gestion des erreurs** : Meilleure gestion d'erreurs dans les use cases

---

### 15. 📄 Historique des Ordres
**Manque** :
- ❌ **Filtrage** : Filtrer les ordres par statut (pending, executed, cancelled)
- ❌ **Recherche** : Rechercher par symbole d'action
- ❌ **Pagination** : Pour les clients avec beaucoup d'ordres

---

### 16. 🔔 Notifications Automatiques
**Manque** :
- ❌ Notification quand un ordre est exécuté
- ❌ Notification quand le prix d'une action change significativement
- ❌ Notification quand un ordre ne peut pas être exécuté

---

### 17. 🎨 Améliorations UX
**Manque** :
- ❌ **Auto-complétion** : Pour la sélection d'actions dans les ordres
- ❌ **Calcul automatique** : Afficher le montant total (prix × quantité + frais) avant soumission
- ❌ **Confirmation avant soumission** : Modal de confirmation avec détails de l'ordre
- ❌ **Messages d'erreur clairs** : Messages utilisateur plus explicites

---

### 18. 🔄 Gestion de la Concurrence
**Manque** :
- ❌ **Verrouillage** : Gérer les cas où plusieurs ordres sont créés simultanément
- ❌ **Optimistic locking** : Pour éviter les conflits lors de l'exécution d'ordres

---

## 📦 Fonctionnalités Optionnelles (Bonus)

### 19. 📊 Graphiques et Visualisations
- Graphiques d'évolution des prix d'actions
- Graphiques de valeur du portefeuille
- Graphiques d'évolution des intérêts sur livrets

### 20. 🔔 Alertes de Prix
- Permettre aux clients de définir des alertes (ex: "Me prévenir quand AAPL dépasse 200€")

### 21. 📱 Notifications Push
- Intégration avec un service de notifications push pour les alertes importantes

### 22. 🌐 Multi-device Sync
- Synchronisation en temps réel entre plusieurs sessions/onglets

---

## 🎯 Plan d'Action Recommandé

### Phase 1 - Critique (Fonctionnalités requises)
1. ✅ **Système de carnet d'ordres et matching** (Priorité #1) - **TERMINÉ**
2. ✅ **Affichage gains temps réel sur livrets** (Priorité #2) - **TERMINÉ (Backend)** - Frontend à faire
3. ✅ **Vérification solde et débit pour achat d'actions** (Priorité #3) - **TERMINÉ**
4. ✅ **Tracking des actions détenues** (Priorité #4) - **TERMINÉ (Backend)** - Frontend à faire

### Phase 2 - Important (Amélioration UX)
5. ⏳ Page notifications (À faire)
6. ⏳ Calcul automatique quotidien des intérêts (Use case existe, mais pas de job/cron)
7. ⏳ Dashboard amélioré avec portefeuille total (À faire - frontend)
8. ✅ Validation des ordres de vente (TERMINÉ - vérifie les holdings avant création)

### Phase 3 - Améliorations
9. ✅ Interface carnet d'ordres visible (API terminée, frontend à faire)
10. ⏳ Statistiques et rapports (À faire)
11. ⏳ Notifications automatiques (À faire)
12. ⏳ Améliorations UX diverses (À faire)

---

## 📊 Résumé des Implémentations

### ✅ Fonctionnalités Terminées (Backend + API)

**Phase 1 - Critiques :**
- ✅ Système complet de carnet d'ordres avec matching automatique
- ✅ Calcul du prix d'équilibre basé sur l'offre et la demande
- ✅ Exécution automatique des ordres matchés
- ✅ Tracking complet des actions détenues (holdings)
- ✅ Vérification solde avant achat d'actions
- ✅ Débit/crédit automatique lors des transactions
- ✅ Calcul des gains temps réel sur livrets A
- ✅ Validation des ordres de vente (vérification des holdings)

**Endpoints API Créés :**
- ✅ `GET /api/orders` - Liste les ordres
- ✅ `POST /api/orders` - Crée un ordre (avec validation solde/holdings)
- ✅ `DELETE /api/orders/:id` - Annule un ordre
- ✅ `GET /api/orders/orderbook/:stockSymbol` - Carnet d'ordres
- ✅ `POST /api/orders/match/:stockSymbol` - Matching manuel
- ✅ `GET /api/portfolio` - Portefeuille complet
- ✅ `GET /api/portfolio/:stockSymbol` - Détail d'un holding
- ✅ `GET /api/savings-accounts/:id/total-value` - Valeur totale avec gains

### ✅ Fonctionnalités Frontend Terminées

- ✅ Page `/portfolio` pour afficher les holdings
- ✅ Affichage gains temps réel sur page `/savings`
- ✅ Visualisation du carnet d'ordres dans l'interface stocks
- ✅ Dashboard amélioré avec portefeuille total (comptes + épargne + actions)
- ✅ Page notifications frontend
- ✅ Endpoint PUT /api/notifications/:id/read pour marquer comme lu

### ⏳ Fonctionnalités À Implémenter

- ⏳ Job/Cron pour calcul automatique quotidien des intérêts
- ✅ Création d'opérations bancaires pour les transactions d'actions - **TERMINÉ**
- ✅ Badge de compteur de notifications non lues dans le header - **TERMINÉ**
- ⏳ Statistiques et rapports
- ✅ Notifications automatiques (ordres exécutés) - **TERMINÉ**
- ⏳ Graphiques d'évolution du portefeuille

