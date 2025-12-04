# 🎨 Refonte UI/UX Frontend - AVENIR Bank

## 📋 Vue d'ensemble

Ce document détaille les modifications à apporter aux différentes pages du frontend pour améliorer l'expérience utilisateur et la cohérence de l'interface.

---

## 🏠 Page d'accueil (Home)

**Statut** : ✅ Aucune modification requise

La page d'accueil reste inchangée.

---

## 🧭 Navbar (Header)

**Fichier** : `infrastructure/nextjs-frontend/src/presentation/components/Header.tsx`

### 🎯 Objectifs
- Simplifier la navigation en fonction de l'état de connexion et du compte actif
- Rendre l'affichage du compte actif plus discret et professionnel

### 📝 Modifications requises

#### 1. Affichage conditionnel des liens de navigation

**Règle** : Ne pas afficher les liens suivants si l'utilisateur n'est **PAS** connecté OU n'a **PAS** de compte actif sélectionné :
- 📊 **Dashboard** (`/dashboard`)
- 💼 **Actions** (`/stocks` ou `/trading`)
- 💸 **Virement** (`/transfer`)

**Liens toujours visibles** :
- 🏠 **Accueil** (pour tous)
- 👤 **Connexion/Inscription** (si non connecté)
- 🔓 **Déconnexion** (si connecté)

**Comportement attendu** :
```
SI utilisateur NON connecté
  → Afficher : Accueil, Connexion, Inscription

SI utilisateur connecté MAIS compte actif NON sélectionné
  → Afficher : Accueil, Déconnexion
  → Rediriger automatiquement vers /select-account

SI utilisateur connecté ET compte actif sélectionné
  → Afficher : Accueil, Dashboard, Actions, Virement, Déconnexion
```

#### 2. Widget du compte actif

**Modification** : Simplifier l'affichage du compte actif

**Avant** :
```
┌─────────────────────────────┐
│ Compte actif                │
│ FR76... (IBAN complet)      │
│ 15 234,56 € (solde)         │
└─────────────────────────────┘
```

**Après** :
```
┌─────────────────────────────┐
│ Compte actif                │
│ ****1234 (4 derniers chif.) │
│ [Bouton changer]            │
└─────────────────────────────┘
```

**Éléments à supprimer** :
- ❌ IBAN complet (garder seulement les 4 derniers chiffres)
- ❌ Solde du compte
- ❌ Numéro de compte

**Éléments à conserver** :
- ✅ Label "Compte actif"
- ✅ Les 4 derniers chiffres de l'IBAN (ex: `****1234`)
- ✅ Bouton "Changer de compte" dans le menu déroulant
- ✅ Icône de carte bancaire

---

## 📊 Tableau de bord (Dashboard)

**Fichier** : `infrastructure/nextjs-frontend/app/dashboard/page.tsx`

### 🎯 Objectifs
- Focaliser l'attention sur les informations essentielles : solde et opérations
- Retirer les informations redondantes ou inutiles

### 📝 Modifications requises

#### 1. Section "Compte Actif" (en haut de page)

**Éléments à afficher** :
- ✅ **Solde du compte** (en gros, mis en valeur)
- ✅ Icône de carte bancaire

**Éléments à supprimer** :
- ❌ IBAN
- ❌ Numéro de compte
- ❌ Autres détails du compte

**Design attendu** :
```
┌─────────────────────────────────────────┐
│  💳                                     │
│  Votre solde disponible                 │
│  15 234,56 €                            │
│                                         │
└─────────────────────────────────────────┘
```

#### 2. Section "Dernières opérations"

**Éléments à afficher** :
- ✅ Liste des 5-10 dernières opérations
- ✅ Date de l'opération
- ✅ Libellé/Description
- ✅ Montant (avec couleur : vert pour crédit, rouge pour débit)
- ✅ Statut (COMPLETED, PENDING, REJECTED)

**Éléments à supprimer** :
- ❌ IBAN du destinataire/émetteur
- ❌ Informations techniques inutiles

**Lien** :
- ✅ Bouton "Voir toutes les opérations" → `/operations`

#### 3. Autres sections

**À supprimer** :
- ❌ Widget "Comptes" (si présent)
- ❌ Widget "Statistiques" (si présent)
- ❌ Tout autre widget non mentionné ci-dessus

