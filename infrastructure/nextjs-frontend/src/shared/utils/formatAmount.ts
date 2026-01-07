/**
 * Utilitaires de formatage de montants - Shared Layer
 */

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatIban = (iban: string): string => {
  // Format IBAN: FR76 XXXX XXXX XXXX XXXX XXXX XXX
  return iban.replace(/(.{4})/g, '$1 ').trim();
};

