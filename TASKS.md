# 🏦 AVENIR Bank - Tâches Manquantes

> Analyse complète des fonctionnalités manquantes ou incomplètes par rapport au cahier des charges ([Sujet.md](Sujet.md))

---

## 🔴 Priorité Haute (Requis par le sujet)

### 1. Confirmation par Email à l'Inscription

**Statut:** ❌ Non implémenté

**Description:**
Le sujet exige une "Inscription avec confirmation par e-mail". Actuellement, l'inscription crée directement un compte sans validation par email.

**Fichiers concernés:**
- [`infrastructure/in-memory-api/controllers/AuthController.ts`](infrastructure/in-memory-api/controllers/AuthController.ts) (lignes 57-58 : TODO commenté)
- [`infrastructure/prisma-api/controllers/AuthController.ts`](infrastructure/prisma-api/controllers/AuthController.ts) (ligne 57 : TODO commenté)
- [`domain/entities/UserEntity.ts`](domain/entities/UserEntity.ts) (ajouter propriété `emailVerified`)

**À implémenter:**
- [ ] Créer un service d'envoi d'email (ex: Nodemailer, SendGrid)
- [ ] Ajouter une propriété `emailVerified: boolean` et `verificationToken: string` à `UserEntity`
- [ ] Générer un token de confirmation unique à l'inscription
- [ ] Envoyer un email avec lien de confirmation
- [ ] Créer un endpoint `GET /api/auth/verify-email/:token`
- [ ] Bloquer la connexion si l'email n'est pas vérifié
- [ ] Ajouter un endpoint pour renvoyer l'email de confirmation

**Estimation:** 4-6 heures

---

### 2. Modification et Suppression de Comptes

**Statut:** ❌ Non implémenté

**Description:**
Le sujet mentionne "Modification du nom ou suppression du compte" pour les comptes bancaires clients.

**Fichiers concernés:**
- [`infrastructure/in-memory-api/controllers/AccountController.ts`](infrastructure/in-memory-api/controllers/AccountController.ts)
- [`application/use-cases/account/UpdateAccountUseCase.ts`](application/use-cases/account/UpdateAccountUseCase.ts) (à créer)
- [`application/use-cases/account/DeleteAccountUseCase.ts`](application/use-cases/account/DeleteAccountUseCase.ts) (à créer)
- [`domain/entities/AccountEntity.ts`](domain/entities/AccountEntity.ts) (ajouter méthode `updateName()`)
- [`infrastructure/nextjs-frontend/app/accounts/page.tsx`](infrastructure/nextjs-frontend/app/accounts/page.tsx) (ajouter UI)

**À implémenter:**

#### Backend
- [ ] Créer `UpdateAccountUseCase` pour modifier le nom du compte
- [ ] Créer `DeleteAccountUseCase` avec vérifications:
  - Solde doit être à 0€
  - Ne pas supprimer le dernier compte d'un utilisateur
  - Vérifier qu'il n'y a pas d'ordres en cours
- [ ] Ajouter endpoints dans `AccountController`:
  - `PUT /api/accounts/:id` (modifier nom)
  - `DELETE /api/accounts/:id` (supprimer)
- [ ] Ajouter méthode `updateName(newName: string)` dans `AccountEntity`

#### Frontend
- [ ] Ajouter bouton "Modifier" sur chaque compte
- [ ] Modal de modification du nom
- [ ] Ajouter bouton "Supprimer" avec confirmation
- [ ] Afficher les conditions de suppression (solde = 0€)
- [ ] Messages d'erreur explicites

**Estimation:** 3-4 heures

---

### 3. Endpoints Backend Complets pour les Crédits

**Statut:** ⚠️ Partiellement implémenté

**Description:**
Le `CreditController` n'expose actuellement que des endpoints GET. Il manque les endpoints POST/PUT pour créer des crédits et traiter les paiements depuis l'API.

**Fichiers concernés:**
- [`infrastructure/in-memory-api/controllers/CreditController.ts`](infrastructure/in-memory-api/controllers/CreditController.ts) (actuellement supprimé ou incomplet)
- [`application/use-cases/credit/CreateCreditUseCase.ts`](application/use-cases/credit/CreateCreditUseCase.ts) (existe)
- [`application/use-cases/credit/ProcessPaymentUseCase.ts`](application/use-cases/credit/ProcessPaymentUseCase.ts) (existe)
- [`infrastructure/nextjs-frontend/app/credits/page.tsx`](infrastructure/nextjs-frontend/app/credits/page.tsx) (existe)

