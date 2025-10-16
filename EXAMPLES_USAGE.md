# 🏦 AVENIR Bank - Exemples d'Utilisation

## 📋 TransferData et OperationEntity

### Exemple 1 : Création d'un TransferData

```typescript
import { TransferData } from "domain/values/TransferData";
import { Iban } from "domain/values/Iban";
import { CountryCode } from "domain/values/CountryCode";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { AccountNumber } from "domain/values/AccountNumber";
import { RibKey } from "domain/values/RibKey";

// Création des IBANs
const senderIban = Iban.create(
  CountryCode.create("FR"),
  BankCode.create("12345"),
  BranchCode.create("67890"),
  AccountNumber.generateAccountNumber(),
  RibKey.create("12")
);

const receiverIban = Iban.create(
  CountryCode.create("FR"),
  BankCode.create("12345"),
  BranchCode.create("67890"),
  AccountNumber.generateAccountNumber(),
  RibKey.create("34")
);

// Création des données de transfert
const transferData = TransferData.create(
  "Dupont",
  "Jean",
  senderIban,
  "Martin",
  "Marie",
  receiverIban,
  true, // virement instantané
  "Remboursement prêt"
);

if (transferData instanceof Error) {
  console.error("Erreur:", transferData.message);
} else {
  console.log("Expéditeur:", transferData.getSenderName());
  console.log("Destinataire:", transferData.getReceiverName());
  console.log("Virement instantané:", transferData.isInstantTransfer());
  console.log("Raison:", transferData.getReason());
}
```

### Exemple 2 : Création d'une OperationEntity

```typescript
import { OperationEntity } from "domain/entities/OperationEntity";
import { Amount } from "domain/values/Amount";

// Création du montant
const amount = Amount.create(150.50);

if (amount instanceof Error) {
  console.error("Erreur de montant:", amount.message);
} else {
  // Création de l'opération
  const operation = OperationEntity.create(
    12345,
    transferData, // TransferData créé précédemment
    amount
  );

  if (operation instanceof Error) {
    console.error("Erreur d'opération:", operation.message);
  } else {
    console.log("ID:", operation.getId());
    console.log("Montant:", operation.getAmount().toString());
    console.log("Statut:", operation.getStatus());
    console.log("Virement intrabancaire:", operation.isIntrabankTransfer());
  }
}
```

### Exemple 3 : Exécution d'une opération

```typescript
// Compléter l'opération
const completedOperation = operation.complete();
console.log("Statut après complétion:", completedOperation.getStatus());
console.log("Date de complétion:", completedOperation.getCompletedAt());
console.log("Durée d'exécution:", completedOperation.getDuration(), "ms");

// Ou échouer l'opération
const failedOperation = operation.fail();
console.log("Statut après échec:", failedOperation.getStatus());
```

### Exemple 4 : Utilisation des cas d'usage

```typescript
import { CreateTransferUseCase } from "application/use-cases/operation/CreateTransferUseCase";
import { ExecuteTransferUseCase } from "application/use-cases/operation/ExecuteTransferUseCase";

// Création d'un virement
const createTransferUseCase = new CreateTransferUseCase(
  operationRepository,
  accountRepository
);

const operation = await createTransferUseCase.execute(
  "Jean",
  "Dupont",
  "FR1420041010050500013M02606",
  "Marie",
  "Martin",
  "FR1420041010050500013M02607",
  150.50,
  "Remboursement",
  true
);

if (operation instanceof Error) {
  console.error("Erreur de création:", operation.message);
} else {
  console.log("Virement créé avec l'ID:", operation.getId());
  
  // Exécution du virement
  const executeTransferUseCase = new ExecuteTransferUseCase(
    operationRepository,
    accountRepository
  );
  
  const executedOperation = await executeTransferUseCase.execute(operation.getId());
  
  if (executedOperation instanceof Error) {
    console.error("Erreur d'exécution:", executedOperation.message);
  } else {
    console.log("Virement exécuté avec succès!");
  }
}
```

## 🔧 Améliorations Apportées

### TransferData
- ✅ **Validation robuste** des noms et IBANs
- ✅ **Messages d'erreur en français** avec TransferDataError
- ✅ **Méthodes utilitaires** pour accéder aux données
- ✅ **Nettoyage automatique** des chaînes (trim)
- ✅ **Validation de la raison** si fournie

### OperationEntity
- ✅ **Type OperationStatus** pour plus de sécurité
- ✅ **Validation des données** à la création
- ✅ **Gestion des états** avec vérifications
- ✅ **Date de complétion** pour le suivi
- ✅ **Méthodes utilitaires** pour les informations de transfert
- ✅ **Détection des virements intrabancaires**
- ✅ **Calcul de la durée** d'exécution

### Cas d'Usage
- ✅ **CreateTransferUseCase** - Création sécurisée des virements
- ✅ **ExecuteTransferUseCase** - Exécution avec gestion d'erreurs
- ✅ **Vérification des fonds** avant et pendant l'exécution
- ✅ **Gestion transactionnelle** des comptes

## 🎯 Fonctionnalités Métier

### Virements Intrabancaires
- Détection automatique des virements entre comptes de la même banque
- Optimisation possible pour les virements internes

### Virements Instantanés
- Support des virements instantanés
- Traitement prioritaire possible

### Suivi des Opérations
- Historique complet des opérations
- Durée d'exécution mesurée
- Statuts détaillés

### Sécurité
- Validation stricte des données
- Vérification des fonds
- Gestion d'erreurs robuste

---

*Ces exemples montrent l'utilisation pratique des entités modifiées dans le contexte bancaire AVENIR* 🏦