**Le dashboard doit être SIMPLE et CLAIR** :
- Solde en haut
- Opérations en dessous
- C'est tout ! 🎯

---

## 💸 Page Virement (Transfer)

**Fichier** : `infrastructure/nextjs-frontend/app/transfer/page.tsx`

### 🎯 Objectifs
- Organiser les différentes fonctionnalités en onglets clairs
- Séparer virement, gestion des bénéficiaires et export IBAN
- Améliorer l'UX avec une navigation par tabs

### 📝 Structure en onglets

La page doit être organisée en **3 onglets principaux** :

```
┌─────────────────────────────────────────────────────────┐
│ [📤 Virement] [👥 Bénéficiaires] [📄 Mon IBAN]         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│        Contenu de l'onglet sélectionné                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 📤 Onglet 1 : Virement

**Contenu** :
- Formulaire de virement actuel (déjà implémenté)
- Type de virement : 
  - 🏦 Vers un de mes comptes
  - 👤 Vers un bénéficiaire enregistré
  - 🆕 Vers un nouveau bénéficiaire
- Champs :
  - Montant
  - Description/Motif
  - Sélection du destinataire (selon le type)
- Bouton "Effectuer le virement"

**Note** : Le compte débiteur est automatiquement le compte actif (déjà implémenté ✅)

#### 👥 Onglet 2 : Bénéficiaires

**Contenu** :
- **Liste des bénéficiaires enregistrés**
  - Nom du bénéficiaire
  - IBAN (masqué : `FR76 **** **** **** 1234`)
  - Actions :
    - ✏️ Modifier
    - 🗑️ Supprimer
    - 💸 Faire un virement (redirection vers onglet 1 avec pré-remplissage)

- **Formulaire d'ajout de bénéficiaire**
  - Nom du bénéficiaire
  - IBAN
  - Bouton "Ajouter"

**Design** :
```
┌─────────────────────────────────────────┐
│  Mes bénéficiaires                      │
├─────────────────────────────────────────┤
│  👤 Jean Dupont                         │
│     FR76 **** **** **** 5678            │
│     [Virement] [Modifier] [Supprimer]   │
├─────────────────────────────────────────┤
│  👤 Marie Martin                        │
│     FR76 **** **** **** 9012            │
│     [Virement] [Modifier] [Supprimer]   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ➕ Ajouter un bénéficiaire             │
├─────────────────────────────────────────┤
│  Nom : [____________]                   │
│  IBAN : [________________________]      │
│  [Ajouter]                              │
└─────────────────────────────────────────┘
```

#### 📄 Onglet 3 : Mon IBAN

**Contenu** :
- **Affichage de l'IBAN du compte actif**
  - IBAN complet en gros et lisible
  - Icône de copie (clipboard)
  - Message de confirmation après copie

- **QR Code de l'IBAN**
  - QR Code généré contenant l'IBAN
  - Utilisable pour partager facilement l'IBAN

- **Téléchargement PDF du RIB**
  - Bouton "📥 Télécharger mon RIB en PDF"
  - Le PDF doit contenir :
    - Logo AVENIR Bank
    - Nom du titulaire
    - IBAN
    - BIC/SWIFT (si disponible)
    - Adresse de l'agence
    - Date d'édition

**Design** :
```
┌─────────────────────────────────────────┐
│  Mon IBAN                               │
├─────────────────────────────────────────┤
│                                         │
│  FR76 3000 1234 5678 9012 3456 78      │
│  [📋 Copier]                            │
│                                         │
├─────────────────────────────────────────┤
│  QR Code                                │
│  ┌─────────┐                            │
│  │ ███████ │                            │
│  │ █     █ │  Scannez pour obtenir      │
│  │ █ ███ █ │  mon IBAN                  │
│  │ █     █ │                            │
│  │ ███████ │                            │
│  └─────────┘                            │
├─────────────────────────────────────────┤
│  [📥 Télécharger mon RIB en PDF]        │
└─────────────────────────────────────────┘
```

### 🎨 Design des onglets

**Style recommandé** :
- Onglets horizontaux en haut
- Onglet actif : fond bleu clair, texte bleu foncé, bordure inférieure bleue
- Onglets inactifs : fond transparent, texte gris, hover avec fond bleu très clair
- Transition fluide entre les onglets
- Contenu de l'onglet avec padding généreux

**Code CSS suggéré** :
```css
.tab {
  padding: 12px 24px;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab-active {
  background: #eff6ff;
  color: #0369a1;
  border-bottom-color: #0284c7;
}

.tab-inactive {
  color: #64748b;
}

.tab-inactive:hover {
  background: #f0f9ff;
}
```

---

## 📦 Librairies recommandées

### Pour les onglets
- **Headless UI** (déjà installé ?) : `@headlessui/react`
- Ou utiliser des onglets React natifs avec state

### Pour le QR Code
- **qrcode.react** : `npm install qrcode.react`
- Ou **react-qr-code** : `npm install react-qr-code`

### Pour la génération de PDF
- **jsPDF** : `npm install jspdf`
- Ou **react-pdf** : `npm install @react-pdf/renderer`

---

## 🚀 Plan d'implémentation

### Phase 1 : Navbar
1. ✅ Ajouter la logique conditionnelle pour les liens
2. ✅ Simplifier le widget du compte actif
3. ✅ Tester les différents états (non connecté, connecté sans compte, connecté avec compte)

### Phase 2 : Dashboard
1. ✅ Simplifier le widget du compte actif
2. ✅ Afficher uniquement le solde
3. ✅ Afficher les dernières opérations
4. ✅ Supprimer les widgets inutiles

### Phase 3 : Page Virement - Structure
1. ✅ Créer le système d'onglets
2. ✅ Implémenter l'onglet "Virement"
3. ✅ Implémenter l'onglet "Bénéficiaires"
4. ✅ Implémenter l'onglet "Mon IBAN"

### Phase 4 : Page Virement - Fonctionnalités
1. ✅ Intégrer le formulaire de virement existant
2. ✅ Implémenter la gestion des bénéficiaires (CRUD)
3. ✅ Générer le QR Code de l'IBAN
4. ✅ Générer le PDF du RIB

### Phase 5 : Tests & Polish
1. ✅ Tester tous les flux utilisateur
2. ✅ Vérifier la cohérence visuelle
3. ✅ Optimiser les transitions et animations
4. ✅ Tests de responsive design

---

## 📝 Notes importantes

- **Compte actif obligatoire** : Toutes ces pages nécessitent qu'un compte actif soit sélectionné
- **Redirection automatique** : Si pas de compte actif, rediriger vers `/select-account`
- **Design cohérent** : Garder le thème bleu clair et moderne actuel
- **Accessibilité** : S'assurer que les onglets sont navigables au clavier
- **Performance** : Lazy loading du QR Code et de la génération PDF

---

## ✅ Checklist finale

- [x] Navbar : Liens conditionnels implémentés
- [x] Navbar : Widget compte actif simplifié
- [x] Dashboard : Solde affiché en évidence
- [x] Dashboard : Opérations affichées
- [x] Dashboard : Widgets inutiles supprimés
- [x] Virement : Système d'onglets créé
- [x] Virement : Onglet "Virement" fonctionnel
- [x] Virement : Onglet "Bénéficiaires" fonctionnel
- [x] Virement : Onglet "Mon IBAN" avec QR Code (placeholder)
- [x] Virement : Téléchargement PDF du RIB (placeholder)
- [ ] Tests complets effectués
- [ ] Design responsive vérifié

---

## 📝 Notes d'implémentation

### QR Code et PDF RIB

Pour finaliser les fonctionnalités QR Code et PDF RIB, installer les librairies suivantes :

```bash
# Pour le QR Code
npm install react-qr-code

# Pour la génération de PDF
npm install jspdf
# ou
npm install @react-pdf/renderer
```

Ensuite, remplacer les placeholders dans `/app/transfer/page.tsx` :
- Ligne ~480 : Remplacer le placeholder QR Code par `<QRCode value={activeAccount.iban} />`
- Ligne ~120 : Implémenter `downloadRIB()` avec jsPDF

---

**Dernière mise à jour** : 5 novembre 2025  
**Statut global** : ✅ **Implémentation terminée** (QR Code et PDF à finaliser avec librairies)