**À implémenter:**

#### Backend
- [ ] Recréer/compléter `CreditController` avec:
  - `POST /api/credits` - Créer un crédit (conseiller uniquement)
  - `PUT /api/credits/:id/payment` - Traiter un paiement
  - `GET /api/credits/client/:clientId` - Crédits d'un client
- [ ] Ajouter middleware `requireAdviser` pour restreindre la création
- [ ] Créer des notifications automatiques:
  - Notification au client lors de l'attribution d'un crédit
  - Notification avant échéance de paiement
- [ ] Ajouter le controller dans `server.ts`

#### Frontend
- [ ] Vérifier que l'interface conseiller fonctionne avec les nouveaux endpoints
- [ ] Ajouter vue client pour voir ses propres crédits
- [ ] Afficher les échéances à venir dans le dashboard

**Estimation:** 3-4 heures

---

### 4. Transfert de Discussions entre Conseillers

**Statut:** ❌ Non implémenté

**Description:**
Le sujet mentionne "Possibilité de transférer une discussion à un autre conseiller" dans la messagerie.

**Fichiers concernés:**
- [`infrastructure/in-memory-api/controllers/MessageController.ts`](infrastructure/in-memory-api/controllers/MessageController.ts)
- [`application/use-cases/messaging/TransferConversationUseCase.ts`](application/use-cases/messaging/TransferConversationUseCase.ts) (à créer)
- [`domain/entities/MessageEntity.ts`](domain/entities/MessageEntity.ts) (vérifier structure)
- [`infrastructure/nextjs-frontend/app/messages/page.tsx`](infrastructure/nextjs-frontend/app/messages/page.tsx)

**À implémenter:**

#### Backend
- [ ] Créer `TransferConversationUseCase`:
  - Récupérer tous les messages entre un client et un conseiller
  - Réassigner le `receiverId` au nouveau conseiller
  - Créer une notification pour le nouveau conseiller
  - Logger le transfert
- [ ] Ajouter endpoint `POST /api/messages/transfer`:
  ```typescript
  {
    clientId: number,
    fromAdviserId: number,
    toAdviserId: number
  }
  ```
- [ ] Vérifier que les deux conseillers existent et ont le rôle ADVISE

#### Frontend
- [ ] Ajouter bouton "Transférer" dans l'interface conseiller
- [ ] Modal pour sélectionner le conseiller destinataire (liste déroulante)
- [ ] Afficher un message de confirmation
- [ ] Notification WebSocket au nouveau conseiller

**Estimation:** 3-4 heures

---

### 5. Interface Admin pour Modifier/Supprimer des Actions

**Statut:** ⚠️ Partiellement implémenté

**Description:**
Le directeur peut créer des actions, mais il manque les interfaces pour les modifier et les supprimer.

**Fichiers concernés:**
- [`infrastructure/in-memory-api/controllers/StockController.ts`](infrastructure/in-memory-api/controllers/StockController.ts)
- [`application/use-cases/stock/UpdateStockUseCase.ts`](application/use-cases/stock/UpdateStockUseCase.ts) (à créer)
- [`application/use-cases/stock/DeleteStockUseCase.ts`](application/use-cases/stock/DeleteStockUseCase.ts) (à créer)
- [`infrastructure/nextjs-frontend/app/admin/stocks/page.tsx`](infrastructure/nextjs-frontend/app/admin/stocks/page.tsx) (à créer)
- [`domain/entities/StockEntity.ts`](domain/entities/StockEntity.ts)

**À implémenter:**

#### Backend
- [ ] Créer `UpdateStockUseCase`:
  - Permettre de modifier: nom, symbole, nombre total d'actions
  - **NE PAS** permettre de modifier le prix (calculé automatiquement)
  - Vérifier que le symbole reste unique
- [ ] Créer `DeleteStockUseCase` avec validations:
  - Impossible si des ordres en attente existent
  - Impossible si des holdings existent (clients possèdent des actions)
  - Retourner un message d'erreur explicite
