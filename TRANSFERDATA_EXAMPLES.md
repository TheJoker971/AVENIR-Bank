# 💸 TransferData - Exemples d'Utilisation

## ✅ Utilisation Correcte de la Raison Facultative

### Exemple 1 : Virement sans raison (valide)

```typescript
import { TransferData } from "domain/values/TransferData";
import { Iban } from "domain/values/Iban";

// Virement simple sans raison
const transferData = TransferData.create(
  "Dupont",
  "Jean",
  senderIban,
  "Martin",
  "Marie",
  receiverIban,
  false, // pas instantané
  undefined // pas de raison - VALIDE
);

if (transferData instanceof Error) {
  console.error("Erreur:", transferData.message);
} else {
  console.log("Virement créé sans raison");
  console.log("A une raison:", transferData.hasReason()); // false
  console.log("Raison:", transferData.getReason()); // undefined
}
```

### Exemple 2 : Virement avec raison (valide)

```typescript
// Virement avec raison
const transferDataWithReason = TransferData.create(
  "Dupont",
  "Jean",
  senderIban,
  "Martin",
  "Marie",
  receiverIban,
  true, // instantané
  "Remboursement prêt" // avec raison - VALIDE
);

if (transferDataWithReason instanceof Error) {
  console.error("Erreur:", transferDataWithReason.message);
} else {
  console.log("Virement créé avec raison");
  console.log("A une raison:", transferDataWithReason.hasReason()); // true
  console.log("Raison:", transferDataWithReason.getReason()); // "Remboursement prêt"
}
```

### Exemple 3 : Virement avec raison vide (invalide)

```typescript
// Virement avec raison vide - INVALIDE
const transferDataEmptyReason = TransferData.create(
  "Dupont",
  "Jean",
  senderIban,
  "Martin",
  "Marie",
  receiverIban,
  false,
  "" // raison vide - INVALIDE
);

if (transferDataEmptyReason instanceof Error) {
  console.error("Erreur:", transferDataEmptyReason.message);
  // Affiche: "La raison ne peut pas être vide si elle est fournie"
} else {
  console.log("Virement créé");
}
```

### Exemple 4 : Virement avec raison null (valide)

```typescript
// Virement avec raison null - VALIDE (traité comme undefined)
const transferDataNullReason = TransferData.create(
  "Dupont",
  "Jean",
  senderIban,
  "Martin",
  "Marie",
  receiverIban,
  false,
  null as any // raison null - VALIDE (traité comme undefined)
);

if (transferDataNullReason instanceof Error) {
  console.error("Erreur:", transferDataNullReason.message);
} else {
  console.log("Virement créé avec raison null");
  console.log("A une raison:", transferDataNullReason.hasReason()); // false
}
```

## 🔧 Comportement de la Validation

### ✅ Cas Valides
- `reason` est `undefined` → Pas de validation, raison optionnelle
- `reason` est `null` → Traité comme `undefined`, pas de validation
- `reason` est une chaîne non vide → Validation OK

### ❌ Cas Invalides
- `reason` est une chaîne vide `""` → Erreur
- `reason` est une chaîne avec seulement des espaces `"   "` → Erreur

## 📋 Méthodes Utilitaires

```typescript
const transferData = TransferData.create(/* ... */);

// Vérifier si une raison est présente
if (transferData.hasReason()) {
  console.log("Raison du virement:", transferData.getReason());
} else {
  console.log("Virement sans raison spécifique");
}

// Accès direct à la raison (peut être undefined)
const reason = transferData.getReason();
if (reason) {
  console.log("Raison:", reason);
}
```

## 🎯 Cas d'Usage Pratiques

### Virement Personnel
```typescript
// Virement entre amis - pas de raison nécessaire
const personalTransfer = TransferData.create(
  "Dupont",
  "Jean",
  senderIban,
  "Martin",
  "Marie",
  receiverIban,
  false
  // Pas de raison - normal pour un virement personnel
);
```

### Virement Commercial
```typescript
// Virement commercial - raison importante
const businessTransfer = TransferData.create(
  "Entreprise SARL",
  "Société",
  senderIban,
  "Fournisseur",
  "ABC Corp",
  receiverIban,
  true, // instantané
  "Paiement facture #12345" // Raison claire
);
```

### Virement de Remboursement
```typescript
// Remboursement - raison explicite
const refundTransfer = TransferData.create(
  "Client",
  "Particulier",
  senderIban,
  "Banque",
  "AVENIR",
  receiverIban,
  false,
  "Remboursement frais de tenue de compte" // Raison détaillée
);
```

---

*La raison est maintenant correctement gérée comme un champ facultatif dans TransferData* ✅
