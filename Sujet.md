# 🏦 AVENIR Bank  
**Alliance de Valeurs Économiques et Nationales Investies Responsablemen**

## 🎯 Objectif du projet
Développer une **application web bancaire** moderne permettant aux clients de gérer leurs **liquidités, épargne et investissements**, tout en intégrant une architecture propre et évolutive basée sur **TypeScript** et la **Clean Architecture**.

L’objectif est de proposer une alternative innovante aux banques traditionnelles grâce à une gestion fluide, transparente et automatisée des opérations bancaires.

---

## 👥 Rôles utilisateurs

### 👤 1. Client
- **Authentification :**
  - Inscription avec confirmation par e-mail.
  - Création automatique d’un premier compte.
- **Comptes :**
  - Création de plusieurs comptes avec génération d’un **IBAN unique** et valide.
  - Modification du nom ou suppression du compte.
- **Opérations :**
  - Virements **intrabancaires** entre comptes de la banque.
  - Le solde reflète la somme des débits/crédits.
- **Épargne (Livret A) :**
  - Ouverture d’un compte d’épargne rémunéré à un taux fixé par le directeur.
  - Intérêts calculés **quotidiennement** selon le taux en vigueur.
- **Investissements (Actions) :**
  - Enregistrement d’ordres d’achat et de vente.
  - Cours déterminé par le **prix d’équilibre** entre offre et demande.
  - Frais fixes : **1€ à l’achat et à la vente**.

---

### 👔 2. Directeur de banque
- **Authentification** sécurisée (accès restreint).
- **Gestion des comptes clients :**
  - Création, modification, suppression, bannissement.
- **Fixation du taux d’épargne :**
  - Modification du taux → notification automatique à tous les clients concernés.
- **Gestion des actions :**
  - Création, modification et suppression des actions disponibles.
  - Impossible de modifier manuellement le cours d’une action.

---

### 🧑‍💼 3. Conseiller bancaire
- **Authentification**.
- **Crédits :**
  - Attribution de crédits aux clients.
  - Taux annuel, assurance obligatoire et mensualités à **paiement constant**.
- **Messagerie instantanée :**
  - Réponse aux messages clients.
  - Tous les conseillers voient les messages non traités.
  - Le premier à répondre devient le **conseiller attitré**.
  - Possibilité de **transférer** une discussion à un autre conseiller.

---

## ⚙️ Contraintes techniques

### Langage
- **TypeScript** (back-end et front-end).

### Architecture
- **Clean Architecture :**
  - Domain (Entities)
  - Application (Use Cases)
  - Interface (API/UI)
  - Infrastructure (Base de données, frameworks, adaptateurs)

### Adaptateurs
- **Base de données :**
  - `In-memory` pour les tests.
  - `SQL` ou `NoSQL` pour la production.
- **Frameworks backend :**
  - Deux versions : `Nest.js` et `Express` (ou `Fastify`).

### Code Quality
- Respect des principes **SOLID** et du **Clean Code**.
- Code documenté et maintenable.

---

## 💡 Bonus (facultatifs)

### 1. CQRS
- Séparation des **Commandes (write)** et **Queries (read)**.
- Prépare le terrain pour un futur **Event Sourcing**.

### 2. Event Sourcing
- Sauvegarde et relecture des événements passés.
- Permet un **retour dans le temps**.
- Compatible avec une **architecture microservices**.

### 3. Front-end multi-frameworks
- Comparatif entre plusieurs frameworks :
  - **React**
  - **Angular**
  - **Solid.js**
- Analyse des avantages/inconvénients de chacun.

---

## 📦 Technologies principales
- **TypeScript**
- **Node.js**
- **Nest.js / Express**
- **React / Angular / Solid.js**
- **SQL / MongoDB**
- **Docker**
- **Git**
- **Clean Architecture**

---

## 🧩 Modules métiers
- Comptes bancaires (création, suppression, IBAN)
- Opérations (débit, crédit, virement)
- Épargne (calcul d’intérêts quotidiens)
- Investissements (actions, ordres, carnet d’ordres)
- Crédits (calcul des mensualités constantes)
- Messagerie instantanée (client ↔ conseiller)
- Administration (directeur de banque, taux, notifications)

---

## 📆 Objectif pédagogique
Ce projet a pour but de mettre en œuvre :
- Les principes de **Clean Architecture** et **Clean Code**.
- Les bonnes pratiques de **programmation orientée domaine (DDD)**.
- L’application concrète de **TypeScript** sur l’ensemble du stack.
- Une approche modulaire et extensible intégrant la **blockchain** à terme.

---