- [ ] Ajouter endpoints dans `StockController`:
  - `PUT /api/stocks/:symbol` (modifier)
  - `DELETE /api/stocks/:symbol` (supprimer)
- [ ] Middleware `requireDirector` pour ces endpoints

#### Frontend
- [ ] Créer page `/admin/stocks` pour la gestion des actions
- [ ] Liste des actions avec boutons "Modifier" et "Supprimer"
- [ ] Modal de modification (nom, symbole, total shares)
- [ ] Afficher le prix actuel (non modifiable, en lecture seule)
- [ ] Confirmation avant suppression avec avertissement
- [ ] Afficher les erreurs si suppression impossible

**Estimation:** 4-5 heures

---

## 🟡 Priorité Moyenne (Fonctionnalités Partielles)

### 6. Amélioration UX Virements Externes

**Statut:** ⚠️ Partiellement implémenté

**Description:**
Le backend supporte les virements externes (vers bénéficiaires), mais l'expérience utilisateur frontend n'est pas complète.

**Fichiers concernés:**
- [`infrastructure/nextjs-frontend/app/transfer/page.tsx`](infrastructure/nextjs-frontend/app/transfer/page.tsx) (à créer ou améliorer)
- [`infrastructure/nextjs-frontend/app/beneficiaries/page.tsx`](infrastructure/nextjs-frontend/app/beneficiaries/page.tsx) (existe)
- [`infrastructure/in-memory-api/controllers/OperationController.ts`](infrastructure/in-memory-api/controllers/OperationController.ts) (ligne 202-210)

**À implémenter:**
- [ ] Page dédiée aux virements avec onglets:
  - Virement interne (entre mes comptes)
  - Virement vers bénéficiaire
  - Virement externe (nouveau bénéficiaire)
- [ ] Validation IBAN en temps réel avec feedback visuel
- [ ] Prévisualisation du virement avant confirmation
- [ ] Historique des virements externes
- [ ] Améliorer les messages d'erreur

**Estimation:** 3-4 heures

---

### 7. Prélèvement Automatique des Mensualités de Crédit

**Statut:** ❌ Non implémenté

**Description:**
Actuellement, les paiements de crédit sont manuels (via conseiller). Le système devrait prélever automatiquement les mensualités.

**Fichiers concernés:**
- [`application/use-cases/credit/ProcessAutomaticPaymentUseCase.ts`](application/use-cases/credit/ProcessAutomaticPaymentUseCase.ts) (à créer)
- [`infrastructure/in-memory-api/cron/creditPaymentScheduler.ts`](infrastructure/in-memory-api/cron/creditPaymentScheduler.ts) (à créer)
- [`domain/entities/CreditEntity.ts`](domain/entities/CreditEntity.ts) (existe)

**À implémenter:**
- [ ] Créer `ProcessAutomaticPaymentUseCase`:
  - Vérifier la date de prochain paiement
  - Débiter le compte du client
  - Mettre à jour le crédit (solde restant, prochaine échéance)
  - Créer une opération bancaire
  - Envoyer une notification
- [ ] Créer un scheduler (cron job):
  - Exécuter tous les jours à 00h00
  - Parcourir tous les crédits ACTIVE
  - Traiter ceux dont `nextPaymentDate <= aujourd'hui`
- [ ] Gérer les échecs de paiement:
  - Si solde insuffisant, marquer le crédit en DEFAULTED
  - Envoyer une notification d'alerte
  - Notifier le conseiller

**Estimation:** 4-5 heures

---

### 8. Historique des Paiements de Crédit

**Statut:** ❌ Non implémenté

**Description:**
Les clients et conseillers devraient pouvoir consulter l'historique complet des paiements effectués pour chaque crédit.

**Fichiers concernés:**
- [`domain/entities/CreditPaymentEntity.ts`](domain/entities/CreditPaymentEntity.ts) (à créer)
- [`application/repositories/CreditPaymentRepositoryInterface.ts`](application/repositories/CreditPaymentRepositoryInterface.ts) (à créer)
- [`infrastructure/repositories/in-memory/CreditPaymentRepositoryInMemory.ts`](infrastructure/repositories/in-memory/CreditPaymentRepositoryInMemory.ts) (à créer)
- [`infrastructure/nextjs-frontend/app/credits/[id]/page.tsx`](infrastructure/nextjs-frontend/app/credits/[id]/page.tsx) (à créer)

**À implémenter:**

#### Domain
- [ ] Créer `CreditPaymentEntity`:
  ```typescript
  {
    id: number,
    creditId: number,
    amount: Amount,
    paymentDate: Date,
    remainingBalance: Amount,
    status: 'COMPLETED' | 'FAILED'
  }
  ```

#### Backend
- [ ] Créer repository et use case pour sauvegarder les paiements
- [ ] Modifier `ProcessPaymentUseCase` pour enregistrer chaque paiement
- [ ] Endpoint `GET /api/credits/:id/payments`

#### Frontend
- [ ] Page détail d'un crédit avec tableau des paiements
- [ ] Graphique d'évolution du solde restant
- [ ] Export PDF du relevé de crédit

**Estimation:** 4-5 heures

---

## 🟢 Bonus (Fonctionnalités Optionnelles)

### 9. CQRS (Command Query Responsibility Segregation)

**Statut:** ❌ Non implémenté

**Description:**
Séparer les opérations de lecture (Queries) et d'écriture (Commands) pour préparer une architecture scalable.

**À implémenter:**
- [ ] Créer dossier `application/commands/` pour les opérations d'écriture
- [ ] Créer dossier `application/queries/` pour les opérations de lecture
- [ ] Refactoriser les Use Cases existants
- [ ] Implémenter un bus de commandes
- [ ] Implémenter un bus de requêtes
- [ ] Documentation de l'architecture CQRS

**Estimation:** 10-15 heures

---

### 10. Event Sourcing

**Statut:** ❌ Non implémenté

**Description:**
Sauvegarder tous les événements du système pour permettre un "retour dans le temps" et une reconstruction de l'état.

**À implémenter:**
- [ ] Créer `domain/events/` avec tous les événements métier:
  - `AccountCreatedEvent`
  - `TransferExecutedEvent`
  - `OrderPlacedEvent`
  - etc.
- [ ] Créer un Event Store (base de données d'événements)
- [ ] Implémenter des projections pour reconstruire l'état
- [ ] Créer des snapshots pour optimiser les performances
- [ ] Interface admin pour rejouer les événements

**Estimation:** 20-30 heures

---

### 11. Comparaison Multi-Frameworks Frontend

**Statut:** ❌ Non implémenté

**Description:**
Créer des versions du frontend avec différents frameworks pour comparer les avantages/inconvénients.

**À implémenter:**
- [ ] Version Angular (infrastructure/angular-frontend/)
- [ ] Version Solid.js (infrastructure/solidjs-frontend/)
- [ ] Document comparatif:
  - Performance (temps de chargement, bundle size)
  - Developer Experience (DX)
  - Courbe d'apprentissage
  - Écosystème et communauté
  - Cas d'usage recommandés

**Estimation:** 40-60 heures (par framework)

---

## 📊 Récapitulatif

| Priorité | Tâches | Estimation Totale |
|----------|--------|-------------------|
| 🔴 Haute | 5 tâches | 17-23 heures |
| 🟡 Moyenne | 3 tâches | 11-14 heures |
| 🟢 Bonus | 3 tâches | 70-105 heures |

**Total (sans bonus):** 28-37 heures de développement

---

## 🎯 Ordre de Réalisation Recommandé

1. **Endpoints Backend Crédits** (3-4h) - Débloquer la fonctionnalité existante
2. **Modification/Suppression Comptes** (3-4h) - Fonctionnalité core manquante
3. **Interface Admin Actions** (4-5h) - Compléter la gestion des actions
4. **Transfert Discussions** (3-4h) - Améliorer la messagerie
5. **Confirmation Email** (4-6h) - Sécurité et conformité
6. **Amélioration Virements Externes** (3-4h) - UX
7. **Prélèvement Automatique Crédits** (4-5h) - Automatisation
8. **Historique Paiements Crédits** (4-5h) - Traçabilité

---

## 📝 Notes

- Toutes les estimations sont données pour un développeur expérimenté
- Les tests unitaires ne sont pas inclus dans les estimations (ajouter ~30%)
- La documentation technique n'est pas incluse (ajouter ~20%)
- Les bonus (CQRS, Event Sourcing) sont des projets à part entière

---

**Dernière mise à jour:** 7 janvier 2026

